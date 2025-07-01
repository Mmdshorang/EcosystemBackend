import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String }, // تصویر اصلی پروژه
  link: { type: String }, // لینک به پروژه (مثلا GitHub یا سایت دمو)
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  tags: [{ type: String, trim: true }],
  status: {
    type: String,
    enum: ['In Progress', 'Completed', 'Archived'],
    default: 'In Progress'
  },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

// برای جستجوی بهتر، می‌توان روی عنوان و تگ‌ها ایندکس گذاشت
ProjectSchema.index({ title: 'text', tags: 'text' });

export default mongoose.model('Project', ProjectSchema);