import mongoose, { Schema, Document } from 'mongoose';

export interface IAnnouncement extends Document {
  title: string;
  description: string;
  image: string;
  forum: mongoose.Types.ObjectId;
}

const AnnouncementSchema = new Schema<IAnnouncement>({
  title: { type: String, required: true },
  description: String,
  image: String,
  forum: { type: Schema.Types.ObjectId, ref: 'Forum', required: true }
}, { timestamps: true });

export default mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);
