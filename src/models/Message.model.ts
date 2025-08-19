import mongoose, { Document, Schema, Model } from "mongoose";

export interface IMessage extends Document {
  sender: mongoose.Types.ObjectId;
  receiver: mongoose.Types.ObjectId;
  content: string;
  isRead: boolean;
  deletedFor: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema: Schema<IMessage> = new Schema(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    deletedFor: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
  },
  { timestamps: true }
);

// ایندکس برای جستجوی سریع‌تر
MessageSchema.index({ sender: 1, receiver: 1, createdAt: 1 });

const Message: Model<IMessage> = mongoose.model<IMessage>(
  "Message",
  MessageSchema
);

export default Message;
