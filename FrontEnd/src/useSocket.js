
// src/hooks/useSocket.js
import { useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { jwtDecode } from 'jwt-decode';
// --- Helper function to get and decode user ID from token ---
const getUserIdFromToken = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn("No auth token found in localStorage.");
      return null;
    }
        const decoded = jwtDecode(token); // Use the correctly imported function
    // Assuming the user ID is stored in the 'id' field of the token payload
    // Adjust 'id' if your token uses a different key (e.g., 'userId', '_id')
    const userId = decoded.id;
    if (!userId) {
      console.warn("User ID not found in decoded token payload.");
      return null;
    }
    return userId;
  } catch (error) {
    console.error("Error decoding token or getting user ID:", error);
    return null;
  }
};
// --- END Helper function ---

const useSocket = (onNotificationReceived) => {
  const socketRef = useRef(null);

  useEffect(() => {
    // --- Get token and user ID ---
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn("No auth token found, skipping Socket.IO connection.");
      return; // Don't connect if not logged in
    }

    const userId = getUserIdFromToken();
    if (!userId) {
      console.error("Could not get userId from token for Socket.IO authentication.");
      // Optionally, you might want to redirect to login or handle this state
      // navigate('/login'); // Requires useNavigate hook, might need context/wrapper
      return;
    }
    // --- END Get token and user ID ---

    // --- Connect to Socket.IO Server ---
    // Ensure VITE_API_URL matches your backend URL
    const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const newSocket = io(SOCKET_URL, {
      // Pass the token in the auth object - this is a common way for Socket.IO client/server auth
      auth: { token }, // Backend can access this via socket.handshake.auth.token
      transports: ['websocket'] // Prefer WebSocket
    });

    newSocket.on('connect', () => {
      console.log('Connected to Socket.IO server with ID:', newSocket.id);
      // --- Authenticate with the server ---
      // Send the userId to the server upon connection
      // Depending on your backend setup, emitting 'authenticate' might be redundant
      // if the server uses the token from the 'auth' handshake.
      // However, sending it explicitly is a clear way to signal user identity.
      newSocket.emit('authenticate', userId);
      console.log("Sent authentication request/emission for user:", userId);
      // --- END Authenticate ---
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Disconnected from Socket.IO server. Reason:', reason);
      // Optional: Implement reconnection logic based on reason if needed
    });

    newSocket.on('connect_error', (error) => {
       console.error('Socket.IO connection error:', error);
       // Optional: Handle connection errors (e.g., network issues, server rejection)
    });

    // --- Listen for 'notification' events ---
    newSocket.on('notification', (notificationData) => {
      console.log('Received real-time notification:', notificationData);
      // Call the callback function passed to the hook
      if (onNotificationReceived) {
        onNotificationReceived(notificationData);
      }
    });
    // --- END Listen for notifications ---

    socketRef.current = newSocket;

    // Cleanup function on unmount
    return () => {
      console.log('Cleaning up Socket.IO connection...');
      if (newSocket) {
        newSocket.close();
      }
    };
  }, []); // Empty dependency array: run once on mount

  // Optional: Expose socket instance and reconnect function
  const reconnect = () => {
     if (socketRef.current && (socketRef.current.disconnected || socketRef.current.readyState !== 1)) {
        console.log("Attempting to reconnect Socket.IO...");
        socketRef.current.connect();
     } else if (socketRef.current) {
        console.log("Socket.IO is already connected or connecting.");
     } else {
        console.log("No Socket.IO instance to reconnect.");
     }
  };

  // Return socket instance and reconnect function
  // Note: socketRef.current might be null initially before useEffect runs
  return { socket: socketRef.current, reconnect };
};

export default useSocket;
