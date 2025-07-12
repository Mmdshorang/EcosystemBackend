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
import teamRoutes from './routes/team.routes';

import path from 'path';

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

// jwt authentication
app.use(passport.initialize() as unknown as RequestHandler);
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);

app.use('/api/profiles', profileRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/team', teamRoutes);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/api/events', eventRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/associations', associationRoutes);
// send back a 404 error for any unknown api request

export default app;
