import mongoose, { Schema, Document } from "mongoose";

interface ILecture extends Document {
  title: string;
  description: string;
  video?: string;
  pdf?: string;
  createdAt?: Date;
}

const LectureSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  video: {
    type: String,
  },
  pdf: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<ILecture>("Lecture", LectureSchema);
