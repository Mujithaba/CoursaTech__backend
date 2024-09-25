import mongoose, { Schema, Document } from "mongoose";

interface ICourse extends Document {
  title: string;
  description: string;
  instructor_id: mongoose.Schema.Types.ObjectId;
  category_id: mongoose.Schema.Types.ObjectId;
  price: string;
  thambnail_Img: string;
  trailer_vd: string;
  chapters?: mongoose.Schema.Types.ObjectId[];
  assignments?: mongoose.Schema.Types.ObjectId[];
  is_verified?: boolean;
  is_listed?: boolean;
  createdAt?: Date;
}

// Define the Course schema
const CourseSchema: Schema<ICourse> = new Schema<ICourse>({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  instructor_id: {
    type: Schema.Types.ObjectId,
    ref: "Tutor",
    required: true,
  },
  category_id: {
    type: Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  thambnail_Img: {
    type: String,
    required: true,
  },
  trailer_vd: {
    type: String,
    required: true,
  },
  chapters: [{ type: mongoose.Schema.Types.ObjectId, ref: "Module" }],
  assignments: [{ type: Schema.Types.ObjectId, ref: "Assignment" }],
  is_verified: {
    type: Boolean,
    default: false,
  },
  is_listed: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create the Course model
const courseModel: mongoose.Model<ICourse> = mongoose.model<ICourse>(
  "Course",
  CourseSchema
);

export default courseModel;
