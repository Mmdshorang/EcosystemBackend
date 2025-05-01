import mongoose, { Schema, Document } from "mongoose";

export interface ITeamMember extends Document {
  user: mongoose.Types.ObjectId;
  team: mongoose.Types.ObjectId;
  role: 'member' | 'leader';
  joined_at: Date;
}

const TeamMemberSchema = new Schema<ITeamMember>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  team: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
  role: { type: String, enum: ['member', 'leader'], default: 'member' },
  joined_at: { type: Date, default: Date.now }
});

export default mongoose.model<ITeamMember>('TeamMember', TeamMemberSchema);
