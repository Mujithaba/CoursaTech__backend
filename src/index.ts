import { httpServer } from "./infrastructure/config/app";
import connectDB from "./infrastructure/config/connectDB";
import dotenv from "dotenv";
dotenv.config();


const startServer = async () => {
  try {
    await connectDB()
    const app = httpServer;
    const PORT = process.env.PORT || 8000
    app.listen(PORT, () => {
      console.log(`server running at ${PORT}`);

    })
  } catch (error) {
    console.log(error);
  }
}
startServer()