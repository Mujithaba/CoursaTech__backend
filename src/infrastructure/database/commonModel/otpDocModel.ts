import mongoose, { Schema, Model } from "mongoose";
import IOtpDoc from "../../../domain/IOtpDoc";

const OtpDocSchema: Schema<IOtpDoc> = new Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
  },
  otp: {
    type: String,
  },
  role: {
    type: String,
  },
  generatedAt: {
    type: Date,
    default: Date.now,
    expires: 90,
  },
});

const OtpDocModel: Model<IOtpDoc> = mongoose.model<IOtpDoc>(
  "OtpDoc",
  OtpDocSchema
);

export default OtpDocModel;
