import TaskRoutes from './Route/TaskRoutes.js';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
// Load environment variables from .env file
dotenv.config();
const app = express();
const port = process.env.PORT1;
app.use(express.json());
app.use(cors());
app.use('/', TaskRoutes);
const dbURI = process.env.MONGOURI;
mongoose.connect(dbURI, {}).then(() => {
console.log("Connection successful");
}).catch((error) => {
console.error("Connection error", error);
});
app.listen(port, () => {
console.log(`Server is running on port ${port}`);
});