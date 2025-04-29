import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';

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
  password: string;
  comparePassword(candidate: string): Promise<boolean>;
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
  teams: [{ type: Schema.Types.ObjectId, ref: 'Team' }],
  password: { type: String, required: true, minlength: 6 }
}, { timestamps: true });

// هش کردن رمز عبور قبل از ذخیره
UserSchema.pre('save', async function (next) {
  const user = this as IUser;
  if (!user.isModified('password')) return next();
  user.password = await bcrypt.hash(user.password, 10);
  next();
});

// متد برای مقایسه رمز عبور
UserSchema.methods.comparePassword = function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);
