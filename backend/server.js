import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import helmet from 'helmet';

import cookieParser from 'cookie-parser';
import cors from 'cors';
import connectDB from './config/db.js';


// Import routes
import authRoutes from './routes/authRoutes.js';
import propertyRoutes from './routes/propertyRoutes.js';
import userRoutes from './routes/userRoutes.js';
import inquiryRoutes from './routes/inquiryRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import aiRoutes from "./routes/aiRoutes.js";


// Import error middleware
import { errorHandler, notFound } from './middleware/errorMiddleware.js';


connectDB();

const app = express();

// ✅ CORS configuration 
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'https://property-dunia.vercel.app', 'https://gadgetsdunia.com', 'https://www.gadgetsdunia.com'], // Frontend URLs
  credentials: true,               // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(helmet());

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/properties', propertyRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/inquiries', inquiryRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use("/api/chat", aiRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));