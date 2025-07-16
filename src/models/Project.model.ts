
import mongoose, { Document, Schema, Model } from 'mongoose';
// فرض می‌کنیم تایپ کامنت را دارید
import { IUser } from './User.model';
import { IComment } from './Comment.model';

export interface IProject extends Document {
  title: string;
  description: string;
  image?: string;
  link?: string;
  team: mongoose.Types.ObjectId;
  tags: string[];
  status: 'In Progress' | 'Completed' | 'Archived';
  comments: mongoose.Types.ObjectId[] | IComment[]; // می‌تواند آرایه‌ای از ID یا آبجکت‌های populate شده باشد
  likes: mongoose.Types.ObjectId[] | IUser[];
  likeCount: number; // فیلد مجازی برای تعداد لایک
}

const ProjectSchema: Schema<IProject> = new Schema(
  {
    // ... فیلدهای دیگر شما بدون تغییر
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String },
    link: { type: String },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    tags: [{ type: String, trim: true }],
    status: {
      type: String,
      enum: ['In Progress', 'Completed', 'Archived'],
      default: 'In Progress',
    },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true },
);

// --- بخش جدید ---
// تعریف فیلد مجازی برای شمارش لایک‌ها
ProjectSchema.virtual('likeCount').get(function (this: IProject) {
  return this.likes.length;
});

// اطمینان از اینکه فیلدهای مجازی در خروجی JSON نمایش داده می‌شوند
ProjectSchema.set('toJSON', { virtuals: true });
ProjectSchema.set('toObject', { virtuals: true });
// --- پایان بخش جدید ---

ProjectSchema.index({ title: 'text', tags: 'text' });

const Project: Model<IProject> = mongoose.model<IProject>('Project', ProjectSchema);
export default Project;
