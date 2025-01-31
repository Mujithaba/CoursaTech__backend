

import { httpServer } from "./infrastructure/config/app";
import connectDB from "./infrastructure/config/connectDB";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const startServer = async () => {
  try {
    // Connect to database first
    const dbConnected = await connectDB();
        
    if (!dbConnected) {
      console.error("❌ Failed to connect to database. Server cannot start.");
      process.exit(1);
    }
    
    const PORT = process.env.PORT || 3000;
    
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
    
  } catch (error) {
        console.error("🔥 Server initialization error:", error);
        process.exit(1);
      }
    };
    
    // Graceful shutdown handling
    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down gracefully');
      httpServer.close(() => {
        console.log('Process terminated');
        process.exit(0);
      });
    });
    
    startServer();




    
    // import { httpServer } from "./infrastructure/config/app";
    // import connectDB from "./infrastructure/config/connectDB";
    // import dotenv from "dotenv";
    // dotenv.config();
    
    // const startServer = async () => {
    //   try {
    //     await connectDB();
        
    //     const app = httpServer;
    //     const PORT = process.env.PORT || 3000;
    //     app.listen(PORT, () => {
    //       console.log(`server running at ${PORT}`);
    //     });
    //   } catch (error) {
    //     console.log(error);
    //   }
    // };
    // startServer(); 