// فایل: models/TeamJoinRequest.model.ts

import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ITeamJoinRequest extends Document {
  user: mongoose.Types.ObjectId;
  team: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  respondedAt?: Date;
}

const TeamJoinRequestSchema: Schema<ITeamJoinRequest> = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  team: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
    required: true,
  },
  respondedAt: { type: Date },
}, { timestamps: { createdAt: 'createdAt', updatedAt: false } });

const TeamJoinRequest: Model<ITeamJoinRequest> = mongoose.model<ITeamJoinRequest>('TeamJoinRequest', TeamJoinRequestSchema);
export default TeamJoinRequest;