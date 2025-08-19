import mongoose, { Document, Schema, Model } from 'mongoose';
import { IComment } from './Comment.model'; // تایپ کامنت را وارد کنید

// 1. فیلد کامنت‌ها را به اینترفیس اضافه کنید
export interface IEvent extends Document {
  title: string;
  description: string;
  image?: string;
  type: 'Workshop' | 'Seminar' | 'Competition' | 'Announcement';
  date: Date;
  location?: string;
  association: mongoose.Types.ObjectId;
  registeredUsers: mongoose.Types.ObjectId[];
  comments: mongoose.Types.ObjectId[] | IComment[]; // <-- این خط اضافه شد
  isArchived: boolean;
}

const EventSchema: Schema<IEvent> = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String },
  type: {
    type: String,
    enum: ['Workshop', 'Seminar', 'Competition', 'Announcement'],
    required: true
  },
  date: { type: Date, required: true },
  location: { type: String },
  association: { type: mongoose.Schema.Types.ObjectId, ref: 'Association', required: true },
  registeredUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isArchived: { type: Boolean, default: false },
  // ۲. فیلد کامنت‌ها را به اسکما اضافه کنید
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }] // <-- این خط اضافه شد
}, { timestamps: true });

const Event: Model<IEvent> = mongoose.model<IEvent>('Event', EventSchema);

export default Event;