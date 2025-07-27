
// backend/Controllers/TaskController.js
import Task from "../Model/TaskModel.js";
import Notification from '../Model/NotificationModel.js'; // Ensure Notification model is imported
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
// Import necessary items from index.js for Socket.IO
import { io, getConnectedUsersMap } from '../index.js';

// --- Helper Function: Send Real-Time Notification (Defined directly in this file) ---
/**
 * Sends a real-time notification to a specific user via Socket.IO.
 * @param {string} recipientUserId - The ID of the user to notify.
 * @param {Object} notificationData - The data payload for the notification.
 * @param {string} notificationData.type - Type of notification (e.g., 'TASK_SHARED').
 * @param {string} notificationData.message - The notification message.
 * @param {string} [notificationData.taskId] - Optional associated task ID.
 * @param {string} [notificationData.updatedBy] - Optional ID of the user who triggered the update.
 * @param {Date} [notificationData.timestamp] - Timestamp of the notification.
 */
const sendRealTimeNotification = (recipientUserId, notificationData) => {
    try {
        // Get the shared connectedUsers map and io instance from index.js
        const connectedUsers = getConnectedUsersMap();
        const recipientSocketId = connectedUsers.get(recipientUserId);

        if (recipientSocketId && io) { // Check if io is initialized
            // Send to specific socket
            io.to(recipientSocketId).emit('notification', notificationData);
            console.log(`[NotificationService] Sent real-time notification to user ${recipientUserId} via socket ${recipientSocketId}:`, notificationData.type);
        } else {
            if (!recipientSocketId) {
                console.log(`[NotificationService] User ${recipientUserId} not connected. Notification queued/stored in DB.`);
            }
            if (!io) {
                console.warn(`[NotificationService] Socket.IO instance (io) is not available.`);
            }
            // TODO: Implement logic to save notification to database (e.g., using Notification model)
            // Example:
            // const notification = new Notification({
            //   userId: recipientUserId,
            //   ...notificationData
            // });
            // await notification.save().catch(err => console.error("Failed to save notification to DB:", err));
        }
    } catch (error) {
        console.error("[NotificationService] Error sending real-time notification:", error);
        // Depending on requirements, you might want to re-throw or handle differently
    }
};
// --- END Helper Function ---

// --- For Task ---

export const getTasks = async (req, res) => {
    try {
        const tasks = await Task.find();
        // Note: tasks will be an empty array [] if no documents found, not null/undefined
        // if (!tasks) { ... } check is generally not needed for .find()
        // if (tasks.length === 0) { ... } can be used if needed
        res.status(200).send(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error.message);
        res.status(500).json({ message: error.message });
    }
};

