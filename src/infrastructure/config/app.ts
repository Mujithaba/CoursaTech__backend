import dotenv, { config } from "dotenv";
dotenv.config();

import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import cors from "cors";
import http from "http";




// route roots
import userRoute from "../router/userRoute";
import tutorRoute from "../router/toturRoute";
import adminRoute from "../router/adminRoute";


const app = express()
export const httpServer = http.createServer(app)

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