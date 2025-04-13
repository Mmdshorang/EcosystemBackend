import mongoose, { Schema, Document } from 'mongoose';

interface IMember {
  user: mongoose.Types.ObjectId;
  role: 'leader' | 'member';
}

export interface ITeam extends Document {
  name: string;
  members: IMember[];
  projects: mongoose.Types.ObjectId[];
}

const TeamSchema = new Schema<ITeam>({
  name: { type: String, required: true },
  members: [{
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['leader', 'member'], default: 'member' }
  }],
  projects: [{ type: Schema.Types.ObjectId, ref: 'Project' }]
}, { timestamps: true });

export default mongoose.model<ITeam>('Team', TeamSchema);
