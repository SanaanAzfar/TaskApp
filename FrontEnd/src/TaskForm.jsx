
// src/TaskForm.jsx
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom'; // Import useNavigate for potential redirects

export default function TaskForm({ taskId, onHomeClick, onSaveComplete, onCancelClick }) {
  const navigate = useNavigate(); // Use navigate hook
  const [formData, setFormData] = useState({
    Title: '',
    Description: '',
    Status: 'Pending',
    Due_Date: '' // Consider using '' or null for optional dates
  });
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const statusOptions = ['Pending', 'In Progress', 'Completed'];
  
  // Ensure VITE_API_URL is set in your .env file (e.g., VITE_API_URL=http://localhost:5000)
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'; // Simplified fallback

  // Helper function to get the auth token
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  useEffect(() => {
    if (taskId) {
      setIsEditMode(true);
      fetchTaskData();
    } else {
      setIsEditMode(false);
      // Reset form data when switching from edit to create mode
      setFormData({
        Title: '',
        Description: '',
        Status: 'Pending',
        Due_Date: ''
      });
    }
  }, [taskId]);

  const fetchTaskData = async () => {
    // Check for token before fetching
    const token = getAuthToken();
    if (!token) {
      console.error("No auth token found for fetching task data");
      alert("You need to be logged in to view/edit tasks.");
      navigate('/login'); // Redirect to login if not authenticated
      return;
    }

    try {
      setLoading(true);
      // --- FIX 1: Add /api prefix and Authorization header ---
      const response = await fetch(`${apiUrl}/api/tasks/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${token}`, // Add token
          'Content-Type': 'application/json'
        }
      });

      // --- IMPROVED ERROR HANDLING for fetchTaskData ---
      if (!response.ok) {
        let errorMessage = `Failed to fetch task (Status: ${response.status})`;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch (jsonError) {
            console.error("Failed to parse fetch task error JSON:", jsonError);
          }
        } else {
          try {
            const errorText = await response.text();
            errorMessage = errorText || errorMessage;
            console.error("Non-JSON error response from fetch task:", errorText);
          } catch (textError) {
            console.error("Failed to read fetch task error text:", textError);
          }
        }
        throw new Error(errorMessage);
      }
      // --- END IMPROVED ERROR HANDLING ---

      const data = await response.json();
      setFormData({
        Title: data.Title || '',
        Description: data.Description || '',
        Status: (data.Status && (Array.isArray(data.Status) ? data.Status[0] : data.Status)) || 'Pending', // Handle array status if needed
        Due_Date: data.Due_Date ? new Date(data.Due_Date).toISOString().split('T')[0] : '' // Format date for input
      });
    } catch (error) {
      console.error('Error fetching task data:', error);
      alert(`Error loading task: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStatusSelect = (status) => {
    setFormData(prev => ({
      ...prev,
      Status: status
    }));
    setDropdownOpen(false);
  };

  const handleSubmit = async () => {
    // Check for token before submitting
    const token = getAuthToken();
    if (!token) {
      console.error("No auth token found for saving task");
      alert("You need to be logged in to save tasks.");
      navigate('/login'); // Redirect to login if not authenticated
      return; // Stop execution
    }

    // Basic frontend validation (optional but good)
    if (!formData.Title.trim()) {
       alert("Please enter a title for the task.");
       return;
    }

    try {
      setLoading(true);
      
      // --- FIX 2: Add /api prefix ---
      const url = isEditMode 
        ? `${apiUrl}/api/tasks/${taskId}`
        : `${apiUrl}/api/tasks`;
      
      const method = isEditMode ? 'PUT' : 'POST';
      
      // --- FIX 3: Add Authorization header ---
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`, // Add token here
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      // --- IMPROVED ERROR HANDLING for handleSubmit (like Login/Register) ---
      if (!response.ok) {
        let errorMessage = `Save failed (HTTP error! status: ${response.status})`;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch (jsonError) {
            console.error("Failed to parse save error JSON:", jsonError);
          }
        } else {
          // Try to get text if not JSON
          try {
             const errorText = await response.text();
             errorMessage = errorText || errorMessage;
             console.error("Non-JSON error response from save:", errorText);
          } catch (textError) {
             console.error("Failed to read save error text:", textError);
          }
        }
        throw new Error(errorMessage);
      }
      // --- END IMPROVED ERROR HANDLING ---

      const savedTask = await response.json();
      const newTaskId = savedTask._id || savedTask.id;
      
      if (!newTaskId) {
        // This might be okay for PUT (edit), but warn/log
        if (isEditMode && taskId) {
          console.warn("Edit task successful, but no ID returned in response body.");
          if (onSaveComplete) onSaveComplete(taskId); // Use existing taskId
          return;
        }
        throw new Error('Server did not return task ID for newly created task');
      }

      // Success: Call onSaveComplete with the new/existing task ID
      if (onSaveComplete) onSaveComplete(newTaskId);
    } catch (error) {
      console.error('Save error (frontend caught):', error);
      // Alert user with the specific error message
    } finally {
      setLoading(false);
    }
  };

  const handleHomeClick = () => {
    if (onHomeClick) onHomeClick();
  };

  const handleCancelClick = () => {
    if (onCancelClick) onCancelClick();
  };

  // Show loading state only when initially fetching data for editing
  if (loading && isEditMode && !formData.Title) {
    return (
      <div>
        <h1>{isEditMode ? 'Edit Task' : 'Create Task'}</h1>
        <p>Loading task data...</p>
      </div>
    );
  }

  return (
    <div>
      <h1>{isEditMode ? 'Edit Task' : 'Create New Task'}</h1>
      <div className="colm">
        <div className="Note2">
          <input 
            id="Title"
            name="Title"
            type="text" 
            placeholder="Enter Title Here" 
            className="TitleBox"
            value={formData.Title}
            onChange={handleInputChange}
            required // Add required attribute
          />
          
          <h3>Description:</h3>
          <textarea 
            name="Description"
            placeholder="Enter Description Here"
            value={formData.Description}
            onChange={handleInputChange}
            rows="4" // Add rows for better initial size
          ></textarea>
          
          <div className="space"></div>
          
          <h3>Status:</h3>
          <div className="aligner">
            <div className="dropdown">
              <button 
                className="dropbtn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                type="button"
              >
                {formData.Status || 'Select Status'}
              </button>
              {dropdownOpen && (
                <div className="dropdown-content">
                  {statusOptions.map((status) => (
                    <a 
                      key={status}
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        handleStatusSelect(status);
                      }}
                    >
                      {status}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="space"></div>
          
          <h3>Due Date:</h3>
          <input 
            type="date" 
            id="Due_Date" // Changed id to match name for consistency
            name="Due_Date" 
            className="Dater"
            value={formData.Due_Date}
            onChange={handleInputChange}
          />
          
          <div className="button-container">
            <button 
              className="usualbutton" 
              onClick={handleHomeClick}
              disabled={loading}
            >
              HOME
            </button>
            <button 
              className="usualbutton" 
              onClick={handleCancelClick}
              disabled={loading}
            >
              CANCEL
            </button>
            <button 
              className="usualbutton" 
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'SAVING...' : 'SAVE'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
