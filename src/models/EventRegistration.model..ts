import mongoose, { Schema, Document } from "mongoose";

export interface IEventRegistration extends Document {
  user: mongoose.Types.ObjectId;
  event: mongoose.Types.ObjectId;
}

const EventRegistrationSchema = new Schema<IEventRegistration>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  event: { type: Schema.Types.ObjectId, ref: 'Event', required: true }
}, { timestamps: { createdAt: true, updatedAt: false } });

export default mongoose.model<IEventRegistration>('EventRegistration', EventRegistrationSchema);
