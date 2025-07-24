// src/TaskDetail.jsx
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom'; // Import useNavigate if needed for redirects

export default function TaskDetail({ taskId, onHomeClick, onEditClick }) {
  const navigate = useNavigate(); // Use navigate hook if needed
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Ensure VITE_API_URL is set in your .env file (e.g., VITE_API_URL=http://localhost:5000)
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'; // Simplified fallback

  // Helper function to get the auth token
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  useEffect(() => {
    // --- FIX: Add Authorization header to fetchTask ---
    const fetchTask = async () => {
      // Check for token before fetching
      const token = getAuthToken();
      if (!token) {
        console.error("No auth token found for fetching task details");
        setLoading(false);
        setError("You need to be logged in to view task details.");
        // Optionally redirect: navigate('/login');
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // --- Include Authorization header ---
        const response = await fetch(`${apiUrl}/api/tasks/${taskId}`, { // Also ensure /api prefix
          headers: {
            'Authorization': `Bearer ${token}`, // Add the token here
            'Content-Type': 'application/json' // Good practice
          }
        });
        // --- END FIX ---

        // --- IMPROVED ERROR HANDLING ---
        if (!response.ok) {
          let errorMessage = `HTTP error! status: ${response.status}`;
          // Differentiate common errors
          if (response.status === 404) {
            errorMessage = "Task not found.";
          } else if (response.status === 401 || response.status === 403) {
            errorMessage = "Unauthorized. Please log in.";
            // Optionally remove token and redirect
            // localStorage.removeItem('token');
            // navigate('/login');
          } else {
            // Try to parse error message from JSON response
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
              try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
              } catch (jsonError) {
                console.error("Failed to parse error JSON:", jsonError);
              }
            } else {
              // If not JSON, try to get text
              try {
                const errorText = await response.text();
                errorMessage = errorText || errorMessage;
              } catch (textError) {
                console.error("Failed to read error text:", textError);
              }
            }
          }
          throw new Error(errorMessage);
        }
        // --- END IMPROVED ERROR HANDLING ---

        const data = await response.json();
        setTask(data);
      } catch (error) {
        console.error('Error fetching task (frontend):', error);
        setError(error.message); // Display the specific error message
      } finally {
        setLoading(false);
      }
    };

    if (taskId) { // Only fetch if taskId is provided
       fetchTask();
    } else {
       // Handle case where taskId is missing from URL params
       setLoading(false);
       setError("Task ID is missing.");
    }
  }, [taskId]); // Re-run if taskId changes

  // --- FIX: Add Authorization header to handleDeleteClick ---
  const handleDeleteClick = async () => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    // Check for token before deleting
    const token = getAuthToken();
    if (!token) {
      console.error("No auth token found for deleting task");
      alert("You need to be logged in to delete tasks.");
      // Optionally redirect: navigate('/login');
      return;
    }

    try {
      // --- Include Authorization header ---
      const response = await fetch(`${apiUrl}/api/tasks/${taskId}`, { // Ensure /api prefix
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`, // FIXED: Added missing backtick
          'Content-Type': 'application/json' // Good practice
        }
      });
      // --- END FIX ---

      if (response.ok) {
        // Deletion successful, navigate home or task list
        onHomeClick?.();
      } else {
        // Handle deletion error
        let errorMessage = 'Failed to delete task';
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch (jsonError) {
            console.error("Failed to parse delete error JSON:", jsonError);
          }
        } else {
          try {
            const errorText = await response.text();
            errorMessage = errorText || errorMessage;
          } catch (textError) {
            console.error("Failed to read delete error text:", textError);
          }
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error deleting task (frontend):', error);
      alert(`Delete failed: ${error.message}`); // Show specific error
    }
  };
  // --- END FIX for handleDeleteClick ---

  const getStatusImage = (status) => {
    const statusValue = Array.isArray(status) ? status[0] : status;
    switch (statusValue) {
      case "Pending": return "/Images/Pending.png";
      case "In Progress": return "/Images/InProgress.png";
      case "Completed": return "/Images/Completed.png";
      default: return "/Images/InProgress.png";
    }
  };

  const handleHomeClick = () => onHomeClick?.();
  const handleEditClick = () => onEditClick?.(taskId);

  // --- Ensure /api prefix is used in URLs if needed elsewhere (though the main fetches are fixed above) ---


  if (loading) {
    return (
      <div className="Note2">
        <h1>Task Details</h1>
        <p className="normaltext">Loading task details...</p>
        <button className="usualbutton" onClick={handleHomeClick}>HOME</button>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="Note2">
        <h1>Task Details</h1>
        {/* Display the specific error message */}
        <p className="normaltext" style={{ color: error ? 'red' : 'inherit' }}>{error || 'Task not found'}</p>
        <button className="usualbutton" onClick={handleHomeClick}>HOME</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Task Details</h1>
      <div className="colm">
        <div className="Note2">
          <h2>{task.Title || 'Untitled Task'}</h2>
          
          <h3>Description:</h3>
          <p className="normaltext">{task.Description || 'No description provided'}</p>
          
          <div className="space"></div>
          
          <h3>Status:</h3>
          <img 
            src={getStatusImage(task.Status)} 
            className="Bar" 
            alt={Array.isArray(task.Status) ? task.Status[0] : task.Status}
            onError={(e) => {
              e.target.onerror = null; 
              e.target.src = "/Images/InProgress.png";
            }}
          />
          <h4>{Array.isArray(task.Status) ? task.Status[0] : task.Status || 'Unknown'}</h4>
          
          <div className="space"></div>
          
          <h3>Due Date:</h3>
          <div className="space"></div>
          <div className="due-date-container">
            {task.Due_Date ? (
              <div className="due-date-letters">
                {task.Due_Date.split('').map((char, index) => (
                  <span 
                    key={index}
                    className={char === ' ' ? 'due-date-space' : 'due-date-letter'}
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                ))}
              </div>
            ) : (
              <span className="due-date-missing">No due date set</span>
            )}
          </div>
          
          <div className="space"></div>
          
          <div className="button-container">
            <button className="usualbutton" onClick={handleHomeClick}>HOME</button>
            <button className="usualbutton" onClick={handleEditClick}>EDIT</button>
            <button className="usualbutton" onClick={handleDeleteClick}>DELETE</button>
          </div>
        </div>
      </div>
    </div>
  );
}
