import Task from "../Model/TaskModel.js";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose'; 
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
        // --- CHANGE: Get user ID from URL parameter ---
        const targetUserId = req.params.userId; // Get user ID from URL path parameter
        console.log(`DEBUG getTasksById: Request received for user ID: ${targetUserId}`); // Debug log

        if (!targetUserId) {
            console.log("DEBUG getTasksById: UserId not provided in URL parameters");
            return res.status(400).json({ message: "UserId not provided in URL" });
        }

        // Optional: Add a security check to ensure the requester can access this user's tasks
        // This example allows fetching any user's tasks if you have a valid auth token.
        // A stricter version might be:
         if (req.userId !== targetUserId) {
            return res.status(403).json({ message: "Access denied to tasks for this user." });
         }

        // --- CHANGE: Validate ObjectId format (good practice) ---
        // Assuming you're using Mongoose, check if the provided ID is a valid ObjectId format
         if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
             console.log(`DEBUG getTasksById: Invalid ObjectId format provided: ${targetUserId}`);
             return res.status(400).json({ message: "Invalid user ID format provided." });
         }

        // --- CHANGE: Use targetUserId in the query ---
        const tasks = await Task.find({
            $or: [
                { Owner: targetUserId },
                { Shared: targetUserId }
            ]
        });
        console.log(`DEBUG getTasksById: Found ${tasks.length} tasks for user ${targetUserId}`); // Debug log

        res.status(200).send(tasks); // Send found tasks (or [])
    } catch (error) {
        console.error('DEBUG getTasksById: Error occurred during task fetching:', error);
        // Handle potential CastError if targetUserId is invalid for Owner/Shared fields
        // This might be redundant if you check isValid() above, but good as a fallback
        if (error.name === 'CastError') {
             console.error('DEBUG getTasksById: Mongoose CastError details:', error.path, error.value);
             return res.status(400).json({ message: "Invalid user ID format provided (CastError)." });
        }
        res.status(500).json({ message: "Internal server error while fetching tasks", error: error.message });
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
        
        console.log("DEBUG ShareTask: Authenticated User ID (req.userId):", req.userId); // <-- ADD THIS
        console.log("DEBUG ShareTask: Task ID from URL (req.params.id):", req.params.id); // <-- ADD THIS
        console.log("DEBUG ShareTask: User ID to share with (req.body.userId):", req.body.userId);
        
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


// Inside backend/Controllers/TaskController.js -> CreateTask function
export const CreateTask = async (req, res) => {
  try {
    const givenData = req.body;
    const NewTask = new Task({
      Title: givenData.Title,
      Owner: req.userId, // Correctly using authenticated user
      Description: givenData.Description,
      Status: givenData.Status,
      Due_Date: givenData.Due_Date
    });
    const savedTask = await NewTask.save();
    // --- FIX: Send the task object directly with 201 Created ---
    res.status(201).json(savedTask); // <-- Send the saved task object directly
    // --- END FIX ---
    // Optionally, you could wrap it: res.status(201).json({ task: savedTask });
    // But sending the object directly is common practice.
  } catch (error) {
    console.error("Error creating task (server-side):", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Inside backend/Controllers/TaskController.js -> UpdateTask function
export const UpdateTask = async (req, res) => {
    try {
        const taskId = req.params.id; // Get task ID from URL
        const givenData = req.body;   // Get update data from request body
        const userId = req.userId;    // Get authenticated user ID

        // --- ADD AUTHORIZATION CHECK ---
        // Find the task and check if the requesting user is the owner
        const task = await Task.findOne({ _id: taskId, Owner: userId });
        if (!task) {
            // Task not found OR user is not the owner
            return res.status(403).json({ message: "Access denied. Only the task owner can update this task." });
            // Alternatively, return 404 if you don't want to reveal task existence: 
            // return res.status(404).json({ message: "Task not found." });
        }
        // --- END AUTHORIZATION CHECK ---

        // If check passes, proceed with the update
        const updatedTask = await Task.findByIdAndUpdate(taskId, givenData, { new: true, runValidators: true });
        // Note: findByIdAndUpdate might be redundant check now, but kept for robustness
        // You could also just use `task` and `task.set(givenData); await task.save();`
        if (!updatedTask) {
             // This case might be rare now, but handle if findByIdAndUpdate fails
             return res.status(404).json({ message: "Task not found during update." });
        }
        res.status(200).json({
            message: "Updated Task",
            changes: updatedTask
        });
    } catch (error) {
        console.error("Error updating task (server-side):", error);
        // Handle CastError for invalid taskId format
        if (error.name === 'CastError') {
             return res.status(400).json({ message: "Invalid task ID format." });
        }
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Inside backend/Controllers/TaskController.js -> DeleteTask function
export const DeleteTask = async (req, res) => {
    try {
        const taskId = req.params.id; // Get task ID from URL
        const userId = req.userId;    // Get authenticated user ID

        // --- ADD AUTHORIZATION CHECK ---
        // Find the task and check if the requesting user is the owner
        const task = await Task.findOne({ _id: taskId, Owner: userId });
        if (!task) {
            // Task not found OR user is not the owner
            return res.status(403).json({ message: "Access denied. Only the task owner can delete this task." });
            // Alternatively, return 404: 
            // return res.status(404).json({ message: "Task not found." });
        }
        // --- END AUTHORIZATION CHECK ---

        // If check passes, proceed with the deletion
        // Use findByIdAndDelete or findOneAndDelete based on your preference
        const deletedTask = await Task.findByIdAndDelete(taskId); 
        // Note: findByIdAndDelete might be redundant check now, but kept
        // You could also use `await task.remove();`
        if (!deletedTask) {
             // This case might be rare now, but handle if findByIdAndDelete fails
             return res.status(404).json({ message: "Task not found during deletion." });
        }
        res.status(200).send({ message: "Task deleted successfully.", deletedTask });
    } catch (error) {
        console.error("Error deleting task (server-side):", error);
        // Handle CastError for invalid taskId format
        if (error.name === 'CastError') {
             return res.status(400).json({ message: "Invalid task ID format." });
        }
        res.status(500).send({ message: "Server error", error: error.message });
    }
};
