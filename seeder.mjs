import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { faker } from '@faker-js/faker';

// --- Load Environment Variables ---
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

// --- Define All Schemas and Models ---
// Note: All schemas are defined here to make the script self-contained.

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // In a real app, this should be hashed
  role: { type: String, enum: ['user', 'team_lead', 'association_manager', 'admin'], default: 'user' },
  profile: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile' }
}, { timestamps: true });
const User = mongoose.model('User', UserSchema);

const ProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fullName: { type: String, required: true },
  avatar: { type: String, default: () => faker.image.avatar() },
  fieldOfStudy: { type: String, required: true },
  bio: { type: String, maxlength: 250 },
  skills: [{ type: String }],
  workExperience: [{ company: String, position: String, duration: String }],
  socialLinks: { linkedin: String, github: String, website: String },
  teams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }]
}, { timestamps: true });
const Profile = mongoose.model('Profile', ProfileSchema);

const AssociationSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  logo: { type: String, default: () => faker.image.business(150, 150, true) },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });
const Association = mongoose.model('Association', AssociationSchema);

const TeamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  avatar: { type: String, default: () => faker.image.avatarGitHub() },
  leader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, roleInTeam: { type: String, default: 'Member' } }],
  projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
  ratings: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, score: { type: Number, min: 1, max: 5 } }]
}, { timestamps: true });
const Team = mongoose.model('Team', TeamSchema);

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, default: () => faker.image.urlLoremFlickr({ category: 'technology' }) },
  link: { type: String },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  tags: [{ type: String }],
  status: { type: String, enum: ['In Progress', 'Completed', 'Archived'], default: 'In Progress' },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });
const Project = mongoose.model('Project', ProjectSchema);

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, default: () => faker.image.urlLoremFlickr({ category: 'business' }) },
  type: { type: String, enum: ['Workshop', 'Seminar', 'Competition', 'Announcement'], required: true },
  date: { type: Date, required: true },
  location: { type: String },
  association: { type: mongoose.Schema.Types.ObjectId, ref: 'Association', required: true },
  registeredUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });
const Event = mongoose.model('Event', EventSchema);

const CommentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  target: { type: mongoose.Schema.Types.ObjectId, required: true },
  targetModel: { type: String, required: true, enum: ['Project', 'Event'] }
}, { timestamps: true });
const Comment = mongoose.model('Comment', CommentSchema);

const MessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });
const Message = mongoose.model('Message', MessageSchema);

const EventRegistrationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true }
}, { timestamps: { createdAt: true, updatedAt: false } });
const EventRegistration = mongoose.model('EventRegistration', EventRegistrationSchema);


