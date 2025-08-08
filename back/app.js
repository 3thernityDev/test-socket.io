import express from "express";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server);

const __dirname = dirname(fileURLToPath(import.meta.url));

// In-memory storage for rooms and messages
const rooms = new Set();
const messagesByRoom = {}; // { roomName: [ { message, nickname, timestamp }, ... ] }

app.get("/", (req, res) => {
    res.sendFile(join(__dirname, "index.html"));
});

io.on("connection", (socket) => {
    console.log(`Socket ${socket.id} connected`);

    socket.emit("rooms list", Array.from(rooms));

    socket.on("disconnect", () => {
        console.log(`Socket ${socket.id} disconnected`);
    });

    socket.on("create room", (roomName) => {
        if (!rooms.has(roomName)) {
            rooms.add(roomName);
            io.emit("rooms list", Array.from(rooms));
            console.log(`Room created: ${roomName}`);
        }
    });

    socket.on("join room", (roomName) => {
        const currentRooms = Array.from(socket.rooms).filter(
            (r) => r !== socket.id
        );
        currentRooms.forEach((r) => {
            socket.leave(r);
            console.log(`Socket ${socket.id} left room ${r}`);
        });

        socket.join(roomName);
        console.log(`Socket ${socket.id} joined room ${roomName}`);

        const history = messagesByRoom[roomName] || [];
        history.forEach(({ message, nickname }) => {
            socket.emit("chat message", { room: roomName, message, nickname });
        });

        socket.emit("joined room", roomName);
    });

    socket.on("leave room", (roomName) => {
        socket.leave(roomName);
        console.log(`Socket ${socket.id} left room ${roomName}`);
    });

    socket.on("chat message", ({ room, message, nickname }) => {
        if (rooms.has(room)) {
            if (!messagesByRoom[room]) messagesByRoom[room] = [];
            messagesByRoom[room].push({
                message,
                nickname,
                timestamp: Date.now(),
            });

            io.to(room).emit("chat message", { room, message, nickname });
            console.log(`[${room}] ${nickname}: ${message}`);
        }
    });
});

const PORT = 9090;
server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
