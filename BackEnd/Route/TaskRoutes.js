import express from 'express';
import {
    
getTasks,
getTask,
CreateTask,
UpdateTask,
deleteUser

} from '../Controllers/MasterController.js'; 
const router = express.Router();

router.post('/tasks', CreateTask);

router.get('/tasks', getTasks);

router.get('/tasks/:id', getTask);

router.put('/tasks/:id', UpdateTask);

router.delete('/tasks/:id', deleteUser);

export default router;