import mongoose, { Document, Schema, Model } from 'mongoose';

// 1. Define the TypeScript Interface for the document
export interface IAssociation extends Document {
  name: string;
  description?: string;
  logo?: string;
  manager: mongoose.Types.ObjectId;
}

// 2. Create the Schema, linking it to the interface
const AssociationSchema: Schema<IAssociation> = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  logo: { type: String },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// 3. Create and export the Model, ensuring it's typed with the interface
const Association: Model<IAssociation> = mongoose.model<IAssociation>('Association', AssociationSchema);

export default Association;