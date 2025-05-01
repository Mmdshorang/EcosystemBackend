import mongoose, { Schema, Document } from 'mongoose';

export interface ITeam extends Document {
  name: string;
  description: string;
  image: string;
  ratings: mongoose.Types.ObjectId[];
}

const TeamSchema = new Schema<ITeam>({
  name: { type: String, required: true },
  description: { type: String },
  image: { type: String },
  ratings: [{ type: Schema.Types.ObjectId, ref: 'Rating' }]
}, { timestamps: true });

export default mongoose.model<ITeam>('Team', TeamSchema);
