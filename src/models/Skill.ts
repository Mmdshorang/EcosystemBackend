import mongoose, { Schema, Document } from "mongoose";

export interface ISkill extends Document {
  title: string;
}

const SkillSchema = new Schema<ISkill>({
  title: { type: String, required: true }
});

export default mongoose.model<ISkill>('Skill', SkillSchema);
