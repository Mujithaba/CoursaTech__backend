import mongoose, { Schema, Document } from "mongoose";

interface IModule extends Document {
  name: string;
  lectures: mongoose.Types.ObjectId[];
  createdAt?: Date;
}

const ModuleSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  lectures: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lecture" }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IModule>("Module", ModuleSchema);
