import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String },
  type: {
    type: String,
    enum: ['Workshop', 'Seminar', 'Competition', 'Announcement'],
    required: true
  },
  date: { type: Date, required: true },
  location: { type: String },
  association: { type: mongoose.Schema.Types.ObjectId, ref: 'Association', required: true },
  registeredUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isArchived: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Event', EventSchema);