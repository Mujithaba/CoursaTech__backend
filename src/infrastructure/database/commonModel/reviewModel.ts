import mongoose, { Schema, Document, Types, model } from "mongoose";
import { reviews } from "../../../domain/review";

interface IReviewProps extends reviews, Document {}

const reviewSchema: Schema = new Schema(
  {
    courseId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    feedback: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const Review = mongoose.model<IReviewProps>("Review", reviewSchema);
export default Review;
