import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

interface RemotePeer {
  socketId: string;
  stream: MediaStream | null;
  userId?: string;
  username?: string;
  audio?: boolean;
  video?: boolean;
  state?: RTCPeerConnectionState;
}

interface UseWebRTCOpts {
  roomId?: string;
  userId?: string;
  username?: string;
  signalingUrl?: string;
  enableAudio?: boolean;
  enableVideo?: boolean;
}

// Basic STUN servers; for production include TURN.
const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

export function useWebRTC({
  roomId,
  userId,
  username,
  signalingUrl = (
    import.meta.env.VITE_SIGNALING_URL ||
    import.meta.env.VITE_API_URL ||
    (typeof window !== "undefined" ? window.location.origin : "")
  ).replace(/\/$/, ""),
  enableAudio = true,
  enableVideo = true,
}: UseWebRTCOpts) {
  const socketRef = useRef<Socket | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const [remotePeers, setRemotePeers] = useState<RemotePeer[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debug = import.meta.env.VITE_WEBRTC_DEBUG === "1";

  const addRemotePeer = useCallback(
    (socketId: string, meta?: Partial<RemotePeer>) => {
      setRemotePeers((prev) => {
        const existing = prev.find((p) => p.socketId === socketId);
        if (existing) {
          return prev.map((p) =>
            p.socketId === socketId ? { ...p, ...meta } : p
          );
        }
        return [...prev, { socketId, stream: null, ...meta }];
      });
    },
    []
  );

  const updatePeerMeta = useCallback(
    (socketId: string, meta: Partial<RemotePeer>) => {
      setRemotePeers((prev) =>
        prev.map((p) => (p.socketId === socketId ? { ...p, ...meta } : p))
      );
    },
    []
  );

  const setRoster = useCallback((list: { socketId: string }[]) => {
    setRemotePeers((prev) => {
      // Preserve existing streams if present
      const map = new Map(prev.map((p) => [p.socketId, p.stream] as const));
      return list.map((p) => ({
        socketId: p.socketId,
        stream: map.get(p.socketId) || null,
      }));
    });
  }, []);

  const updateRemoteStream = useCallback(
    (socketId: string, stream: MediaStream) => {
      setRemotePeers((prev) =>
        prev.map((p) => (p.socketId === socketId ? { ...p, stream } : p))
      );
    },
    []
  );

  const removeRemotePeer = useCallback((socketId: string) => {
    setRemotePeers((prev) => prev.filter((p) => p.socketId !== socketId));
  }, []);

  // Initialize media + socket
  useEffect(() => {
    if (!roomId) return;
    let cancelled = false;
    const attempted: string[] = [];
    const currentSignaling = signalingUrl;
    const peersMapRefAtMount = peersRef.current;
    const tryConnect = (url: string) => {
      if (debug) console.debug("[RTC] Attempting signaling connection", url);
      attempted.push(url);
      const sock = io(url, {
        transports: ["websocket"],
        reconnectionAttempts: 2,
      });
      socketRef.current = sock;
      sock.on("connect_error", (e: Error) => {
        if (debug) console.debug("[RTC] connect_error", e.message, "url=", url);
        if (!cancelled) {
          const fallbacks = [
            typeof window !== "undefined" ? window.location.origin : undefined,
            "http://localhost:5000",
          ].filter(Boolean) as string[];
          const next = fallbacks.find((f) => !attempted.includes(f));
          if (next) {
            try {
              sock.close();
            } catch (closeErr) {
              if (debug) console.debug("[RTC] close error", closeErr);
            }
            tryConnect(next.replace(/\/$/, ""));
          } else {
            setError(e.message);
          }
        }
      });
      sock.on("connect", () => {
        if (debug)
          console.debug("[RTC] connected signaling", url, "socketId=", sock.id);
        // Register this client in the room with metadata so server can broadcast roster
        sock.emit("room:join", { roomId, userId, username });
      });
      // Existing participants list (IDs only) we should initiate offers to
      sock.on(
        "room:participants",
        ({ participants }: { participants: string[] }) => {
          if (debug) console.debug("[RTC] participants", participants);
          participants.forEach((pid) => {
            addRemotePeer(pid);
            createPeer(pid, true);
          });
        }
      );
      // Full roster with metadata (ensures setRoster used)
      sock.on(
        "room:roster",
        ({
          participants,
        }: {
          participants: {
            socketId: string;
            userId?: string;
            username?: string;
            audio?: boolean;
            video?: boolean;
          }[];
        }) => {
          if (debug) console.debug("[RTC] roster", participants);
          setRoster(participants);
          participants.forEach((p) =>
            updatePeerMeta(p.socketId, {
              userId: p.userId,
              username: p.username,
              audio: p.audio,
              video: p.video,
            })
          );
        }
      );
      sock.on("room:user-left", ({ socketId }: { socketId: string }) => {
        const pc = peersRef.current.get(socketId);
        if (pc) pc.close();
        peersRef.current.delete(socketId);
        removeRemotePeer(socketId);
      });
      sock.on(
        "webrtc:offer",
        async ({
          from,
          sdp,
        }: {
          from: string;
          sdp: RTCSessionDescriptionInit;
        }) => {
          if (debug) console.debug("[RTC] Offer received from", from);
          addRemotePeer(from);
          const pc = createPeer(from, false);
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          sock.emit("webrtc:answer", { target: from, sdp: answer, roomId });
        }
      );
      sock.on(
        "webrtc:answer",
        async ({
          from,
          sdp,
        }: {
          from: string;
          sdp: RTCSessionDescriptionInit;
        }) => {
          if (debug) console.debug("[RTC] Answer received from", from);
          const pc = peersRef.current.get(from);
          if (!pc) return;
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        }
      );
      sock.on(
        "webrtc:ice-candidate",
        async ({
          from,
          candidate,
        }: {
          from: string;
          candidate: RTCIceCandidateInit;
        }) => {
          if (debug) console.debug("[RTC] ICE candidate from", from);
          const pc = peersRef.current.get(from);
          if (!pc || !candidate) return;
          try {
            await pc.addIceCandidate(candidate);
          } catch (err) {
            console.warn("ICE add error", err);
          }
        }
      );
      sock.on(
        "media:state",
        ({
          socketId,
          audio,
          video,
        }: {
          socketId: string;
          audio: boolean;
          video: boolean;
        }) => {
          if (debug) console.debug("[RTC] media state", socketId, audio, video);
          updatePeerMeta(socketId, { audio, video });
        }
      );
    };
    (async () => {
      try {
        setIsConnecting(true);
        localStreamRef.current = await navigator.mediaDevices.getUserMedia({
          audio: enableAudio,
          video: enableVideo,
        });
        if (cancelled) return;
        tryConnect(currentSignaling);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setIsConnecting(false);
      }
    })();

    return () => {
      cancelled = true;
      const ls = localStreamRef.current;
      ls?.getTracks().forEach((t) => t.stop());
      peersMapRefAtMount.forEach((pc) => pc.close());
      peersMapRefAtMount.clear();
      const s = socketRef.current;
      s?.emit("room:leave", { roomId });
      s?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);
  function createPeer(peerSocketId: string, isInitiator: boolean) {
    const existing = peersRef.current.get(peerSocketId);
    if (existing) return existing;

    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    peersRef.current.set(peerSocketId, pc);
    addRemotePeer(peerSocketId);

    // Attach local tracks
    localStreamRef.current?.getTracks().forEach((track) => {
      if (localStreamRef.current) pc.addTrack(track, localStreamRef.current);
    });

    pc.ontrack = (e) => {
      const [remoteStream] = e.streams;
      if (remoteStream) {
        if (debug) console.debug("[RTC] Remote track from", peerSocketId);
        updateRemoteStream(peerSocketId, remoteStream);
      }
    };

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socketRef.current?.emit("webrtc:ice-candidate", {
          target: peerSocketId,
          candidate: e.candidate,
          roomId,
        });
      }
    };

    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      updatePeerMeta(peerSocketId, { state });
      if (debug) console.debug("[RTC] connection state", peerSocketId, state);
      if (["failed", "closed", "disconnected"].includes(state)) {
        removeRemotePeer(peerSocketId);
      }
    };

    if (isInitiator) {
      (async () => {
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          if (debug) console.debug("[RTC] Sending offer to", peerSocketId);
          socketRef.current?.emit("webrtc:offer", {
            target: peerSocketId,
            sdp: offer,
            roomId,
          });
        } catch (err) {
          console.warn("[RTC] Offer error", err);
        }
      })();
    }

    return pc;
  }

  const toggleTrack = (kind: "audio" | "video") => {
    const stream = localStreamRef.current;
    if (!stream) return false;
    const track = stream.getTracks().find((t) => t.kind === kind);
    if (!track) return false;
    track.enabled = !track.enabled;
    socketRef.current?.emit("media:toggle", {
      roomId,
      audio: kind === "audio" ? track.enabled : undefined,
      video: kind === "video" ? track.enabled : undefined,
    });
    return track.enabled;
  };

  return {
    socket: socketRef.current,
    remotePeers,
    localStream: localStreamRef.current,
    isConnecting,
    error,
    toggleAudio: () => toggleTrack("audio"),
    toggleVideo: () => toggleTrack("video"),
  };
}
