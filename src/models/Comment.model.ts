import mongoose, { Document, Schema, Model } from 'mongoose';

// 1. Add the "export" keyword before the interface
export interface IComment extends Document {
  text: string;
  author: mongoose.Types.ObjectId;
  target: mongoose.Types.ObjectId;
  targetModel: 'Project' | 'Event';
}

const CommentSchema: Schema<IComment> = new mongoose.Schema({
  text: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  target: { type: mongoose.Schema.Types.ObjectId, required: true },
  targetModel: { type: String, required: true, enum: ['Project', 'Event'] }
}, { timestamps: true });

// 2. The default export for the model remains the same
const Comment: Model<IComment> = mongoose.model<IComment>('Comment', CommentSchema);

export default Comment;