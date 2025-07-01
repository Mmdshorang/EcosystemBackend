// Comment Model
import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // می‌تواند برای پروژه، رویداد یا هر مدل دیگری باشد
  target: { type: mongoose.Schema.Types.ObjectId, required: true },
  targetModel: { type: String, required: true, enum: ['Project', 'Event'] }
}, { timestamps: true });

export default mongoose.model('Comment', CommentSchema);