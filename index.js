// index.js
// App's main entry point
import dotenv from 'dotenv';
dotenv.config();

// import dependencies
import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import globalRoutes from './routes/global.route.js';

// Load environment variables
const app = express();

// Middleware
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use(globalRoutes);

// Connect to MongoDB
mongoose.connect(process.env.DB_URI).then(() => {
    console.log('Connected to MongoDB');
    app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT || 3000}`));
}).catch(err => console.error('Failed to connect to MongoDB:', err.message));