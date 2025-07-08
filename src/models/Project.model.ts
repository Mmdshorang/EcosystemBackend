import mongoose, { Document, Schema, Model } from 'mongoose';

// 1. Define the TypeScript Interface for the document
export interface IProject extends Document {
  title: string;
  description: string;
  image?: string;
  link?: string;
  team: mongoose.Types.ObjectId;
  tags: string[];
  status: 'In Progress' | 'Completed' | 'Archived';
  comments: mongoose.Types.ObjectId[];
  likes: mongoose.Types.ObjectId[];
}

// 2. Create the Schema
const ProjectSchema: Schema<IProject> = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String },
  link: { type: String },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  tags: [{ type: String, trim: true }],
  status: {
    type: String,
    enum: ['In Progress', 'Completed', 'Archived'],
    default: 'In Progress'
  },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

// Add text index for searching
ProjectSchema.index({ title: 'text', tags: 'text' });

// 3. Create and export the Model, linking it with the interface
const Project: Model<IProject> = mongoose.model<IProject>('Project', ProjectSchema);

export default Project;