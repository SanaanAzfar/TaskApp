
// index.js
import TaskRoutes from './Route/TaskRoutes.js';
import UserRoutes from './Route/UserRoutes.js';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http'; // Import http module
import { Server } from 'socket.io'; // Import Server from socket.io

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || process.env.PORT1 || 5000;

app.use(express.json());
app.use(cors());

// --- Socket.IO Setup ---
const server = http.createServer(app); // Create HTTP server instance
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5000", // Allow requests from your frontend origin
    methods: ["GET", "POST"],
    credentials: true // If you need to send cookies or auth headers
  }
});

// Store connected users (in-memory, consider Redis for production)
const connectedUsers = new Map(); // Map userId -> socketId

export const getConnectedUsersMap = () => connectedUsers;

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // --- Authentication (Important) ---
  // Listen for a 'authenticate' event from the client upon connection
  socket.on('authenticate', (userId) => {
    if (userId) {
      connectedUsers.set(userId, socket.id);
      console.log(`User ${userId} authenticated and mapped to socket ${socket.id}`);
      // Optional: Join a room named after the userId for easier targeting
      socket.join(`user_${userId}`);
    } else {
      console.warn('Socket.IO: Authentication failed - no userId provided for socket', socket.id);
      // Optionally disconnect unauthenticated sockets
      // socket.disconnect(true);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Remove user from connectedUsers map on disconnect
    for (let [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        console.log(`User ${userId} disconnected and removed from map.`);
        break; // A socket ID should map to only one user ID
      }
    }
  });
});
// --- END Socket.IO Setup ---

// Mount routes
app.use('/api/tasks', TaskRoutes);
app.use('/api/users', UserRoutes);

// --- Helper Function to Emit Notifications ---
// This function will be called from your controllers
export const sendNotification = (recipientUserId, notificationData) => {
  const recipientSocketId = connectedUsers.get(recipientUserId);
  if (recipientSocketId) {
    // Send to specific socket
    io.to(recipientSocketId).emit('notification', notificationData);
    console.log(`Sent notification to user ${recipientUserId} via socket ${recipientSocketId}:`, notificationData);
  } else {
    // User is not online, store notification in DB for later fetching
    console.log(`User ${recipientUserId} not connected. Notification queued/stored in DB.`, notificationData);
    // TODO: Implement logic to save notification to database
    // You'll need a Notification model and save the notificationData there
    // Example:
    // const notification = new Notification({
    //   userId: recipientUserId,
    //   type: notificationData.type,
    //   message: notificationData.message,
    //   taskId: notificationData.taskId,
    //   read: false,
    //   // timestamp is usually automatic with timestamps: true
    // });
    // await notification.save();
  }
};
// --- END Helper Function ---

const dbURI = process.env.MONGOURI;
mongoose.connect(dbURI, {})
  .then(() => {
    console.log("MongoDB connection successful");
    // --- Start server using the HTTP server instance ---
    server.listen(port, '0.0.0.0', () => { // Use 'server' instead of 'app'
      console.log(`Server is running on port ${port}`);
    });
    // --- END Start server ---
  })
  .catch((error) => {
    console.error("MongoDB connection error", error);
  });

// Export io if needed elsewhere (optional, but useful)
export { io };
