"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class GenerateOtp {
    createOtp() {
        return Math.floor(10000 + Math.random() * 90000);
    }
}
exports.default = GenerateOtp;
