import mongoose, { Schema, Document } from 'mongoose';


interface IAssignment extends Document {
  title: string;
  course_id: mongoose.Schema.Types.ObjectId;
  pdf_url: string;
  createdAt?: Date;
}


const AssignmentSchema: Schema<IAssignment> = new Schema({
  title: {
    type: String,
    required: true
  },
  course_id: {
    type: Schema.Types.ObjectId,
    ref: 'Course', 
    required: true
  },
  pdf_url: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});


const assignmentModel = mongoose.model<IAssignment>('Assignment', AssignmentSchema);

export default assignmentModel;
