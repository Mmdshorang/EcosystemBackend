import mongoose, { Document, Schema, Model } from 'mongoose';

// Sub-document interfaces for better type safety
interface ITeamMember {
  user: mongoose.Types.ObjectId;
  roleInTeam: string;
}
interface TeamLean {
  _id: mongoose.Types.ObjectId;
  name: string;
}
interface ITeamRating {
  user: mongoose.Types.ObjectId;
  score: number;
}

// 1. Define the main TypeScript Interface for the document
export interface ITeam extends Document {
  name: string;
  description?: string;
  avatar?: string;
  leader: mongoose.Types.ObjectId;
  members: ITeamMember[];
  projects: mongoose.Types.ObjectId[];
  pendingRequests: mongoose.Types.ObjectId[];
  ratings: ITeamRating[];
  averageRating: number; // For the virtual property
}

// 2. Create the Schema
const TeamSchema: Schema<ITeam> = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  avatar: { type: String, default: '/default-team.png' },
  leader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      roleInTeam: { type: String, default: 'Member' }
    }
  ],
  projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
  pendingRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  ratings: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      score: { type: Number, required: true, min: 1, max: 5 }
    }
  ]
}, { timestamps: true });

// Virtual property for average rating
TeamSchema.virtual('averageRating').get(function(this: ITeam) {
  if (!this.ratings || this.ratings.length === 0) {
    return 0;
  }
  const sum = this.ratings.reduce((acc, rating) => acc + rating.score, 0);
  return parseFloat((sum / this.ratings.length).toFixed(1));
});

// Ensure virtuals are included in the output
TeamSchema.set('toJSON', { virtuals: true });
TeamSchema.set('toObject', { virtuals: true });

// 3. Create and export the Model, linking it with the interface
const Team: Model<ITeam> = mongoose.model<ITeam>('Team', TeamSchema);

export default Team;