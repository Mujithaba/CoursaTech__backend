import { Document } from "mongoose";

interface IOtpDoc extends Document {
  name: string;
  email: string;
  otp: string;
  role: string;
  generatedAt?: Date;
}

export default IOtpDoc;
