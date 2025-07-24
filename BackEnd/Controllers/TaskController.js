import Task from "../Model/TaskModel.js";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

//For Task
export const getTasks = async (req, res) => {
    try {
        const tasks = await Task.find();
        if (!tasks) {
            return res.status(405).json({ message: "No tasks added yet" });
        }
        res.status(200).send(tasks);
    } catch (error) {
        console.error('Error fetching products:', error.message);
        res.status(500).json({ message: error.message });
    }
};

// backend/Controllers/TaskController.js
export const getTask = async (req, res) => {
    try {
        const id = req.params.id; // Get ID from URL parameter
        console.log(`Fetching task with ID: ${id}`); // Add log for debugging

        // --- Use findById (assuming 'id' is a valid MongoDB ObjectId string) ---
        const task = await Task.findById(id); // Find task by ID (changed variable name for clarity)

        if (!task) {
            // --- FIX 1: Correct status code for "Not Found" ---
            console.log(`Task with ID ${id} not found.`); // Add log
            return res.status(404).json({ message: "Task not found" }); // <-- 404 Not Found
        }

        // --- FIX 2: Use res.json for consistency (optional but good practice) ---
        res.status(200).json(task); // Send the found task as JSON
    } catch (error) {
        // --- FIX 3: Improve error logging message ---
        console.error('Error fetching task (server-side):', error.message);
        // Differentiate between server errors and not found
        // Mongoose might throw CastError if id is malformed
        if (error.name === 'CastError') {
             return res.status(400).json({ message: "Invalid task ID format" });
        }
        // For other unexpected errors
        res.status(500).json({ message: "Internal server error while fetching task", error: error.message });
    }
};


export const getTasksById = async (req, res) => {
    try {
        const userid=req.userId;
        if(!userid)
          {

            return res.status(400).json({ message: "UseId Not Found" });
          }
        const tasks = await Task.find(
          {$or:[{Owner:userid},{Shared:usrid}]
          });
        if (!tasks) {
            return res.status(405).json({ message: "No tasks added yet" });
        }
        res.status(200).send(tasks);
    } catch (error) {
        console.error('Error fetching products:', error.message);
        res.status(500).json({ message: error.message });
    }
};


export const getSharedTask = async (req, res) => {
    try {
        const id = req.params.id;
        const tasks = await Task.findById(id);
        if (!tasks) {
            return res.status(405).json({ message: "No tasks added yet" });
        }
        res.status(200).send(tasks.Shared);
    } catch (error) {
        console.error('Error fetching products:', error.message);
        res.status(500).json({ message: error.message });
    }
};

export const ShareTask = async (req, res) => {
    try {
        const { userId: userToShareWith } = req.body; // The user to share with
        const taskId = req.params.id;

        // Only Owner can share
        const task = await Task.findOneAndUpdate(
            { 
                _id: taskId, 
                Owner: req.userId
            },
            { $addToSet: { Shared: userToShareWith } },
            { new: true }
        );

        if (!task) {
            return res.status(404).json({ message: "Task not found or unauthorized" });
        }

        res.status(200).json({
            message: "Task shared successfully",
            sharedWith: task.Shared
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


export const UnShareTask = async (req, res) => {
    try {
        const { userId: userToRemove } = req.body; // The user to unshare
        const taskId = req.params.id;

        // Only Owner can unshare
        const task = await Task.findOneAndUpdate(
            { 
                _id: taskId, 
                Owner: req.userId // ✅ Ensures only Owner can unshare
            },
            { $pull: { Shared: userToRemove } },
            { new: true }
        );

        if (!task) {
            return res.status(404).json({ message: "Task not found or unauthorized" });
        }

        res.status(200).json({
            message: "User removed from shared list",
            sharedWith: task.Shared
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


export const CreateTask = async (req, res) => {
    try {
        const givenData = req.body;
        const NewTask = new Task({
            Title: givenData.Title,
            Owner:givenData.Owner,
            Description: givenData.Description,
            Status: givenData.Status,
            Due_Date: givenData.Due_Date
        });
        const savedTask =await NewTask.save();
        res.status(200).json({
            message: "Added New Task",
            changes: savedTask
        });
    } catch (error) {
        console.error(error);
        return res.staus(500).json({ message: "Server error", error: error.message });
    }
};

export const UpdateTask = async (req, res) => {
    try {
        const givenData = req.body;
        let id = req.params.id;
        const task = await Task.findByIdAndUpdate(id, givenData, { new: true, runValidators: true });
        if (!task) {
            return res.status(404).json({ message: "Task Not Found" });
        }
        res.status(200).json({
            message: "Updated Task",
            changes: task
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};



export const DeleteTask = async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) {
            return res.status(404).json({ message: "Task Not Found" });
        }
        res.status(200).send(task);
    } catch (error) {
        res.status(500).send(error);
    }
};
