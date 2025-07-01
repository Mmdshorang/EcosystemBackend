import mongoose, { Document, Schema, Model } from 'mongoose';

interface WorkExperience {
  company: string;
  position: string;
  duration: string;
}

interface SocialLinks {
  linkedin?: string;
  github?: string;
  website?: string;
}

export interface IProfile extends Document {
  user: mongoose.Types.ObjectId;
  fullName: string;
  avatar?: string;
  fieldOfStudy: string;
  bio?: string;
  skills: string[];
  workExperience: WorkExperience[];
  socialLinks: SocialLinks;
  teams: mongoose.Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}

const ProfileSchema: Schema<IProfile> = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  fullName: { type: String, required: true },
  avatar: { type: String, default: '/default-avatar.png' },
  fieldOfStudy: { type: String, required: true },
  bio: { type: String, maxlength: 250 },
  skills: [{ type: String, trim: true }],
  workExperience: [
    {
      company: { type: String },
      position: { type: String },
      duration: { type: String }
    }
  ],
  socialLinks: {
    linkedin: { type: String },
    github: { type: String },
    website: { type: String }
  },
  teams: [{ type: Schema.Types.ObjectId, ref: 'Team' }]
}, { timestamps: true });

const Profile: Model<IProfile> = mongoose.model<IProfile>('Profile', ProfileSchema);
export default Profile;
