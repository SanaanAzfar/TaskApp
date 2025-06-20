import { useState, useEffect } from "react";

export default function TaskForm({ taskId, onHomeClick, onSaveComplete }) {
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

  useEffect(() => {
    if (taskId) {
      setIsEditMode(true);
      fetchTaskData();
    }
  }, [taskId]);

  const fetchTaskData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/tasks/${taskId}`);
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
        ? `http://localhost:5000/tasks/${taskId}`
        : 'http://localhost:5000/tasks';
      
      const method = isEditMode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const savedTask = await response.json();
        console.log('Task saved successfully:', savedTask);
        if (onSaveComplete) onSaveComplete(savedTask);
      } else {
        console.error('Error saving task:', response.statusText);
      }
    } catch (error) {
      console.error('Error saving task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleHomeClick = () => {
    if (onHomeClick) onHomeClick();
  };

  if (loading && isEditMode && !formData.Title) {
    return (
      <div>
        <h1>Task Form</h1>
        <p>Loading task data...</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Task Form</h1>
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
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px' }}>
            <button 
              className="usualbutton" 
              onClick={handleHomeClick}
              disabled={loading}
            >
              HOME
            </button>
            <button 
              className="usualbutton" 
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'SAVING...' : 'DONE'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}