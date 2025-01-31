
import mongoose from "mongoose";
import session from 'express-session';
import MongoStore from 'connect-mongo';



console.log("MONGO_URL:", process.env.MONGO_URL);
// Validate and prepare connection string
const DB_String = process.env.MONGO_URL;

// Validate environment variables
if (!DB_String) {
    console.error("CRITICAL: MongoDB connection string (MONGO_URL) is not defined");
    process.exit(1);
}

// Session configuration
export const sessionConfig = {
    secret: process.env.SESSION_SECRET || 'fallback_secret_key_2024',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: DB_String,  
        collectionName: 'sessions',
        ttl: 24 * 60 * 60, // 1 day
        autoRemove: 'native',
        crypto: {
            secret: process.env.MONGO_STORE_SECRET || 'fallback_crypto_secret_2024'
        }
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
};

// Enhanced database connection function
const connectDB = async () => {
    try {
        await mongoose.connect(DB_String, {
            serverSelectionTimeoutMS: 5000,  // Timeout after 5 seconds
            socketTimeoutMS: 45000,  // Close sockets after 45 seconds of inactivity
        });
        console.log("✅ Successfully connected to database");
        return true;
    } catch (error: any) {
        console.error("❌ MongoDB Connection Error:", {
            message: error.message,
            name: error.name,
            stack: error.stack
        });
       
        // Advanced error handling
        if (error.name === 'MongoNetworkError') {
            console.error("Network issue detected. Check connection string and network.");
        } else if (error.name === 'MongoError') {
            console.error("MongoDB server error. Verify server status.");
        }
       
        // Optional: Retry connection with exponential backoff
        setTimeout(connectDB, 5000);
        return false;
    }
};

export default connectDB;




// import mongoose from "mongoose";
// import session from 'express-session';
// import MongoStore from 'connect-mongo';

// const DB_String = process.env.MONGO_URL || "";

// // Session configuration
// export const sessionConfig = {
//     secret: process.env.SESSION_SECRET || '',
//     resave: false,
//     saveUninitialized: false,
//     store: MongoStore.create({
//         mongoUrl: DB_String,  
//         collectionName: 'sessions',
//         ttl: 24 * 60 * 60, // 1 day
//         autoRemove: 'native',
//         crypto: {
//             secret: process.env.MONGO_STORE_SECRET || ''
//         }
//     }),
//     cookie: {
//         secure: process.env.NODE_ENV === 'production',
//         httpOnly: true,
//         maxAge: 24 * 60 * 60 * 1000 // 1 day
//     }
// };

// const connectDB = async () => {
//     try {
//         await mongoose.connect(DB_String);
//         console.log("Successfully connected to database");
//     } catch (error: any) {
//         console.log(error.message);
//         setTimeout(connectDB, 5000);
//     }
// };

// export default connectDB;





















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
