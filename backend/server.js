import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { Server } from 'socket.io';
import { createServer } from 'http';

// Correct placement: Call dotenv.config() at the very top.
dotenv.config();

import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
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

let onlineUsers = {}; // { userId: socketId }

// Socket.IO connection
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    const userId = socket.handshake.query.userId;
    if (userId) {
        socket.join(userId);
        onlineUsers[userId] = socket.id;
        io.emit('update_user_status', { userId, status: 'online' });
        console.log(`User ${userId} joined their personal room.`);
    }

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

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send('Hi')
})

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});