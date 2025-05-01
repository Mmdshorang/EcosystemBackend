import { Document, Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  fullName: string;
  password: string;
  fieldOfStudy?: string;
  skills?: string[];
  profileImage?: string;
  role: 'user' | 'admin';
  comparePassword: (candidatePassword: string) => Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  fullName: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  fieldOfStudy: String,
  skills: [String],
  profileImage: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
}, { timestamps: true });

// رمزنگاری پیش از ذخیره
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// متد مقایسه رمز عبور
UserSchema.methods.comparePassword = async function (
  this: IUser,
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default model<IUser>('User', UserSchema);
