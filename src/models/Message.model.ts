import mongoose, { Document, Schema, Model } from 'mongoose';

// 1. Define the TypeScript Interface for the document
export interface IMessage extends Document {
  sender: mongoose.Types.ObjectId;
  receiver: mongoose.Types.ObjectId;
  content: string;
  isRead: boolean;
}

// 2. Create the Schema using the interface for type safety
const MessageSchema: Schema<IMessage> = new Schema({
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

// 3. Create and export the Model, linking it with the interface
const Message: Model<IMessage> = mongoose.model<IMessage>('Message', MessageSchema);

export default Message;