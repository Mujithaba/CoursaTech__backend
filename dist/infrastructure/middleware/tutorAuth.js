"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tutorAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const tutorModel_1 = __importDefault(require("../database/tutorModel/tutorModel"));
const tutorAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
            .status(401)
            .json({ message: "Authorization header missing or invalid" });
    }
    const token = authHeader.split(" ")[1];
    try {
        const decodedToken = jsonwebtoken_1.default.verify(token, process.env.SECRET_KEY);
        if (decodedToken.role !== "tutor") {
            return res.status(400).json({ message: "Unauthorized access" });
        }
        const userId = decodedToken.userId;
        const user = await tutorModel_1.default.findById(userId);
        if (!user) {
            return res.status(400).json({ message: "Tutor not found" });
        }
        if (user.isBlocked) {
            return res
                .status(403)
                .json({ message: "You are blocked", accountType: "tutor" });
        }
        next();
    }
    catch (error) {
        console.error("Error decoding token:", error.message);
        return res.status(401).json({ message: "Invalid token" });
    }
};
exports.tutorAuth = tutorAuth;
