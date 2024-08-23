import mongoose,{Schema,Document} from "mongoose";
import { IMessage } from "../../../domain/message";

interface IMessageDocument extends IMessage,Document{}


const messageSchema :Schema = new Schema (
    {
        senderId:{
            type:String,
            required:true
        },
        receiverId:{
            type:String,
            required:true
        },
        message:{
            type:String,
            required:true
        },
    },
    {timestamps:true}
)

const Message = mongoose.model<IMessageDocument>("Message",messageSchema);
export default Message;
