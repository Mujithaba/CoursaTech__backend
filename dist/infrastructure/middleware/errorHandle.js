"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let errorHandle = async (error, req, res, next) => {
    return res.status(400).json({ message: error });
};
exports.default = errorHandle;
