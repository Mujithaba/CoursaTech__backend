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



io.on('connection', (socket) => {
  console.log("connected:",socket.id);
  
  socket.on('joinRoom', ({ roomId }) => {
    socket.join(roomId);
    console.log(roomId,"socket.id room");
    
  });

  socket.on('private message', (message) => {
    const roomId = [message.senderId, message.receiverId].sort().join('-');
    // Broadcast the message to all clients in the room, including the sender
    io.to(roomId).emit('private message', message);
  });

  // videocall
  socket.on('private Videocall', ({ senderId, receiverId, instructorName }) => {
    console.log(senderId, receiverId, instructorName, "senderId, receiverId, instructorName");
    
    // Create a unique room ID for the video call
    const roomId = [senderId,receiverId].sort().join('-');
    console.log(roomId,"joinVideoCall");
    
    // Emit an event to both the sender and receiver to join the video call room
    io.to(roomId).emit('joinVideoCall', { roomId, instructorName });
  });
  
});



// io.on("connection", (socket) => {
//   console.log("New client connected");

//   // Handle joining a room
//   socket.on("joinRoom", ({ tutorId, userId }) => {
//     const roomId = `${tutorId}-${userId}`;
//     socket.join(roomId);
//     console.log(`User joined room: ${roomId}`);
//   });

//   // Handle private messages
//   socket.on("private message", ({ message, receiverId, senderId }) => {
//     const roomId = `${receiverId}-${senderId}`; // Determine the correct room
//     io.to(roomId).emit("private message", { senderId, receiverId, message });
//     console.log(`Message sent to room ${roomId}: ${message}`);
//   });

//   socket.on("disconnect", () => {
//     console.log("Client disconnected");
//   });
// });


// // Store active connections
// const activeConnections: { [userId: string]: Socket } = {};



// // socket connections
// io.on('connection', (socket: Socket) => {
//   console.log(`Socket connected: ${socket.id}`);

//   socket.on('join', ({ userId, receiverId }) => {
//     if (!userId || !receiverId) {
//       console.error("UserId or ReceiverId missing");
//       return;
//     }

//     const room = [userId, receiverId].sort().join('-');
//     socket.join(room);
//     activeConnections[userId] = socket;

//     console.log(`User ${userId} joined room ${room}`);
//   });

//   socket.on('private message', ({ message, senderId, receiverId }) => {
//     if (!message || !senderId || !receiverId) {
//       console.error("Message, senderId, or receiverId missing");
//       return;
//     }

//     const room = [senderId, receiverId].sort().join('-');
//     io.to(room).emit('private message', { message, senderId, receiverId });

//     console.log(`Message sent in room ${room}: ${message}`);
//   });

//   socket.on('disconnect', () => {
//     const userId = Object.keys(activeConnections).find(key => activeConnections[key] === socket);
//     if (userId) {
//       delete activeConnections[userId];
//       console.log(`User ${userId} disconnected`);
//     }
//   });
// });