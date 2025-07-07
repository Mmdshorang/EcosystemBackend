import express, { RequestHandler } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import mongoSanitize from 'express-mongo-sanitize';
import passport from 'passport';

import authRoutes from './routes/auth';
import profileRoutes from './routes/profile'; 
import uploadRoutes from './routes/upload.routes'; 

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


app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/upload', uploadRoutes);
app.use('/api/auth', authRoutes);

app.use('/api/profiles', profileRoutes); 

// send back a 404 error for any unknown api request


export default app;
