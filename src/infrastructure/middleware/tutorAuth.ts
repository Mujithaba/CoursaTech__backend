import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import tutorModel from "../database/tutorModel/tutorModel";

export const tutorAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authorization header missing or invalid" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY as string) as JwtPayload;
    // console.log(decodedToken,"hhhh tockennnnn");

    if (decodedToken.role !== "tutor") {
      return res.status(400).json({ message: "Unauthorized access" });
    }

    const userId = decodedToken.userId;
    const user = await tutorModel.findById(userId);

    if (!user) {
      return res.status(400).json({ message: "Tutor not found" });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: "You are blocked", accountType: "tutor" });
    }

    next();
  } catch (error: any) {
    console.error("Error decoding token:", error.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};