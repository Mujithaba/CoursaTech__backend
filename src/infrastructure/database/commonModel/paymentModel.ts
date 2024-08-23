import mongoose, { Schema, Document } from "mongoose";
import { IPayment } from "../../../domain/payment";

interface IPaymentDocument extends IPayment, Document {}

const paymentSchema: Schema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },

    courseId: {
      type: String,
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Payment = mongoose.model<IPaymentDocument>("Payment", paymentSchema);
export default Payment;
