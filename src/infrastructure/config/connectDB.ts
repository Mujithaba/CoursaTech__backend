
import mongoose from "mongoose";
import session from 'express-session';
import MongoStore from 'connect-mongo';

const DB_String = process.env.MONGO_URL || "";

// Session configuration
export const sessionConfig = {
    secret: process.env.SESSION_SECRET || '',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
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
        await mongoose.connect(DB_String);
        console.log("Successfully connected to database");
    } catch (error: any) {
        console.log(error.message);
        setTimeout(connectDB, 5000);
    }
};

export default connectDB;





















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
