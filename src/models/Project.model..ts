import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  title: string;
  description: string;
  link: string;
  team: mongoose.Types.ObjectId;
  ratings:mongoose.Types.ObjectId[];
}

const ProjectSchema = new Schema<IProject>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  link: { type: String },
  team: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
  ratings: [{ type: Schema.Types.ObjectId, ref: 'Rating' }]
}, { timestamps: true });

export default mongoose.model<IProject>('Project', ProjectSchema);
