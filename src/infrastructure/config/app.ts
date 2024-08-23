import dotenv, { config } from "dotenv";
dotenv.config();

import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import cors from "cors";
import http from "http";
import {Server as socketIo }from "socket.io"




// route roots
import userRoute from "../router/userRoute";
import tutorRoute from "../router/toturRoute";
import adminRoute from "../router/adminRoute";


const app = express()

export const httpServer = http.createServer(app)
const io =new  socketIo(httpServer,{
    cors:{
        origin:process.env.CORS_URL,
        methods:['GET ','POST'],
        credentials:true,
        optionsSuccessStatus:200
    }
})

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


// socket connections
io.on('connection',(socket)=>{
    console.log(`Socket connected ${socket.id}`);

    const users:any ={}

    socket.on('join',({userId,instructorId})=>{
        const room = [userId,instructorId].sort().join('-');
        socket.join(room);
        users[userId]=socket.id
        console.log(users,"users");
        console.log(`User ${userId} joined room ${room}`);        
    });

    socket.on('private message',({message,userId,instructorId})=>{
        const room = [userId,instructorId].sort().join('-');
        io.to(room).emit('private message',{message,userId});
    });

    socket.on('disconnect',()=>{
        console.log(`disconnect: {socket.id}`);
    });
});