"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel_1 = __importDefault(require("../database/userModels/userModel"));
const userAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
            .status(401)
            .json({ message: "Authorization header missing or invalid" });
    }
    const token = authHeader.split(" ")[1];
    try {
        const decodedToken = jsonwebtoken_1.default.verify(token, process.env.SECRET_KEY);
        if (decodedToken.role !== "user") {
            return res.status(400).json({ message: "Unauthorized access" });
        }
        const userId = decodedToken.userId;
        const user = await userModel_1.default.findById(userId);
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        if (user.isBlocked) {
            return res
                .status(403)
                .json({ message: "You are blocked", accountType: "user" });
        }
        next();
    }
    catch (error) {
        console.error("Error decoding token:", error.message);
        return res.status(401).json({ message: "Invalid token" });
    }
};
exports.userAuth = userAuth;
