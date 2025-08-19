import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: 'user' | 'team_lead' | 'association_manager' | 'admin';
  profile: mongoose.Types.ObjectId;
}

const UserSchema: Schema<IUser> = new Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['user', 'team_lead', 'association_manager', 'admin'],
    default: 'user'
  },
  profile: { type: Schema.Types.ObjectId, ref: 'Profile' }
}, { timestamps: true });

const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);
export default User;