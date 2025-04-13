import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  title: string;
  description: string;
  image: string;
  link: string;
  team: mongoose.Types.ObjectId;
}

const ProjectSchema = new Schema<IProject>({
  title: { type: String, required: true },
  description: String,
  image: String,
  link: String,
  team: { type: Schema.Types.ObjectId, ref: 'Team', required: true }
}, { timestamps: true });

export default mongoose.model<IProject>('Project', ProjectSchema);
