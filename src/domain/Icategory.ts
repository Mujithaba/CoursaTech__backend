import { Document } from "mongoose";

interface ICategory  extends Document{
    categoryName:string;
    is_listed :boolean;
}

export default ICategory