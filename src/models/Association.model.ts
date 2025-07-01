import mongoose from 'mongoose';

const AssociationSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  logo: { type: String },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.model('Association', AssociationSchema);