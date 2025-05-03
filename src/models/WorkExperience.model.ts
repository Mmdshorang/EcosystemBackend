import mongoose, { Schema, Document } from "mongoose";

export interface IWorkExperience extends Document {
  user: mongoose.Types.ObjectId;
  company: string;
  position: string;
  skillsUsed: string[];
  start_date: Date;
  end_date: Date;
  is_current: boolean;
}

const WorkExperienceSchema = new Schema<IWorkExperience>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  company: String,
  position: String,
  skillsUsed: [String],
  start_date: Date,
  end_date: Date,
  is_current: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model<IWorkExperience>('WorkExperience', WorkExperienceSchema);
