import mongoose, { Model, Schema, Document } from "mongoose";
import ICategory from "../../../domain/Icategory";


const categorySchema: Schema = new Schema<ICategory | Document>({
  categoryName: {
    type: String,
    required: true,
    unique:true,
  },
  is_listed: {
    type: Boolean,
    default: true,
  },
});

const categoryModel: Model<ICategory & Document> = mongoose.model<ICategory & Document>(
  "Category",
  categorySchema
);
export default categoryModel;