// --- Main Seeder Function ---
const importData = async () => {
  try {
    console.log('Cleaning database...');
    await destroyData(true); // Clean before import

    // --- 1. Create Users & Profiles ---
    console.log('Creating users and profiles...');
    const users = [];
    for (let i = 0; i < 20; i++) { // Create 20 users
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      
      let role = 'user';
      if (i < 2) role = 'admin';
      else if (i < 5) role = 'association_manager';
      else if (i < 10) role = 'team_lead';

      const user = new User({
        username: faker.internet.userName({ firstName, lastName }),
        email: faker.internet.email({ firstName, lastName }),
        password: 'password123', // Plain text for testing
        role: role,
      });
      users.push(user);
    }
    const createdUsers = await User.insertMany(users);

    const profiles = createdUsers.map(user => {
      return new Profile({
        user: user._id,
        fullName: faker.person.fullName(),
        fieldOfStudy: faker.person.jobArea(),
        bio: faker.lorem.sentence(),
        skills: faker.helpers.arrayElements(['JavaScript', 'React', 'Node.js', 'Python', 'UX Design', 'Marketing'], 3),
      });
    });
    const createdProfiles = await Profile.insertMany(profiles);
    
    // Link profiles back to users
    for (let i = 0; i < createdUsers.length; i++) {
        createdUsers[i].profile = createdProfiles[i]._id;
        await createdUsers[i].save();
    }
    console.log('✅ Users & Profiles created.');

    // --- 2. Create Associations ---
    console.log('Creating associations...');
    const managers = await User.find({ role: 'association_manager' });
    const associations = managers.map(manager => new Association({
        name: faker.company.name() + ' Association',
        description: faker.company.catchPhrase(),
        manager: manager._id
    }));
    const createdAssociations = await Association.insertMany(associations);
    console.log('✅ Associations created.');

    // --- 3. Create Teams ---
    console.log('Creating teams...');
    const leaders = await User.find({ role: 'team_lead' });
    const regularUsers = await User.find({ role: 'user' });
    const teams = leaders.map(leader => new Team({
        name: faker.commerce.productName() + ' Team',
        description: faker.lorem.sentence(),
        leader: leader._id,
        members: [{ user: leader._id, roleInTeam: 'Leader' }, ...faker.helpers.arrayElements(regularUsers, 3).map(u => ({ user: u._id }))]
    }));
    const createdTeams = await Team.insertMany(teams);
    console.log('✅ Teams created.');

    // --- 4. Create Projects ---
    console.log('Creating projects...');
    const projects = [];
    for(const team of createdTeams) {
        for(let i = 0; i < 2; i++) { // 2 projects per team
            projects.push(new Project({
                title: faker.commerce.productName(),
                description: faker.lorem.paragraphs(2),
                team: team._id,
                tags: faker.helpers.arrayElements(['AI', 'Web App', 'Mobile', 'SaaS'], 2),
                likes: faker.helpers.arrayElements(createdUsers, 5).map(u => u._id),
            }));
        }
    }
    const createdProjects = await Project.insertMany(projects);
    console.log('✅ Projects created.');

    // --- 5. Create Events & Registrations ---
    console.log('Creating events...');
    const events = [];
    for (const assoc of createdAssociations) {
        for (let i = 0; i < 3; i++) { // 3 events per association
            const registered = faker.helpers.arrayElements(regularUsers, 8);
            events.push(new Event({
                title: faker.lorem.words(4),
                description: faker.lorem.paragraph(),
                type: faker.helpers.arrayElement(['Workshop', 'Seminar', 'Competition', 'Announcement']),
                date: faker.date.future(),
                location: faker.location.city(),
                association: assoc._id,
                registeredUsers: registered.map(u => u._id),
            }));
        }
    }
    const createdEvents = await Event.insertMany(events);
    
    const eventRegistrations = createdEvents.flatMap(event => 
        event.registeredUsers.map(userId => ({ user: userId, event: event._id }))
    );
    await EventRegistration.insertMany(eventRegistrations);
    console.log('✅ Events & Registrations created.');
    
    // --- 6. Create Comments ---
    console.log('Creating comments...');
    const comments = [];
    for(let i = 0; i < 50; i++) {
        const author = faker.helpers.arrayElement(createdUsers);
        const targetProject = faker.helpers.arrayElement(createdProjects);
        comments.push({
            text: faker.lorem.sentence(),
            author: author._id,
            target: targetProject._id,
            targetModel: 'Project'
        });
    }
    await Comment.insertMany(comments);
    console.log('✅ Comments created.');
    
    // --- 7. Create Messages ---
    console.log('Creating messages...');
    const messages = [];
    for(let i = 0; i < 100; i++) {
        const sender = faker.helpers.arrayElement(createdUsers);
        let receiver = faker.helpers.arrayElement(createdUsers);
        // Ensure sender and receiver are not the same
        while (sender._id.equals(receiver._id)) {
            receiver = faker.helpers.arrayElement(createdUsers);
        }
        messages.push({
            sender: sender._id,
            receiver: receiver._id,
            content: faker.lorem.sentence(),
        });
    }
    await Message.insertMany(messages);
    console.log('✅ Messages created.');


    console.log('\nData Imported Successfully! 🎉');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};


// --- Data Destruction Function ---
const destroyData = async (silent = false) => {
  try {
    // Order of deletion doesn't strictly matter with no foreign key constraints,
    // but it's good practice to be mindful.
    await Project.deleteMany();
    await Team.deleteMany();
    await Association.deleteMany();
    await Profile.deleteMany();
    await User.deleteMany();
    await Event.deleteMany();
    await Comment.deleteMany();
    await Message.deleteMany();
    await EventRegistration.deleteMany();

    if (!silent) {
        console.log('Data Destroyed! 💥');
        process.exit();
    }
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};


// --- Command Line Logic ---
const run = async () => {
    await connectDB();
    if (process.argv[2] === '-d') {
        await destroyData();
    } else {
        await importData();
    }
}

run();