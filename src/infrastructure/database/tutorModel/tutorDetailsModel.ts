import mongoose, { Schema, Document, Types } from "mongoose";
import { ITutorDetails } from "../../../domain/tutorDetails";
import { profile } from "console";

interface ITutorDetailsDocument extends ITutorDetails, Document {}

const tutorDetailsSchema: Schema = new Schema({
  instructorId: {
    type:mongoose.Schema.Types.ObjectId,
    ref:'Tutor',
    required: true,
  },
  profileImg: {
    type: String,
  },
  experience: {
    type: String,
  },
  position: {
    type: String,
  },
  companyName: {
    type: String,
  },
  aboutBio: {
    type: String,
  },
});

const InstructorDetails = mongoose.model<ITutorDetailsDocument>(
  "InstructorDetails",
  tutorDetailsSchema
);
export default InstructorDetails;
