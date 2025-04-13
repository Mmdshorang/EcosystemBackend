import mongoose, { Schema, Document } from 'mongoose';

export interface IRating extends Document {
  byUser: mongoose.Types.ObjectId;
  to: {
    kind: 'project' | 'team' | 'user';
    item: mongoose.Types.ObjectId;
  };
  score: number;
  comment?: string;
}

const RatingSchema = new Schema<IRating>({
  byUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  to: {
    kind: { type: String, enum: ['project', 'team', 'user'], required: true },
    item: { type: Schema.Types.ObjectId, required: true }
  },
  score: { type: Number, min: 0, max: 5, required: true },
  comment: String
}, { timestamps: true });

export default mongoose.model<IRating>('Rating', RatingSchema);
