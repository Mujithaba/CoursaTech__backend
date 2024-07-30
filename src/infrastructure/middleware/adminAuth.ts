import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export const adminAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
    console.log("admin auth");
    
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Authorization header missing or invalid" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decodedToken = jwt.verify(
      token,
      process.env.SECRET_KEY as string
    ) as JwtPayload;
console.log(decodedToken,"kk tocken");

    if (decodedToken.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    next();
  } catch (error: any) {
    console.error("Error decoding token:", error.message);
    return res.status(401).json({ message: "Not found" });
  }
};