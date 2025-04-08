import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { readdirSync } from "fs";
import morgan from 'morgan';
import cookieParser from "cookie-parser";

// import authRoutes from './routes/authRoutes.js';

dotenv.config();

// create express app
const app = express();

// apply middlewares
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));
app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());

// db connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));


// Auto-load routes
const loadRoutes = async () => {
    for (const file of readdirSync('./routes')) {
        const route = await import(`./routes/${file}`);
        app.use('/api', route.default);
    }
};
await loadRoutes();

// port
const port = process.env.PORT;

app.listen(port, () => console.log(`Server is running on port ${port}`));