import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { faker } from '@faker-js/faker/locale/fa'; // از faker فارسی برای داده‌های بهتر استفاده می‌کنیم
import bcrypt from 'bcryptjs';

// // مدل‌ها
// import User from '.';
// import Profile from '../models/Profile.model';
// import Association from '../models/Association.model';
// import Team from '../models/Team.model';
// import Project from '../models/Project.model';
// import Event from '../models/Event.model';

// --- بارگذاری متغیرهای محیطی ---
dotenv.config();

// --- Database Connection ---
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // In a real app, this should be hashed
    role: { type: String, enum: ['user', 'team_lead', 'association_manager', 'admin'], default: 'user' },
    profile: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile' },
  },
  { timestamps: true },
);
const User = mongoose.model('User', UserSchema);

const ProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fullName: { type: String, required: true },
    avatar: { type: String},
    fieldOfStudy: { type: String, required: true },
    bio: { type: String, maxlength: 250 },
    skills: [{ type: String }],
    workExperience: [{ company: String, position: String, duration: String }],
    socialLinks: { linkedin: String, github: String, website: String },
    teams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }],
  },
  { timestamps: true },
);
const Profile = mongoose.model('Profile', ProfileSchema);

const AssociationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    logo: { type: String },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);
const Association = mongoose.model('Association', AssociationSchema);

const TeamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    avatar: { type: String },
    leader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [
      { user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, roleInTeam: { type: String, default: 'Member' } },
    ],
    projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
    ratings: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        score: { type: Number, min: 1, max: 5 },
      },
    ],
  },
  { timestamps: true },
);
const Team = mongoose.model('Team', TeamSchema);

const ProjectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, default: () => faker.image.urlLoremFlickr({ category: 'technology' }) },
    link: { type: String },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    tags: [{ type: String }],
    status: { type: String, enum: ['In Progress', 'Completed', 'Archived'], default: 'In Progress' },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true },
);
const Project = mongoose.model('Project', ProjectSchema);

const EventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, default: () => faker.image.urlLoremFlickr({ category: 'business' }) },
    type: { type: String, enum: ['Workshop', 'Seminar', 'Competition', 'Announcement'], required: true },
    date: { type: Date, required: true },
    location: { type: String },
    association: { type: mongoose.Schema.Types.ObjectId, ref: 'Association', required: true },
    registeredUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true },
);
const Event = mongoose.model('Event', EventSchema);

const CommentSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    target: { type: mongoose.Schema.Types.ObjectId, required: true },
    targetModel: { type: String, required: true, enum: ['Project', 'Event'] },
  },
  { timestamps: true },
);
const Comment = mongoose.model('Comment', CommentSchema);

const MessageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true },
);
const Message = mongoose.model('Message', MessageSchema);

const EventRegistrationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);
const EventRegistration = mongoose.model('EventRegistration', EventRegistrationSchema);

const destroyData = async () => {
  try {
    // رعایت ترتیب برای پاک کردن
    await Event.deleteMany();
    await Project.deleteMany();
    await Team.deleteMany();
    await Association.deleteMany();
    await Profile.deleteMany();
    await User.deleteMany();

    console.log('Data Destroyed! 💥');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const importData = async () => {
  try {
    // این خط را حذف یا کامنت می‌کنیم تا داده‌های قبلی پاک نشوند
    // await destroyData();

    // ۱. ساخت کاربران جدید (این بخش همچنان کاربران جدید اضافه می‌کند)
    console.log('Checking for existing users and adding new ones...');
    const userCount = await User.countDocuments();
    if (userCount < 20) {
      // فقط اگر کمتر از ۲۰ کاربر وجود داشت، کاربر جدید بساز
      const users = [];
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('123456', salt);
      for (let i = 0; i < 20 - userCount; i++) {
        users.push({
          username: faker.internet.userName(),
          email: faker.internet.email(),
          password: hashedPassword,
          role: 'user',
        });
      }
      await User.insertMany(users);
      console.log(`✅ ${20 - userCount} new users created!`);
    } else {
      console.log('ℹ️ User count is sufficient, skipping user creation.');
    }

    // ۲. ساخت یا به‌روزرسانی انجمن‌های علمی (روش هوشمند)
    console.log('Upserting Associations...');
    const managers = await User.find({ role: 'association_manager' }).limit(3);
    if (managers.length < 3) {
      console.warn('⚠️ Not enough association managers found to create all associations.');
      return;
    }

    // در این بخش، URL تصویر را با متد جدید faker تولید می‌کنیم
    const associationData = [
      {
        find: { name: 'انجمن علمی کامپیوتر' },
        set: {
          // Use the new, correct method for generating an image URL
          logo: '/uploads/assoc-cs1.png',
          manager: managers[0]._id,
          description: 'انجمن تخصصی دانشجویان مهندسی و علوم کامپیوتر',
        },
      },
      {
        find: { name: 'انجمن علمی برق' },
        set: {
          logo: '/uploads/assoc-cs2.png',
          manager: managers[1]._id,
          description: 'مرکز فعالیت‌های علمی دانشجویان مهندسی برق',
        },
      },
      {
        find: { name: 'شاخه دانشجویی IEEE' },
        set: {
          logo: '/uploads/assoc-cs3.png',
          manager: managers[2]._id,
          description: 'بزرگترین انجمن حرفه‌ای فنی در جهان',
        },
      },
    ];

    for (const assoc of associationData) {
      await Association.findOneAndUpdate(assoc.find, { $set: assoc.set }, { upsert: true, new: true });
    }
    console.log('✅ Associations upserted!');

    // ۳. ساخت یا به‌روزرسانی تیم‌ها (روش هوشمند)
    console.log('Upserting Teams...');
    const leaders = await User.find({ role: 'team_lead' }).limit(3);
    if (leaders.length < 3) {
      console.warn('⚠️ Not enough team leaders found to create all teams.');
      return;
    }
    const teamData = [
      {
        find: { name: 'تیم سایبری آنوبیس' },
        set: {
          avatar: '/uploads/team-anubis.png',
          description: 'توسعه ابزارهای امنیت شبکه و شرکت در مسابقات CTF.',
          leader: leaders[0]._id,
        },
      },
      {
        find: { name: 'تیم داده‌کاوان' },
        set: {
          avatar: '/uploads/team-data.png',
          description: 'تحلیل داده‌های بزرگ و پیاده‌سازی مدل‌های یادگیری ماشین.',
          leader: leaders[1]._id,
        },
      },
      {
        find: { name: 'تیم بازی‌سازان' },
        set: {
          avatar: '/uploads/team-game.png',
          description: 'توسعه بازی‌های موبایل با موتور بازی‌سازی Unity.',
          leader: leaders[2]._id,
        },
      },
    ];

    for (const team of teamData) {
      await Team.findOneAndUpdate(team.find, { $set: team.set }, { upsert: true, new: true });
    }
    console.log('✅ Teams upserted!');

    // ... می‌توانید برای رویدادها و پروژه‌ها نیز همین منطق را پیاده‌سازی کنید ...

    console.log('\nData seeding/updating process finished! 🎉');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// --- منطق اجرای اسکریپت ---
const runSeeder = async () => {
  await connectDB();
  if (process.argv[2] === '-d') {
    await destroyData();
  } else {
    await importData();
  }
  process.exit();
};

runSeeder();
