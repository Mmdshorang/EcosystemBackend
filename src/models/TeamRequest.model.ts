import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ITeamRequest extends Document {
  name: string;
  description?: string;
  avatar?: string;
  category?: string;
  contactInfo?: string;
  reason: string;
  documents: string[];
  requestedBy: mongoose.Types.ObjectId;
  status: 'pending' | 'approved' | 'rejected';
  adminNote?: string;
}

const TeamRequestSchema: Schema<ITeamRequest> = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  avatar: { type: String },
  category: { type: String },
  contactInfo: { type: String },
  reason: { type: String  },
  documents: [{ type: String }],
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  adminNote: { type: String }
}, { timestamps: true });

const TeamRequest: Model<ITeamRequest> = mongoose.model<ITeamRequest>('TeamRequest', TeamRequestSchema);
export default TeamRequest;
