import mongoose, { Schema, Document } from 'mongoose';

export interface IForum extends Document {
  name: string;
  description?: string;
  image?: string;
  leader: mongoose.Types.ObjectId;
}

const ForumSchema = new Schema<IForum>({
  name: { type: String, required: true },
  description: String,
  image: String,
  leader: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.model<IForum>('Forum', ForumSchema);
