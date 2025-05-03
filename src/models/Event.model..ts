import mongoose, { Schema, Document } from "mongoose";

export interface IEvent extends Document {
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  forum: mongoose.Types.ObjectId;
  image: string;
}

const EventSchema = new Schema<IEvent>({
  title: String,
  description: String,
  start_date: String,
  end_date: String,
  forum: { type: Schema.Types.ObjectId, ref: 'Forum', required: true },
  image: String
}, { timestamps: true });

export default mongoose.model<IEvent>('Event', EventSchema);
