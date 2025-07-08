import mongoose, { Document, Schema, Model } from 'mongoose';

// 1. Define the TypeScript Interface for the Event document
export interface IEvent extends Document {
  title: string;
  description: string;
  image?: string;
  type: 'Workshop' | 'Seminar' | 'Competition' | 'Announcement';
  date: Date;
  location?: string;
  association: mongoose.Types.ObjectId;
  registeredUsers: mongoose.Types.ObjectId[];
  isArchived: boolean;
}

// 2. Create the Schema, linking it to the interface
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
  isArchived: { type: Boolean, default: false }
}, { timestamps: true });

// 3. Create and export the Model, ensuring it's typed with the interface
const Event: Model<IEvent> = mongoose.model<IEvent>('Event', EventSchema);

export default Event;