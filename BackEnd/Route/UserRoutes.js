// backend/routes/UserRoutes.js
import express from 'express';
// import { authenticate } from '../Middleware/Authenticate.js'; // Keep if needed elsewhere
import {
    RegisterUser,
    LoginUser,
    GetAllUsers // <-- Import the new controller function
} from '../Controllers/UserController.js'; 

const router = express.Router();

// Public routes (No authentication required for these)
router.post('/Login', LoginUser);
router.post('/Register', RegisterUser);
// --- NEW ROUTE: Get All Users (FOR DEBUGGING ONLY) ---
// Note: Uses GET method and is placed after POST routes
router.get('/AllUsers', GetAllUsers); // <-- Add this line

export default router;
