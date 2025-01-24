"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./infrastructure/config/app");
const connectDB_1 = __importDefault(require("./infrastructure/config/connectDB"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const startServer = async () => {
    try {
        await (0, connectDB_1.default)();
        const app = app_1.httpServer;
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`server running at ${PORT}`);
        });
    }
    catch (error) {
        console.log(error);
    }
};
startServer();
