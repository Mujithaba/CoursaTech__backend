import User from "../../../domain/user";
import mongoose, { Schema,Model,Document } from "mongoose";

const UserSchema:Schema = new Schema<User | Document>(
    {
        name:{
            type:String,
            required:true
        },
        email:{
            type:String,
            required:true,
            unique:true
        },
        phone:{
            type:String
        },
        password:{
            type:String,
            required:true
        },
        isBlocked:{
            type:Boolean,
            default:false
        },
        isAdmin:{
            type:Boolean,
            default:false
        },
        isGoogle:{
            type:Boolean,
            default:false
        }
    }
);



const userModel:Model<User & Document> = mongoose.model <User & Document>(
    "User",
    UserSchema
);

export default userModel;