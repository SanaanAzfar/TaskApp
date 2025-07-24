// backend/routes/TaskRoutes.js
import express from 'express';
import { authenticate } from '../Middleware/Authenticate.js';
import {
    getTasks,
    getTask,
    CreateTask,
    UpdateTask,
    DeleteTask,
    getTasksById,
    getSharedTask,
    ShareTask,
    UnShareTask
} from '../Controllers/TaskController.js'; 

const router = express.Router();

router.use(authenticate);

// --- FIX: Paths are now relative to /api/tasks ---
router.post('/', CreateTask);        // Handles POST /api/tasks

router.get('/', getTasks);           // Handles GET /api/tasks

router.get('/:id', getTask);         // Handles GET /api/tasks/:id

router.put('/:id', UpdateTask);      // Handles PUT /api/tasks/:id

router.delete('/:id', DeleteTask);   // Handles DELETE /api/tasks/:id

// Task sharing routes (paths are relative to /api/tasks)
router.get('/:id/shared', getSharedTask); // Handles GET /api/tasks/:id/shared

router.get('/:id/user', getTasksById);    // Handles GET /api/tasks/:id/user

router.patch('/:id/share', ShareTask);    // Handles PATCH /api/tasks/:id/share

router.patch('/:id/unshare', UnShareTask); // Handles PATCH /api/tasks/:id/unshare

export default router;
