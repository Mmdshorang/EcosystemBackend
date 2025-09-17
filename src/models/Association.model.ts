// models/AssociationRequest.model.ts
import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IAssociationRequest extends Document {
  name: string;
  description?: string;
  logo?: string;
  reason?: string; // توضیح کاربر چرا انجمن لازم داره
  documents?: string[]; // مدارک ضمیمه
  contactInfo?: string; // راه ارتباطی
  category?: string; // دسته بندی انجمن
  requestedBy: mongoose.Types.ObjectId; // کاربری که درخواست داده
  status: 'pending' | 'approved' | 'rejected';
  adminNote?: string; // توضیح ادمین چرا رد/قبول شد
}

const AssociationRequestSchema: Schema<IAssociationRequest> = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  logo: { type: String },
  reason: { type: String },
  documents: [{ type: String }],
  contactInfo: { type: String },
  category: { type: String },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  adminNote: { type: String }
}, { timestamps: true });

const AssociationRequest: Model<IAssociationRequest> =
  mongoose.model<IAssociationRequest>('AssociationRequest', AssociationRequestSchema);

export default AssociationRequest;
