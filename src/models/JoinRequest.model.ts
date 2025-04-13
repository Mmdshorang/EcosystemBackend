import mongoose, { Schema, Document } from 'mongoose';

export interface IJoinRequest extends Document {
  fromUser: mongoose.Types.ObjectId;
  toTeam: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted' | 'rejected';
}

const JoinRequestSchema = new Schema<IJoinRequest>({
  fromUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  toTeam: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }
}, { timestamps: true });

export default mongoose.model<IJoinRequest>('JoinRequest', JoinRequestSchema);