export const getTask = async (req, res) => {
    try {
        const id = req.params.id; // Get ID from URL parameter
        console.log(`Fetching task with ID: ${id}`); // Add log for debugging

        // --- Use findById (assuming 'id' is a valid MongoDB ObjectId string) ---
        const task = await Task.findById(id); // Find task by ID

        if (!task) {
            // --- FIX 1: Correct status code for "Not Found" ---
            console.log(`Task with ID ${id} not found.`); // Add log
            return res.status(404).json({ message: "Task not found" }); // <-- 404 Not Found
        }

        // --- FIX 2: Use res.json for consistency ---
        res.status(200).json(task); // Send the found task as JSON
    } catch (error) {
        // --- FIX 3: Improve error logging ---
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

// --- FIXED: getTasksById for fetching tasks by user ID ---
export const getTasksById = async (req, res) => {
    try {
        const userid = req.userId; // Get the authenticated user's ID from middleware
        console.log("DEBUG getTasksById: Request received for user ID:", userid); // Debug log

        if (!userid) {
            console.log("DEBUG getTasksById: UserId not found in request (req.userId)");
            return res.status(400).json({ message: "UserId Not Found in request" });
        }

        // Find tasks where the user is the Owner OR is in the Shared array
        const tasks = await Task.find({
            $or: [
                { Owner: userid },
                { Shared: userid }
            ]
        });

        console.log(`DEBUG getTasksById: Found ${tasks.length} tasks for user ${userid}`); // Debug log
        res.status(200).send(tasks); // Send the found tasks (could be an empty array [])
    } catch (error) {
        console.error('DEBUG getTasksById: Error occurred during task fetching:', error);
        // Handle potential CastError if userid is invalid for Owner/Shared fields (unlikely if auth works)
        if (error.name === 'CastError') {
             console.error('DEBUG getTasksById: Mongoose CastError details:', error.path, error.value);
             return res.status(400).json({ message: "Invalid user ID format encountered during query." });
        }
        res.status(500).json({ message: "Internal server error while fetching tasks", error: error.message });
    }
};

export const getSharedTask = async (req, res) => {
    try {
        const id = req.params.id;
        const task = await Task.findById(id);
        if (!task) {
            // Consider if 405 is the right status here, 404 might be better for "not found"
            return res.status(404).json({ message: "Task not found" });
        }
        res.status(200).send(task.Shared); // Send the Shared array directly
    } catch (error) {
        console.error('Error fetching shared task list:', error.message);
        // Handle CastError for invalid task ID
        if (error.name === 'CastError') {
             return res.status(400).json({ message: "Invalid task ID format" });
        }
        res.status(500).json({ message: error.message });
    }
};

export const ShareTask = async (req, res) => {
    try {
        console.log("DEBUG ShareTask: Authenticated User ID (req.userId):", req.userId);
        console.log("DEBUG ShareTask: Task ID from URL (req.params.id):", req.params.id);
        console.log("DEBUG ShareTask: User ID to share with (req.body.userId):", req.body.userId);

        const { userId: userToShareWith } = req.body; // The user to share with
        const taskId = req.params.id;
        const sharerUserId = req.userId; // The user performing the share

        if (!userToShareWith) {
             return res.status(400).json({ message: "User ID to share with is required." });
        }

        // Only Owner can share
        const task = await Task.findOneAndUpdate(
            {
                _id: taskId,
                Owner: sharerUserId // Ensure only the owner can share
            },
            { $addToSet: { Shared: userToShareWith } }, // Add user ID to Shared array if not already present
            { new: true } // Return the updated document
        );

        if (!task) {
            // This means either task ID was wrong, or the user is not the owner
            return res.status(404).json({ message: "Task not found or unauthorized" });
        }

        // --- Send Real-Time Notification ---
        const taskTitle = task.Title || 'Unnamed Task';
        const notificationData = {
          type: 'TASK_SHARED',
          message: `A task titled "${taskTitle}" has been shared with you.`,
          taskId: taskId,
          timestamp: new Date()
        };
        // Call the local helper function
        sendRealTimeNotification(userToShareWith, notificationData);
        // --- END Send Notification ---

        res.status(200).json({
            message: "Task shared successfully",
            sharedWith: task.Shared // Return the updated shared list
        });
    } catch (error) {
        // Improved error logging
        console.error("ShareTask error (Full Error Object):", error);
        console.error("ShareTask error (Stack Trace):", error.stack);
        res.status(500).json({ message: "Server error in ShareTask", error: error.message });
    }
};

export const UnShareTask = async (req, res) => {
    try {
        const { userId: userToRemove } = req.body; // The user to unshare
        const taskId = req.params.id;
        const ownerId = req.userId; // The user performing the unshare (must be owner)

        if (!userToRemove) {
             return res.status(400).json({ message: "User ID to remove is required." });
        }

        // Only Owner can unshare
        const task = await Task.findOneAndUpdate(
            {
                _id: taskId,
                Owner: ownerId // ✅ Ensures only Owner can unshare
            },
            { $pull: { Shared: userToRemove } }, // Remove user ID from Shared array
            { new: true } // Return the updated document
        );

        if (!task) {
            // This means either task ID was wrong, or the user is not the owner
            return res.status(404).json({ message: "Task not found or unauthorized" });
        }

        res.status(200).json({
            message: "User removed from shared list",
            sharedWith: task.Shared // Return the updated shared list
        });
    } catch (error) {
        console.error("UnShareTask error:", error);
        // Handle CastError for invalid IDs
        if (error.name === 'CastError') {
             return res.status(400).json({ message: "Invalid ID format provided." });
        }
        res.status(500).json({ message: "Server error in UnShareTask", error: error.message });
    }
};

export const CreateTask = async (req, res) => {
  try {
    const givenData = req.body;
    // --- Ensure Owner is set to the authenticated user ---
    const NewTask = new Task({
      Title: givenData.Title,
      Owner: req.userId, // <-- Crucial: Use authenticated user's ID
      Description: givenData.Description,
      Status: givenData.Status,
      Due_Date: givenData.Due_Date
    });
    const savedTask = await NewTask.save();
    // --- Send 201 Created and the task object directly ---
    res.status(201).json(savedTask); // Good practice for creation
  } catch (error) {
    console.error("Error creating task (server-side):", error);
    // Handle CastError for invalid data types (e.g., if Owner was manually set wrong)
    if (error.name === 'CastError') {
         return res.status(400).json({ message: "Invalid data format provided." });
    }
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
         const messages = Object.values(error.errors).map(err => err.message);
         return res.status(400).json({ message: "Validation Error", errors: messages });
    }
    return res.status(500).json({ message: "Server error in CreateTask", error: error.message });
  }
};

export const UpdateTask = async (req, res) => {
    // --- FIXES APPLIED TO UpdateTask ---
    try {
        const taskId = req.params.id; // Get task ID from URL
        const givenData = req.body;   // Get update data from request body
        const updaterUserId = req.userId; // Get authenticated user ID

        console.log(`DEBUG UpdateTask: Attempting to update task ${taskId} by user ${updaterUserId}`);

        // --- 1. Fetch the original task for checks and notifications ---
        // Find the task first to check ownership/shared status and get original data
        const originalTask = await Task.findById(taskId);
        if (!originalTask) {
            return res.status(404).json({ message: "Task Not Found" });
        }

        // --- 2. Authorization Check ---
        // Check if user is owner or is in the shared list
        const isAuthorized = originalTask.Owner.toString() === updaterUserId ||
                             originalTask.Shared.includes(updaterUserId);

        if (!isAuthorized) {
            return res.status(403).json({ message: "Access denied. You cannot update this task." });
        }
        console.log(`DEBUG UpdateTask: User ${updaterUserId} is authorized to update task ${taskId}.`);
        // --- END Authorization Check ---

        // --- 3. Perform the update ---
        // Use findByIdAndUpdate with runValidators
        const updatedTask = await Task.findByIdAndUpdate(
            taskId,
            givenData,
            { new: true, runValidators: true } // Return updated doc and run schema validations
        );

        if (!updatedTask) {
             // This case might be rare now with the pre-check, but handle if findByIdAndUpdate fails
             return res.status(404).json({ message: "Task not found during update." });
        }
        console.log(`DEBUG UpdateTask: Task ${taskId} updated successfully.`);
        // --- END Perform Update ---

        // --- 4. Send Real-Time Notification (if status changed) ---
        // Check if Status was present in the update data and actually changed
        if (givenData.hasOwnProperty('Status')) {
            // Compare the stringified arrays or values of the original and updated status
            const originalStatus = Array.isArray(originalTask.Status) ? originalTask.Status : [originalTask.Status];
            const updatedStatus = Array.isArray(updatedTask.Status) ? updatedTask.Status : [updatedTask.Status];

            const statusChanged = JSON.stringify(originalStatus) !== JSON.stringify(updatedStatus);

            if (statusChanged) {
                console.log(`DEBUG UpdateTask: Status changed for task ${taskId}. Sending notifications.`);
                const taskTitle = updatedTask.Title || 'Unnamed Task';
                // Get the first status string if it's an array, otherwise the value itself
                const newStatus = updatedStatus[0] || 'Unknown Status';
                const notificationData = {
                  type: 'TASK_STATUS_UPDATED',
                  message: `The status of task "${taskTitle}" has been updated to "${newStatus}".`,
                  taskId: taskId,
                  updatedBy: updaterUserId, // Include who made the change
                  timestamp: new Date()
                };

                // Notify Owner (if not the updater)
                if (originalTask.Owner.toString() !== updaterUserId) {
                   console.log(`DEBUG UpdateTask: Notifying Owner ${originalTask.Owner}`);
                   sendRealTimeNotification(originalTask.Owner.toString(), notificationData);
                }

                // Notify Shared Users (excluding the one who made the change)
                originalTask.Shared.forEach(sharedUserId => {
                    if (sharedUserId !== updaterUserId) {
                       console.log(`DEBUG UpdateTask: Notifying Shared User ${sharedUserId}`);
                       sendRealTimeNotification(sharedUserId, notificationData);
                    }
                });
            } else {
                 console.log(`DEBUG UpdateTask: Status field was in request body for task ${taskId}, but value did not change.`);
            }
        } else {
             console.log(`DEBUG UpdateTask: Status field was not included in the update data for task ${taskId}.`);
        }
        // --- END Send Notification ---

        // --- 5. Send Success Response ---
        res.status(200).json({
            message: "Updated Task",
            changes: updatedTask // Return the updated task document
        });
        // --- END Send Response ---

    } catch (error) {
        console.error("Error updating task (server-side):", error);
        // Handle CastError for invalid taskId format
        if (error.name === 'CastError') {
             return res.status(400).json({ message: "Invalid task ID format." });
        }
        // Handle Mongoose validation errors
        if (error.name === 'ValidationError') {
             const messages = Object.values(error.errors).map(err => err.message);
             return res.status(400).json({ message: "Validation Error", errors: messages });
        }
        return res.status(500).json({ message: "Server error in UpdateTask", error: error.message });
    }
    // --- END FIXES ---
};

export const DeleteTask = async (req, res) => {
    try {
        const taskId = req.params.id; // Get task ID from URL
        const userId = req.userId;    // Get authenticated user ID

        console.log(`DEBUG DeleteTask: Attempting to delete task ${taskId} by user ${userId}`);

        // --- ADD AUTHORIZATION CHECK ---
        // Find the task and check if the requesting user is the owner
        const task = await Task.findOne({ _id: taskId, Owner: userId });
        if (!task) {
            // Task not found OR user is not the owner
            return res.status(403).json({ message: "Access denied. Only the task owner can delete this task." });
            // Alternatively, return 404:
            // return res.status(404).json({ message: "Task not found." });
        }
        console.log(`DEBUG DeleteTask: User ${userId} is authorized to delete task ${taskId}.`);
        // --- END AUTHORIZATION CHECK ---

        // --- Proceed with the deletion ---
        // Use findByIdAndDelete (findOneAndDelete is also fine)
        const deletedTask = await Task.findByIdAndDelete(taskId);
        // Note: findByIdAndDelete might be slightly redundant check now, but kept for robustness
        // You could also use `await task.remove();` if you fetched the full document object
        if (!deletedTask) {
             // This case might be rare now, but handle if findByIdAndDelete fails
             return res.status(404).json({ message: "Task not found during deletion." });
        }
        console.log(`DEBUG DeleteTask: Task ${taskId} deleted successfully.`);
        res.status(200).send({ message: "Task deleted successfully.", deletedTask });
        // --- END Deletion ---
    } catch (error) {
        console.error("Error deleting task (server-side):", error);
        // Handle CastError for invalid taskId format
        if (error.name === 'CastError') {
             return res.status(400).json({ message: "Invalid task ID format." });
        }
        res.status(500).send({ message: "Server error in DeleteTask", error: error.message });
    }
};

// --- Analytics Functions ---

export const getAnalyticsOverview = async (req, res) => {
  try {
    const userId = req.userId; // Get the authenticated user's ID
    console.log("DEBUG getAnalyticsOverview: Request received for user ID:", userId); // Debug log

    if (!userId) {
      return res.status(400).json({ message: "UserId Not Found" });
    }

    // --- Use MongoDB Aggregation for efficient calculation ---
    const overview = await Task.aggregate([
      {
        // Stage 1: Match tasks owned by or shared with the user
        $match: {
          $or: [
            { Owner: userId },
            { Shared: userId }
          ]
        }
      },
      {
        // Stage 2: Group all matched documents and calculate counts
        $group: {
          _id: null, // Group all documents into one
          totalTasks: { $sum: 1 }, // Count total tasks
          completedTasks: {
            $sum: {
              // Use $cond to sum 1 for each task with Status containing 'Completed'
              $cond: [{ $in: ["Completed", "$Status"] }, 1, 0] // <-- FIXED: Use $in
            }
          },
          pendingTasks: {
            $sum: {
              // Sum 1 for 'Pending'
              $cond: [{ $in: ["Pending", "$Status"] }, 1, 0] // <-- FIXED: Use $in
            }
          },
          inProgressTasks: {
            $sum: {
              // Sum 1 for 'In Progress'
              $cond: [{ $in: ["In Progress", "$Status"] }, 1, 0] // <-- FIXED: Use $in
            }
          }
          // Add more status counts if needed
        }
      },
      {
        // Stage 3: Project the final structure (remove _id)
        $project: {
          _id: 0, // Exclude the _id field generated by $group
          totalTasks: 1,
          completedTasks: 1,
          pendingTasks: 1,
          inProgressTasks: 1
        }
      }
    ]);

    // If no tasks found, overview will be an empty array []
    // If tasks found, overview will be [{ totalTasks: ..., completedTasks: ... }]
    const result = overview.length > 0 ? overview[0] : {
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
      inProgressTasks: 0
    };

    console.log("DEBUG getAnalyticsOverview: Result:", result); // Debug log
    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching analytics overview (server-side):', error);
    res.status(500).json({ message: "Internal server error while fetching analytics overview", error: error.message });
  }
};

export const getAnalyticsTrends = async (req, res) => {
  try {
    const userId = req.userId;
    console.log(`DEBUG Trends: Request received for user ID: ${userId}`); // Debug log

    if (!userId) {
      return res.status(400).json({ message: "UserId Not Found" });
    }

    // Calculate the date 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    console.log("DEBUG Trends: Calculating trends from", sevenDaysAgo.toISOString()); // Log ISO string for clarity

    // --- Use MongoDB Aggregation for trend calculation ---
    const trends = await Task.aggregate([
      {
        // Stage 1: Match tasks owned by or shared with the user
        // AND created within the last 7 days
        $match: {
          $and: [
            {
              $or: [
                { Owner: userId },
                { Shared: userId }
              ]
            },
            { createdAt: { $gte: sevenDaysAgo } } // Ensure 'createdAt' field exists and is indexed
          ]
        }
      },
      {
        // Stage 2: Project to get the date part of createdAt for grouping
        // This assumes 'createdAt' is a Date object
        $project: {
          day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, // Format date as YYYY-MM-DD string
          Status: 1 // Include Status for potential breakdown
        }
      },
      {
        // Stage 3: Group by day and count tasks
        $group: {
          _id: "$day", // Group by the formatted date string
          count: { $sum: 1 }, // Count tasks per day
          // Example: Breakdown by status per day (optional)
          // completedCount: { $sum: { $cond: [{ $eq: ["$Status", "Completed"] }, 1, 0] } },
          // pendingCount: { $sum: { $cond: [{ $eq: ["$Status", "Pending"] }, 1, 0] } }
        }
      },
      {
        // Stage 4: Sort results by date ascending
        $sort: { _id: 1 } // Sort by the date string (_id)
      }
    ]);

    console.log("DEBUG Trends: Aggregation result", trends); // Debug log
    // Result format: [ { _id: "2023-10-26", count: 2 }, { _id: "2023-10-27", count: 1 }, ... ]

    res.status(200).json(trends);
  } catch (error) {
    console.error('Error fetching analytics trends (server-side):', error);
    res.status(500).json({ message: "Internal server error while fetching analytics trends", error: error.message });
  }
};

// --- END NEW FUNCTIONS FOR ANALYTICS ---

// --- Notification Endpoint ---

export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.userId;
    console.log(`DEBUG getUserNotifications: Request received for user ID: ${userId}`); // Debug log

    if (!userId) {
       return res.status(400).json({ message: "UserId not found in request." });
    }

    // Fetch notifications for the user, sorted by newest first
    const notifications = await Notification.find({ userId: userId }).sort({ createdAt: -1 });
    console.log(`DEBUG getUserNotifications: Found ${notifications.length} notifications for user ${userId}`); // Debug log
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching user notifications:", error);
    res.status(500).json({ message: "Internal server error while fetching notifications.", error: error.message });
  }
};

// --- END Notification Endpoint ---
