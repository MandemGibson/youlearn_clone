import { BiArrowBack, BiCopy } from "react-icons/bi";
import { useNavigate, useParams } from "react-router-dom";
import { useRoom } from "../../hooks/useRoom";
import { Chat } from "../../components";
import { useState, useEffect, useRef } from "react";
import { GoMute, GoUnmute } from "react-icons/go";
import { CiVideoOn, CiVideoOff } from "react-icons/ci";
import { useAuth } from "../../hooks/useAuth";
import { useWebRTC } from "../../hooks/useWebRTC";

const Room = () => {
  const { id } = useParams();
  const { rooms } = useRoom();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isCopied, setIsCopied] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [videoOn, setVideoOn] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const { remotePeers, localStream, toggleAudio, toggleVideo } = useWebRTC({
    roomId: id,
    userId: user?.id,
    username: user?.username || user?.email?.split("@")[0],
  });

  // Attach local stream
  useEffect(() => {
    if (localStream && videoRef.current) {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  const handleToggleMute = () => {
    const enabled = toggleAudio();
    setIsMuted(!enabled);
  };

  const handleToggleVideo = () => {
    const enabled = toggleVideo();
    setVideoOn(enabled);
  };

  const handleCopyRoomID = () => {
    if (rooms.length) {
      const room = rooms.find((room) => room.roomId === id);
      if (room?.roomId) {
        navigator.clipboard.writeText(room.roomId);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 1000);
      }
    }
  };

  const handleCloseRoom = () => {
    navigate("/main");
  };

  return (
    <main className="h-screen max-h-screen overflow-hidden bg-[#121212] flex flex-col">
      <div className="flex z-20 relative items-center justify-between p-3 border-b border-[#1f1f1f] bg-[#181818]">
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCloseRoom}
            className="flex items-center justify-center p-2 px-4 space-x-2 rounded-lg border border-[#2a2a2a] text-[#fafafa] hover:bg-[#262626]"
          >
            <BiArrowBack />
            <span>Exit</span>
          </button>
          <button
            onClick={handleCopyRoomID}
            className="flex items-center justify-center p-2 px-4 space-x-2 rounded-lg border border-[#2a2a2a] text-[#fafafa] hover:bg-[#262626]"
          >
            <span>{isCopied ? "Copied" : "Room ID"}</span>
            <BiCopy />
          </button>
        </div>
        <p className="text-[#fafafa] font-medium truncate max-w-[260px] text-center">
          {rooms.find((room) => room.roomId === id)?.name || id}
        </p>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleToggleMute}
            className="bg-[#262626] hover:bg-[#333] p-2 rounded-full"
          >
            {isMuted ? (
              <GoMute color="white" size={22} />
            ) : (
              <GoUnmute color="white" size={22} />
            )}
          </button>
          <button
            onClick={handleToggleVideo}
            className="bg-[#262626] hover:bg-[#333] p-2 rounded-full"
          >
            {videoOn ? (
              <CiVideoOff color="white" size={22} />
            ) : (
              <CiVideoOn color="white" size={22} />
            )}
          </button>
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Video Grid */}
        <section className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 p-4 overflow-auto">
            <div className="grid gap-4 auto-rows-[180px] md:auto-rows-[220px] grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {/* Local video tile */}
              <div className="relative rounded-xl border border-[#2a2a2a] bg-[#1d1d1d] flex items-center justify-center overflow-hidden group">
                {videoOn && (
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    playsInline
                    muted
                  />
                )}
                {!videoOn && (
                  <div className="flex flex-col items-center space-y-3 w-full h-full justify-center">
                    <div className="w-16 h-16 rounded-full bg-[#333] text-[#fafafa] text-2xl font-semibold flex items-center justify-center">
                      {user?.username?.[0]?.toUpperCase() || "U"}
                    </div>
                    <p className="text-xs text-[#aaa]">Video Off</p>
                  </div>
                )}
                <div className="absolute top-2 left-2 text-[10px] bg-black/50 px-2 py-1 rounded">
                  You
                </div>
                <div className="absolute inset-0 flex items-center justify-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={handleToggleMute}
                    className="bg-[#00000080] p-2 rounded-full"
                  >
                    {isMuted ? (
                      <GoMute color="white" size={20} />
                    ) : (
                      <GoUnmute color="white" size={20} />
                    )}
                  </button>
                  <button
                    onClick={handleToggleVideo}
                    className="bg-[#00000080] p-2 rounded-full"
                  >
                    {videoOn ? (
                      <CiVideoOff color="white" size={20} />
                    ) : (
                      <CiVideoOn color="white" size={20} />
                    )}
                  </button>
                </div>
              </div>
              {/* Remote */}
              {remotePeers.map((peer) => (
                <RemotePeerTile key={peer.socketId} peer={peer} />
              ))}
            </div>
          </div>
          {/* Chat / Content Split */}
          <div className="h-[45%] min-h-[340px] flex border-t border-[#1f1f1f]">
            <div className="w-1/2 border-r border-[#1f1f1f] p-3 overflow-auto hidden md:block">
              <div className="h-full rounded-lg border border-[#2a2a2a] bg-[#1d1d1d] flex items-center justify-center text-[#666] text-sm">
                Shared Content Area
              </div>
            </div>
            <div className="flex-1 p-3 overflow-hidden">
              <Chat />
            </div>
          </div>
        </section>
        {/* Right: Roster */}
        <aside className="w-60 border-l border-[#1f1f1f] bg-[#181818] flex flex-col">
          <div className="p-3 border-b border-[#1f1f1f] text-xs uppercase tracking-wide text-[#888]">
            Participants ({remotePeers.length + 1})
          </div>
          <div className="flex-1 overflow-auto p-2 space-y-2">
            <RosterItem
              you
              label={user?.username || user?.email || "You"}
              muted={isMuted}
              video={!videoOn ? false : true}
            />
            {remotePeers.map((p) => (
              <RosterItem
                key={p.socketId}
                label={p.socketId.slice(0, 6)}
                muted={false}
                video={!!p.stream}
              />
            ))}
          </div>
        </aside>
      </div>
    </main>
  );
};

