import mongoose, { Schema, Document } from "mongoose";

export interface IJoinRequest extends Document {
  user: mongoose.Types.ObjectId;
  team: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted' | 'rejected';
}

const JoinRequestSchema = new Schema<IJoinRequest>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  team: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }
}, { timestamps: true });

export default mongoose.model<IJoinRequest>('JoinRequest', JoinRequestSchema);
