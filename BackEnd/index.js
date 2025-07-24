// index.js
import TaskRoutes from './Route/TaskRoutes.js';
import UserRoutes from './Route/UserRoutes.js';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const app = express();
// Use the PORT environment variable, with a fallback
const port = process.env.PORT || process.env.PORT1 || 5000; // Added fallbacks

app.use(express.json());
app.use(cors());

// --- FIX: Mount routes under different prefixes ---
app.use('/api/tasks', TaskRoutes); // All task routes will be under /api/tasks/...
app.use('/api/users', UserRoutes); // All user routes will be under /api/users/...

const dbURI = process.env.MONGOURI;
mongoose.connect(dbURI, {})
  .then(() => {
    console.log("Connection successful");
  })
  .catch((error) => {
    console.error("Connection error", error);
  });

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
