
// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react'; // <-- Import useState
import TaskBoard from './TaskBoard';
import TaskDetailWrapper from './TaskDetailWrapper';
import TaskFormWrapper from './TaskFormWrapper';
import Login from './Login';
import Signin from './Signin.jsx';
import TaskSharePageWrapper from './TaskSharePageWrapper'; // Import the new wrapper
import DashboardPage from './DashboardPage';
 import useSocket from './useSocket.js'; // Uncomment when useSocket is ready and correctly implemented

function App() {
  const [notifications, setNotifications] = useState([]); // <-- Now useState is defined

  // --- Function to handle received notifications ---
  const handleNotificationReceived = (notificationData) => {
    console.log("App.jsx: Handling new notification");
    // Update state to display notification (e.g., add to a list)
    setNotifications(prevNotifications => [notificationData, ...prevNotifications]); // Add to front

    // Optional: Show a browser notification (requires permission)
    if (Notification.permission === 'granted') {
      new Notification('New Notification', { body: notificationData.message });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification('New Notification', { body: notificationData.message });
        }
      });
    }

    // Optional: Play a sound
    // const audio = new Audio('/notification-sound.mp3');
    // audio.play().catch(e => console.error("Error playing sound:", e));
  };
  // --- END Handler ---

  // --- Initialize Socket.IO ---
 const { socket, reconnect } = useSocket(handleNotificationReceived); // Uncomment later
  // --- END Initialization ---

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<TaskBoard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Signin />} />
          <Route path="/task/:taskId" element={<TaskDetailWrapper />} />
          <Route path="/task/:taskId/edit" element={<TaskFormWrapper />} />
          <Route path="/task/:taskId/share" element={<TaskSharePageWrapper />} />
          <Route path="/task/new" element={<TaskFormWrapper />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
        {/* Example: Display latest notification briefly */}
        {notifications.length > 0 && (
          <div style={{ position: 'fixed', top: 10, right: 10, backgroundColor: '#e0e0e0', padding: '10px', border: '1px solid #ccc', zIndex: 1000 }}>
            <strong>New:</strong> {notifications[0].message}
            <button onClick={() => setNotifications([])} style={{ marginLeft: '10px' }}>Dismiss</button>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;
