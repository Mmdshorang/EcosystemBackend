import mongoose, { Schema, Document } from "mongoose";

export interface IUserSkill extends Document {
  user: mongoose.Types.ObjectId;
  skill: mongoose.Types.ObjectId;
}

const UserSkillSchema = new Schema<IUserSkill>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  skill: { type: Schema.Types.ObjectId, ref: 'Skill', required: true }
});

export default mongoose.model<IUserSkill>('UserSkill', UserSkillSchema);
