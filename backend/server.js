import express from 'express';
import path from 'path'
import dotenv from 'dotenv';
import cors from 'cors';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import Chat from './models/chatModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Correct placement: Call dotenv.config() at the very top.
dotenv.config();

import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import chatRoutes from "./routes/chatRoutes.js";
import gigRoutes from './routes/gigRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import bidRoutes from './routes/bidRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import notificationRoutes from "./routes/notificationRoutes.js";
import { createNotification } from './controllers/notificationController.js';

connectDB();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
});

app.use(express.json());
app.use(cors());

// REST API routes
app.use('/api/users', userRoutes);
app.use('/api/gigs', gigRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/reviews', reviewRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/chats", chatRoutes);

app.use(express.static(path.join(__dirname, 'frontend/build')));

let onlineUsers = {}; // { userId: socketId }

// Socket.IO connection
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // socket.on("setup", (userData) => {
    //     socket.join(userData._id);
    //     console.log("User joined room:", userData._id);
    //     socket.emit("connected");
    // });

    // Join specific chat room
    const userId = socket.handshake.query.userId;
    if (userId) {
        socket.join(userId);
        onlineUsers[userId] = socket.id;
        console.log(`[PRESENCE] User ${userId} has connected.`);
        io.emit('update_user_status', { userId, status: 'online' });
    }

    // ❌ REMOVED: The "setup" event is not needed and adds confusion.

    // ✅ This is the ONLY way a user should join a chat room.
    socket.on("join chat", (chatId) => {
        socket.join(chatId);
        console.log(`[CHAT JOIN] User ${socket.id} joined chat room: ${chatId}`);
    });

    socket.on("new message", async (message) => {
        try {
            const chatId = message.chatId; // Use chatId directly from client payload

            if (!chatId) {
                console.log("❌ [ERROR] No chatId provided with message");
                return;
            }

            console.log(`[NEW MSG] Received message for chat: ${chatId}`);
            
            // ✅ This is the correct and most efficient way to broadcast.
            // It sends the message to everyone in the chat room EXCEPT the sender.
            console.log(`🚀 Emitting 'message received' to room: ${chatId}`);
            socket.to(chatId).emit("message received", message);

        } catch (err) {
            console.error("❌ [ERROR] in 'new message' event:", err);
        }
    });

    socket.on('disconnect', () => {
        if (userId) {
            delete onlineUsers[userId];
            console.log(`[PRESENCE] User ${userId} has disconnected.`);
            io.emit('update_user_status', { userId, status: 'offline' });
        }
        console.log(`❌ User disconnected: ${socket.id}`);
    });

    socket.on('disconnect', () => {
        if (socket.handshake.query.userId) {
            const uid = socket.handshake.query.userId;
            delete onlineUsers[uid];
            io.emit('update_user_status', { userId: uid, status: 'offline' });
        }
        console.log(`❌ User disconnected: ${socket.id}`);
    });

    socket.on('join_gig_room', (gigId) => {
        socket.join(gigId);
        console.log(`User ${socket.id} joined gig room ${gigId}`);
    });

    socket.on('send_message', (messageData) => {
        io.to(messageData.gig).emit('receive_message', messageData);
    });

    socket.on('disconnect', () => {
    if (socket.handshake.query.userId) {
        const uid = socket.handshake.query.userId;
        delete onlineUsers[uid];
        io.emit('update_user_status', { userId: uid, status: 'offline' });
    }
        console.log('User disconnected:', socket.id);
    });
});

app.set('io', io);

// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname,'frontend/build', 'index.html'));
// });
const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send('Hi')
})


httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});