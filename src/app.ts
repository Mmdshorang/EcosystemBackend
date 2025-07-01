import express, { RequestHandler } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import mongoSanitize from 'express-mongo-sanitize';
import passport from 'passport';

import authRoutes from './routes/auth';
import profileRoutes from './routes/profile'; // <-- این خط را اضافه کنید

const app = express();


// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request data
app.use(mongoSanitize());

// gzip compression


// enable cors for any route
app.use(cors());

// jwt authentication
app.use(passport.initialize() as unknown as RequestHandler);




app.use('/api/auth', authRoutes);

app.use('/api/profiles', profileRoutes); // <-- این خط را اضافه کنید

// send back a 404 error for any unknown api request


export default app;
