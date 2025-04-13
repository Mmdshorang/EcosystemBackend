import { Schema, model, Types } from "mongoose";

export interface IContract {
  title: string;
  content: string; // متن قرارداد
  createdBy: Types.ObjectId; // کاربری که قرارداد را ایجاد کرده
  signatures: {
    userId: Types.ObjectId
    signatureImage: string; // امضای دیجیتال (base64 یا URL تصویر)
    signedAt: Date;
  }[];
  createdAt: Date;
}

const contractSchema = new Schema<IContract>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  signatures: [
    {
      userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
      signatureImage: { type: String, required: true },
      signedAt: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

const ContractModel = model<IContract>("Contract", contractSchema);
export default ContractModel
