import {Assignment }from "./assignment";
import Modules from "./chapter";
import mongoose from "mongoose";

interface ICourse{
    _id?:string ;
    title:string;
    description:string;
    instructor_id?:string;
    category_id?:string;
    price:string | number | undefined;
    thambnail_Img:string;
    trailer_vd:string;
    chapters?:Modules[];
    assigments?:Assignment[];
    is_verified?:boolean;
    is_listed?:boolean;
    createdAt?: Date; 
}
export default ICourse;