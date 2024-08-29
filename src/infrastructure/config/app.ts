import dotenv, { config } from "dotenv";
dotenv.config();

import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import cors from "cors";
import http from "http";
import { Server as SocketIoServer, Socket } from "socket.io";



// route roots
import userRoute from "../router/userRoute";
import tutorRoute from "../router/toturRoute";
import adminRoute from "../router/adminRoute";
import { log } from "console";


const app = express()

export const httpServer = http.createServer(app)
const io = new SocketIoServer(httpServer, {
    cors: {
      origin: process.env.CORS_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    }
  });
  

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

app.use(cookieParser())
app.use(session({
    secret: 'wqrupegkey',
    resave: false,
    saveUninitialized: false
}))

app.use(cors({
    origin: process.env.CORS_URL,
    methods: 'GET,POST,PUT,PATCH,DELETE',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('dev'))   


// api's
app.use('/api/users',userRoute)
app.use('/api/tutors',tutorRoute)
app.use('/api/admin',adminRoute)


// Store active connections
const activeConnections: { [userId: string]: Socket } = {};



// socket connections
// socket connections
io.on('connection', (socket: Socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on('join', ({ userId, receiverId }) => {
    if (!userId || !receiverId) {
      console.error("UserId or ReceiverId missing");
      return;
    }

    const room = [userId, receiverId].sort().join('-');
    socket.join(room);
    activeConnections[userId] = socket;

    console.log(`User ${userId} joined room ${room}`);
  });

  socket.on('private message', ({ message, senderId, receiverId }) => {
    if (!message || !senderId || !receiverId) {
      console.error("Message, senderId, or receiverId missing");
      return;
    }

    const room = [senderId, receiverId].sort().join('-');
    io.to(room).emit('private message', { message, senderId, receiverId });

    console.log(`Message sent in room ${room}: ${message}`);
  });

  socket.on('disconnect', () => {
    const userId = Object.keys(activeConnections).find(key => activeConnections[key] === socket);
    if (userId) {
      delete activeConnections[userId];
      console.log(`User ${userId} disconnected`);
    }
  });
});