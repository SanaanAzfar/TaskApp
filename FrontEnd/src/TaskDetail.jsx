import { useState, useEffect } from "react";

export default function TaskDetail({ taskId, onHomeClick, onEditClick }) {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`http://localhost:5000/tasks/${taskId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setTask(data);
      } catch (error) {
        console.error('Error fetching task:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [taskId]);

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

  const handleDeleteClick = async () => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    
    try {
      const response = await fetch(`http://localhost:5000/tasks/${taskId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        onHomeClick?.();
      } else {
        throw new Error('Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      alert(`Delete failed: ${error.message}`);
    }
  };

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
        <p className="normaltext">{error || 'Task not found'}</p>
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