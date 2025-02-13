import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import cookieParser from 'cookie-parser';
import nocache from 'nocache';

import connectDB from './configs/database.config';

import userRoute from './routes/user.routes';
import authRoute from './routes/auth.routes';
import adminRoute from './routes/admin.routes';

dotenv.config();

const app = express();

connectDB();

app.use(nocache());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const corsOptions = {
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedMethods: ['Content-Type', 'Authorization'],
    credentials: true
}

app.use(cors(corsOptions));

app.use('/api/auth', authRoute);
app.use('/api/admin', adminRoute);
app.use('/api/user', userRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
