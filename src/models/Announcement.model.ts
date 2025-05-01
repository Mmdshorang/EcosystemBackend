import mongoose, { Schema, Document } from "mongoose";

export interface IAnnouncement extends Document {
  title: string;
  description: string;
  image: string;
  forum: mongoose.Types.ObjectId;
  start_date: string;
  end_date: string;
}

const AnnouncementSchema = new Schema<IAnnouncement>({
  title: String,
  description: String,
  image: String,
  forum: { type: Schema.Types.ObjectId, ref: 'Forum', required: true },
  start_date: String,
  end_date: String
}, { timestamps: true });

export default mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);
