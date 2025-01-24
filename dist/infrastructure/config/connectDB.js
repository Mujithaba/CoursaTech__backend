"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionConfig = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const connect_mongo_1 = __importDefault(require("connect-mongo"));
const DB_String = process.env.MONGO_URL || "";
// Session configuration
exports.sessionConfig = {
    secret: process.env.SESSION_SECRET || '',
    resave: false,
    saveUninitialized: false,
    store: connect_mongo_1.default.create({
        mongoUrl: DB_String,
        collectionName: 'sessions',
        ttl: 24 * 60 * 60, // 1 day
        autoRemove: 'native',
        crypto: {
            secret: process.env.MONGO_STORE_SECRET || ''
        }
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
};
const connectDB = async () => {
    try {
        await mongoose_1.default.connect(DB_String);
        console.log("Successfully connected to database");
    }
    catch (error) {
        console.log(error.message);
        setTimeout(connectDB, 5000);
    }
};
exports.default = connectDB;
// import mongoose from "mongoose";
// const DB_String = process.env.MONGO_URL || "";
// const connectDB = async () => {
//   try {
//     await mongoose.connect(DB_String);
//     console.log("Successfully connected to database");
//   } catch (error: any) {
//     console.log(error.message);
//     setTimeout(connectDB, 5000);
//   }
// };
// export default connectDB;
