// backend/Model/NotificationModel.js
import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  userId: { // The user this notification is for
    type: String,
    required: true,
    ref: 'User' // Assuming you have a User model
  },
  type: { // Type of notification (e.g., 'TASK_SHARED', 'TASK_STATUS_UPDATED')
    type: String,
    required: true
  },
  message: { // The notification message
    type: String,
    required: true
  },
  taskId: { // Optional: Link to the related task
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  },
  read: { // Whether the notification has been read
    type: Boolean,
    default: false
  },
  // Add other relevant fields like 'createdBy' if needed
}, {
  timestamps: true // Adds createdAt and updatedAt
});

const Notification = mongoose.model('Notification', NotificationSchema);
export default Notification;
