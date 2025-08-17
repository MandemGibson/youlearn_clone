// Minimal modular server entrypoint (clean rebuild)
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server: SocketIOServer } = require("socket.io");
dotenv.config();

// App & middleware
const app = express();
app.use(cors());
app.use(express.json());

// HTTP + Socket.IO
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: process.env.CLIENT_ORIGIN || "*", methods: ["GET", "POST"] },
});

// In-memory: roomId -> { participants: Map<socketId,{userId,username,audio,video}>, createdAt:number }
const activeRooms = new Map();

function getRoster(roomId) {
  const r = activeRooms.get(roomId);
  if (!r) return [];
  return [...r.participants.entries()].map(([socketId, meta]) => ({
    socketId,
    userId: meta.userId,
    username: meta.username,
    audio: meta.audio,
    video: meta.video,
  }));
}

io.on("connection", (socket) => {
  console.log(`[WS] connection established socket=${socket.id} origin=${socket.handshake.headers.origin} referer=${socket.handshake.headers.referer}`);
  // Join
  socket.on("room:join", ({ roomId, userId, username }) => {
    if (!roomId) return;
    console.log(
      `[WS] room:join socket=${socket.id} room=${roomId} userId=${userId} username=${username}`
    );
    if (!activeRooms.has(roomId))
      activeRooms.set(roomId, {
        participants: new Map(),
        createdAt: Date.now(),
      });
    const room = activeRooms.get(roomId);
    room.participants.set(socket.id, {
      userId,
      username,
      audio: true,
      video: true,
    });
    socket.join(roomId);
    // Notify others
    socket
      .to(roomId)
      .emit("room:user-joined", { socketId: socket.id, userId, username });
    // Send existing participant IDs to new joiner so it initiates offers
    const existingIds = [...room.participants.keys()].filter(
      (id) => id !== socket.id
    );
    socket.emit("room:participants", { participants: existingIds });
    // Broadcast roster (for UI)
    io.to(roomId).emit("room:roster", { participants: getRoster(roomId) });
    console.log(
      `[WS] roster broadcast room=${roomId} size=${room.participants.size}`
    );
  });

  // WebRTC relay
  socket.on("webrtc:offer", ({ target, sdp, roomId }) => {
    console.log(
      `[WS] offer from=${socket.id} -> ${target} room=${roomId} sdpType=${sdp?.type}`
    );
    io.to(target).emit("webrtc:offer", { from: socket.id, sdp, roomId });
  });
  socket.on("webrtc:answer", ({ target, sdp, roomId }) => {
    console.log(
      `[WS] answer from=${socket.id} -> ${target} room=${roomId} sdpType=${sdp?.type}`
    );
    io.to(target).emit("webrtc:answer", { from: socket.id, sdp, roomId });
  });
  socket.on("webrtc:ice-candidate", ({ target, candidate, roomId }) => {
    if (candidate)
      console.log(
        `[WS] ice from=${
          socket.id
        } -> ${target} room=${roomId} cand=${candidate.candidate?.slice(
          0,
          40
        )}...`
      );
    io.to(target).emit("webrtc:ice-candidate", {
      from: socket.id,
      candidate,
      roomId,
    });
  });

  // Chat
  socket.on("room:chat", ({ roomId, message, userId, username }) => {
    if (roomId)
      io.to(roomId).emit("room:chat", {
        socketId: socket.id,
        message,
        userId,
        username,
        ts: Date.now(),
      });
    console.log(`[WS] chat room=${roomId} from=${socket.id}`);
  });

  // Media state toggle
  socket.on("media:toggle", ({ roomId, audio, video }) => {
    console.log(
      `[WS] media:toggle socket=${socket.id} room=${roomId} audio=${audio} video=${video}`
    );
    const room = activeRooms.get(roomId);
    if (!room) return;
    const p = room.participants.get(socket.id);
    if (!p) return;
    if (typeof audio === "boolean") p.audio = audio;
    if (typeof video === "boolean") p.video = video;
    io.to(roomId).emit("media:state", {
      socketId: socket.id,
      audio: p.audio,
      video: p.video,
    });
  });

  // Leave handler (explicit)
  socket.on("room:leave", ({ roomId }) => removeFromRoom(socket, roomId));

  // Disconnect cleanup
  socket.on("disconnect", () => {
    console.log(`[WS] disconnect socket=${socket.id}`);
    for (const [roomId, room] of activeRooms.entries()) {
      if (room.participants.has(socket.id))
        removeFromRoom(socket, roomId, true);
    }
  });

  function removeFromRoom(socketRef, roomId, silentDisconnect = false) {
    const room = activeRooms.get(roomId);
    if (!room) return;
    if (!room.participants.has(socketRef.id)) return;
    room.participants.delete(socketRef.id);
    socketRef.leave(roomId);
    socketRef
      .to(roomId)
      .emit("room:user-left", { socketId: socketRef.id, roomId });
    console.log(
      `[WS] room:user-left socket=${socketRef.id} room=${roomId} remaining=${room.participants.size}`
    );
    if (!room.participants.size) {
      activeRooms.delete(roomId);
      console.log(`[WS] room:empty room=${roomId} deleted`);
    } else {
      io.to(roomId).emit("room:roster", { participants: getRoster(roomId) });
    }
  }
});

// Health + modular routes
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// Debug: list active rooms (DO NOT expose in production without auth)
app.get('/v1/rooms/:roomId/debug', (req,res) => {
  const { roomId } = req.params;
  const room = activeRooms.get(roomId);
  if(!room) return res.status(404).json({ roomId, exists:false });
  return res.json({ roomId, exists:true, participants:[...room.participants.entries()].map(([sid,meta])=>({ socketId:sid, ...meta })) });
});
app.use("/v1", require("./src/routes/contentRoutes"));
app.use("/v1", require("./src/routes/studyToolRoutes"));
app.use("/v1", require("./src/routes/namespaceRoutes"));
app.use("/v1", require("./src/routes/educationalRoutes"));
app.use("/v1", require("./src/routes/uploadRoutes"));
app.use("/api", require("./src/routes/legacyRoutes"));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server listening on ${PORT}`);
  console.log("✅ Modular routes + signaling ready");
});

module.exports = { app, server };
