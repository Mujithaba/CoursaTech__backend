import mongoose, { Schema, Document } from "mongoose";
import { Conversation } from "../../../domain/conversationMsg";
import exp from "constants";

interface IConversationDocument extends Conversation, Document {}

const conversationSchema: Schema = new Schema(
  {
    senderName: {
      type: String,
      required: true,
    },
    senderId: {
      type: String,
      required: true,
    },
    receiverId: {
      type: String,
      require: true,
    },
    lastMessage: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const conversationModel = mongoose.model<IConversationDocument>(
  "Conversation",
  conversationSchema
);
export default conversationModel;
