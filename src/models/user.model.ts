import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkExperience {
  company: string;
  position: string;
  skillsUsed: string[];
}

export interface IUser extends Document {
  fullName: string;
  fieldOfStudy: string;
  skills: string[];
  workExperiences: IWorkExperience[];
  role: 'admin' | 'team_leader' | 'member' | 'forum_leader';
  profileImage?: string;
  teams: mongoose.Types.ObjectId[];
}

const UserSchema = new Schema<IUser>({
  fullName: { type: String, required: true },
  fieldOfStudy: { type: String },
  skills: [{ type: String }],
  workExperiences: [{
    company: String,
    position: String,
    skillsUsed: [String]
  }],
  role: { type: String, enum: ['admin', 'team_leader', 'member', 'forum_leader'], default: 'member' },
  profileImage: String,
  teams: [{ type: Schema.Types.ObjectId, ref: 'Team' }]
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
