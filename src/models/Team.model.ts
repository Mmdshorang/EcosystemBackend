import mongoose from 'mongoose';

const TeamSchema = new mongoose.Schema({
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

  // === فیلد جدید برای امتیازدهی ===
  ratings: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      score: { type: Number, required: true, min: 1, max: 5 } // امتیاز از ۱ تا ۵
    }
  ]

}, { timestamps: true });

// === یک متد مجازی برای محاسبه میانگین امتیاز ===
TeamSchema.virtual('averageRating').get(function() {
  if (this.ratings.length === 0) {
    return 0;
  }
  const sum = this.ratings.reduce((acc, rating) => acc + rating.score, 0);
  return (sum / this.ratings.length).toFixed(1); // میانگین با یک رقم اعشار
});

// برای اینکه فیلدهای مجازی در خروجی JSON نمایش داده شوند
TeamSchema.set('toJSON', { virtuals: true });
TeamSchema.set('toObject', { virtuals: true });

export default mongoose.model('Team', TeamSchema);