import dotenv from "dotenv";
import { sessionConfig } from "./connectDB";
dotenv.config();

import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import cors from "cors";
import http from "http";
import { Server as SocketIoServer } from "socket.io";

// route roots
import userRoute from "../router/userRoute";
import tutorRoute from "../router/toturRoute";
import adminRoute from "../router/adminRoute";

const app = express();
export const httpServer = http.createServer(app);

// Socket.IO setup
const io = new SocketIoServer(httpServer, {
  cors: {
    origin: process.env.CORS_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Middleware configuration
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

// Session configuration - use only once
app.use(session(sessionConfig));

// CORS configuration
app.use(
  cors({
    // origin: process.env.CORS_URL,
     origin: [
      "https://coursa-tech.vercel.app",
      "http://localhost:5173",
    ],
    methods: "GET,POST,PUT,PATCH,DELETE",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ['*']
  })
);

app.use(morgan("dev"));

// API routes
app.use("/api/users", userRoute);
app.use("/api/tutors", tutorRoute);
app.use("/api/admin", adminRoute);


app.get('/', (req, res) => {
  res.status(200).send('Server is running');
});

// Socket.IO event handlers
io.on("connection", (socket) => {
  console.log("connected:", socket.id);

  socket.on("joinRoom", ({ roomId }) => {
    socket.join(roomId);
    console.log(`${socket.id} joined room: ${roomId}`);
  });

  socket.on("private message", (message) => {
    const roomId = [message.senderId, message.receiverId].sort().join("-");
    io.to(roomId).emit("private message", message);
  });

  socket.on("private Videocall", ({ senderId, receiverId, instructorName }) => {
    console.log("Video call request:", { senderId, receiverId, instructorName });
    const roomId = [senderId, receiverId].sort().join("-");
    io.to(roomId).emit("joinVideoCall", { roomId, instructorName });
  });

  socket.on("disconnect", () => {
    console.log("disconnected:", socket.id);
  });
});

export default app;































// import dotenv from "dotenv";
// dotenv.config();

// import express from "express";
// import session from "express-session";
// import cookieParser from "cookie-parser";
// import morgan from "morgan";
// import cors from "cors";
// import http from "http";
// import { Server as SocketIoServer } from "socket.io";

// // route roots
// import userRoute from "../router/userRoute";
// import tutorRoute from "../router/toturRoute";
// import adminRoute from "../router/adminRoute";

// const app = express();

// export const httpServer = http.createServer(app);
// const io = new SocketIoServer(httpServer, {
//   cors: {
//     origin: process.env.CORS_URL,
//     methods: ["GET", "POST"],
//     credentials: true,
//   },
// });

// app.use(express.json({ limit: "50mb" }));
// app.use(express.urlencoded({ limit: "50mb", extended: true }));

// app.use(cookieParser());
// app.use(
//   session({
//     secret: "wqrupegkey",
//     resave: false,
//     saveUninitialized: false,
//   })
// );

// app.use(
//   cors({
//     origin: process.env.CORS_URL,
//     methods: "GET,POST,PUT,PATCH,DELETE",
//     credentials: true,
//     allowedHeaders: ["Content-Type", "Authorization"],
//     // Add this for more verbose debugging
//     exposedHeaders: ['*']  // Expose all headers
//   })
// );
// app.use(morgan("dev"));

// // api's
// app.use("/api/users", userRoute);
// app.use("/api/tutors", tutorRoute);
// app.use("/api/admin", adminRoute);

// io.on("connection", (socket) => {
//   console.log("connected:", socket.id);

//   socket.on("joinRoom", ({ roomId }) => {
//     socket.join(roomId);
//     console.log(roomId, "socket.id room");
//   });

//   socket.on("private message", (message) => {
//     const roomId = [message.senderId, message.receiverId].sort().join("-");
//     // Broadcast the message to all clients in the room, including the sender
//     io.to(roomId).emit("private message", message);
//   });

//   // videocall
//   socket.on("private Videocall", ({ senderId, receiverId, instructorName }) => {
//     console.log(
//       senderId,
//       receiverId,
//       instructorName,
//       "senderId, receiverId, instructorName"
//     );

//     // Create a unique room ID for the video call
//     const roomId = [senderId, receiverId].sort().join("-");
//     console.log(roomId, "joinVideoCall");

//     // Emit an event to both the sender and receiver to join the video call room
//     io.to(roomId).emit("joinVideoCall", { roomId, instructorName });
//   });
// });
