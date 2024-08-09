import mongoose, { Schema, Model, Document } from 'mongoose';
import ICourse from '../../../domain/course/course'; // Adjust the path to your ICourse interface

// Define the Course schema
const CourseSchema: Schema<ICourse & Document | undefined> = new Schema<ICourse & Document | undefined>({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  instructor_id: {
    type: Schema.Types.ObjectId,
    ref: 'Tutor', // Assuming Tutor is another model
    required: true
  },
  category_id: {
    // type: Schema.Types.ObjectId,
    // ref: 'Category', // Adjust to your category model
    type:String,
    required: true
  },
  price: {
    type: String,
    required: true
  },
  thambnail_Img: {
    type: String,
    required: true
  },
  trailer_vd: {
    type: String,
    required: true
  },
  chapters: [{
    type: Schema.Types.ObjectId,
    ref: 'Module' // Assuming Module is another model
  }],
  assigments: [{
    type: Schema.Types.ObjectId,
    ref: 'Assignment' // Assuming Assignment is another model
  }],
  is_verified: {
    type: Boolean,
    default: false
  },
  is_listed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create the Course model
const courseModel: Model<ICourse & Document | undefined> = mongoose.model<ICourse & Document | undefined>('Course', CourseSchema);

export default courseModel;
