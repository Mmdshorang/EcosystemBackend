import express, { RequestHandler } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import mongoSanitize from 'express-mongo-sanitize';
import passport from 'passport';

import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';
import uploadRoutes from './routes/upload.routes';
import projectRoutes from './routes/project.routes';
import usersRoutes from './routes/user.routes';
import eventRoutes from './routes/event.routes';
import associationRoutes from './routes/association.routes';
import messageRoutes from './routes/message.routes';
import commentRoutes from './routes/comment.routes';
import teamRoutes from './routes/team.routes';
import http from 'http'; // ۱. http را وارد کنید
import { Server } from 'socket.io';
import path from 'path';
import associationRequestRoutes from './routes/associationRequest.routes';
import teamRequestRoutes from './routes/teamRequestRoutes';

const app = express();

// log all incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);

  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', req.body);
  }
  if (req.query && Object.keys(req.query).length > 0) {
    console.log('Query:', req.query);
  }

  next();
});

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request data
app.use(mongoSanitize());

app.use(cors());

const httpServer = http.createServer(app);

// ۴. یک نمونه از سرور Socket.IO بسازید و به سرور http متصل کنید
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3000', // آدرس فرانت‌اند شما
    methods: ['GET', 'POST'],
  },
});

// منطق مدیریت کاربران آنلاین
let onlineUsers: { userId: string; socketId: string }[] = [];

io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);

  // وقتی یک کاربر لاگین می‌کند، ID خود را به سرور می‌فرستد
  socket.on('addNewUser', (userId) => {
    !onlineUsers.some((user) => user.userId === userId) && onlineUsers.push({ userId, socketId: socket.id });
    console.log('Online users:', onlineUsers);
  });

  // ارسال پیام
  socket.on('sendMessage', (message) => {
    const user = onlineUsers.find((u) => u.userId === message.receiver);
    if (user) {
      io.to(user.socketId).emit('getMessage', message);
    }
  });

  socket.on('disconnect', () => {
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
    console.log(`🔌 User disconnected: ${socket.id}`);
  });
});

// jwt authentication
app.use(passport.initialize() as unknown as RequestHandler);
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/association-requests', associationRequestRoutes);
app.use("/api/team-requests", teamRequestRoutes);
// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/api/events', eventRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/associations', associationRoutes);
// send back a 404 error for any unknown api request

export default app;
