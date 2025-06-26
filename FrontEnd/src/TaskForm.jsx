import { useState, useEffect } from "react";

export default function TaskForm({ taskId, onHomeClick, onSaveComplete, onCancelClick }) {
  const [formData, setFormData] = useState({
    Title: '',
    Description: '',
    Status: 'Pending',
    Due_Date: ''
  });
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const statusOptions = ['Pending', 'In Progress', 'Completed'];
  const apiUrl = import.meta.env.VITE_API_URL || `http://localhost:${import.meta.env.VITE_API_PORT || 5000}`;

  useEffect(() => {
    if (taskId) {
      setIsEditMode(true);
      fetchTaskData();
    } else {
      setIsEditMode(false);
    }
  }, [taskId]);

  const fetchTaskData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/tasks/${taskId}`);
      if (!response.ok) throw new Error('Failed to fetch task');
      const data = await response.json();
      setFormData({
        Title: data.Title || '',
        Description: data.Description || '',
        Status: data.Status || 'Pending',
        Due_Date: data.Due_Date || ''
      });
    } catch (error) {
      console.error('Error fetching task data:', error);
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
    try {
      setLoading(true);
      
      const url = isEditMode 
        ? `${apiUrl}/tasks/${taskId}`
        : `${apiUrl}/tasks`;
      
      const method = isEditMode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Save failed');
      }

      const savedTask = await response.json();
      const newTaskId = savedTask._id || savedTask.id;
      
      if (!newTaskId) {
        if (isEditMode && taskId) {
          if (onSaveComplete) onSaveComplete(taskId);
          return;
        }
        throw new Error('Server did not return task ID');
      }

      if (onSaveComplete) onSaveComplete(newTaskId);
    } catch (error) {
      console.error('Save error:', error);
      alert(`Save failed: ${error.message}`);
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
          />
          
          <h3>Description:</h3>
          <textarea 
            name="Description"
            placeholder="Enter Description Here"
            value={formData.Description}
            onChange={handleInputChange}
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
            id="birthday" 
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