import mongoose, { Schema, Document } from "mongoose";
import { IReport } from "../../../domain/report";

interface IReportDocument extends IReport, Document {}

const reportSchema: Schema = new Schema(
  {
    courseId: {
      type: String,
      required: true,
    },
    userId: [
      {
        type: String,
        required: true,
      },
    ],
    issueType: [
      {
        type: String,
        required: true,
      },
    ],
    description: [
      {
        type: String,
        required: true,
      },
    ],
    reportedCount: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

const Report = mongoose.model<IReportDocument>("Report", reportSchema);
export default Report;
