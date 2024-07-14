import Tutor from "../../../domain/tutor";
import mongoose, { Schema,Model,Document } from "mongoose";

const TutorSchema:Schema = new Schema<Tutor | Document>(
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



const tutorModel:Model<Tutor & Document> = mongoose.model <Tutor & Document>(
    "Tutor",
    TutorSchema
);

export default tutorModel;