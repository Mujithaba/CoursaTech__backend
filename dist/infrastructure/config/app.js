"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpServer = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const connectDB_1 = require("./connectDB");
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
// route roots
const userRoute_1 = __importDefault(require("../router/userRoute"));
const toturRoute_1 = __importDefault(require("../router/toturRoute"));
const adminRoute_1 = __importDefault(require("../router/adminRoute"));
const app = (0, express_1.default)();
exports.httpServer = http_1.default.createServer(app);
// Socket.IO setup
const io = new socket_io_1.Server(exports.httpServer, {
    cors: {
        origin: process.env.CORS_URL,
        methods: ["GET", "POST"],
        credentials: true,
    },
});
// Middleware configuration
app.use(express_1.default.json({ limit: "50mb" }));
app.use(express_1.default.urlencoded({ limit: "50mb", extended: true }));
app.use((0, cookie_parser_1.default)());
// Session configuration - use only once
app.use((0, express_session_1.default)(connectDB_1.sessionConfig));
// CORS configuration
app.use((0, cors_1.default)({
    origin: process.env.CORS_URL,
    methods: "GET,POST,PUT,PATCH,DELETE",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ['*']
}));
app.use((0, morgan_1.default)("dev"));
// API routes
app.use("/api/users", userRoute_1.default);
app.use("/api/tutors", toturRoute_1.default);
app.use("/api/admin", adminRoute_1.default);
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
exports.default = app;
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
