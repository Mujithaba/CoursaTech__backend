"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const adminAuth = async (req, res, next) => {
    console.log("admin auth");
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
            .status(401)
            .json({ message: "Authorization header missing or invalid" });
    }
    const token = authHeader.split(" ")[1];
    try {
        const decodedToken = jsonwebtoken_1.default.verify(token, process.env.SECRET_KEY);
        console.log(decodedToken, "kk tocken");
        if (decodedToken.role !== "admin") {
            return res.status(403).json({ message: "Unauthorized access" });
        }
        next();
    }
    catch (error) {
        console.error("Error decoding token:", error.message);
        return res.status(401).json({ message: "Not found" });
    }
};
exports.adminAuth = adminAuth;
