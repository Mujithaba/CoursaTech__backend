import mongoose, { Schema, Document } from "mongoose";
import { IWallet } from "../../../domain/wallet";

interface IWalletDocument extends IWallet, Document {}

const walletSchema: Schema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  balance: {
    type: Number,
    required: true,
    default: "0",
  },
  history: [
    {
      type: {
        type: String,
      },
      amount: {
        type: Number,
      },
      reason: {
        type: String,
      },
      date: {
        type: Date,
        default: Date.now(),
      },
    },
  ],
});

const walletModal = mongoose.model<IWalletDocument>("Wallet", walletSchema);
export default walletModal;
