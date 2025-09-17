// models/Event.model.ts
import mongoose, { Document, Schema, Model } from 'mongoose';
import { IComment } from './Comment.model';

export interface IEvent extends Document {
  title: string;
  description: string;
  image?: string;
  type: 'Workshop' | 'Seminar' | 'Competition' | 'Announcement';
  date: Date;
  location?: string;
  association: mongoose.Types.ObjectId; // درست شد
  registeredUsers: mongoose.Types.ObjectId[];
  comments: mongoose.Types.ObjectId[] | IComment[];
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
  association: { type: mongoose.Schema.Types.ObjectId, ref: 'AssociationRequest', required: true }, // <- اصلاح شد
  registeredUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isArchived: { type: Boolean, default: false },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
}, { timestamps: true });

const Event: Model<IEvent> = mongoose.model<IEvent>('Event', EventSchema);

export default Event;