const RemotePeerTile = ({
  peer,
}: {
  peer: { socketId: string; stream: MediaStream | null };
}) => {
  const ref = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    if (ref.current && peer.stream) {
      ref.current.srcObject = peer.stream;
    }
  }, [peer.stream]);
  return (
    <div className="relative rounded-xl border border-[#fafafa1a] bg-[#222] flex items-center justify-center overflow-hidden group">
      {peer.stream ? (
        <video
          ref={ref}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="text-[#fafafa66] text-sm">Connecting...</div>
      )}
      <div className="absolute bottom-2 left-2 text-xs bg-black/50 px-2 py-1 rounded">
        {peer.socketId.slice(0, 6)}
      </div>
    </div>
  );
};

const RosterItem = ({
  label,
  you,
  muted,
  video,
}: {
  label: string;
  you?: boolean;
  muted: boolean;
  video: boolean;
}) => {
  return (
    <div className="flex items-center justify-between px-3 py-2 rounded-md bg-[#222] text-[#ddd] text-xs border border-[#2a2a2a]">
      <span className="truncate max-w-[110px]">
        {label}
        {you && " (You)"}
      </span>
      <span className="flex items-center space-x-1">
        <span
          className={`w-2 h-2 rounded-full ${
            video ? "bg-green-500" : "bg-gray-500"
          }`}
          title={video ? "Video On" : "Video Off"}
        ></span>
        <span
          className={`w-2 h-2 rounded-full ${
            muted ? "bg-red-500" : "bg-green-500"
          }`}
          title={muted ? "Muted" : "Audio On"}
        ></span>
      </span>
    </div>
  );
};

export default Room;
