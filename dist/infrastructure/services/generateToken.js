"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class JwtToken {
    generateToken(userId, role) {
        const SECRETKEY = process.env.SECRET_KEY;
        if (SECRETKEY) {
            const token = jsonwebtoken_1.default.sign({ userId, role }, SECRETKEY, {
                expiresIn: "30d",
            });
            return token;
        }
        throw new Error("jwt key is not defined");
    }
}
exports.default = JwtToken;
