import mongoose, { Schema, Document } from 'mongoose';
import { Assignment } from '../../../domain/course/assignment';


interface IAssignmentDocument extends Assignment,Document{}



const AssignmentSchema: Schema = new Schema({
  title:{
    type:String,
    required:true
  },
  pdf:{
    type:String,
    required:true
  },
  courseId:{
    type:String,
    required:true
  }

});


const assignmentModel = mongoose.model<IAssignmentDocument>('Assignment', AssignmentSchema);

export default assignmentModel;
