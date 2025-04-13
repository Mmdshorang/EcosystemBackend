import mongoose, { Schema, Document } from 'mongoose';

export interface IForum extends Document {
  name: string;
  description: string;
  image: string;
  announcements: mongoose.Types.ObjectId[];
  events: mongoose.Types.ObjectId[];
  archive: string[];
  leader: mongoose.Types.ObjectId;
}

const ForumSchema = new Schema<IForum>({
  name: { type: String, required: true },
  description: String,
  image: String,
  announcements: [{ type: Schema.Types.ObjectId, ref: 'Announcement' }],
  events: [{ type: Schema.Types.ObjectId, ref: 'Event' }],
  archive: [String],
  leader: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model<IForum>('Forum', ForumSchema);
