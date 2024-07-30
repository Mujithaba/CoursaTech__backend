import { Model,Schema } from "mongoose";
import ICategory from "../../../domain/Icategory";

const categorySchema:Schema<ICategory>=new Schema({
    categoryName:{
        type:String,
        required:true
    },
    is_listed:{
        type:Boolean,
    }
})