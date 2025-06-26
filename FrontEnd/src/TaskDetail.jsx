import { useState, useEffect, useRef } from "react";

export default function TaskDetail({ taskId, onHomeClick, onEditClick }) {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const textRef = useRef(null);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await fetch(`http://localhost:5000/tasks/${taskId}`);
        const data = await response.json();
        setTask(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching task:', error);
        setLoading(false);
      }
    };

    fetchTask();
  }, [taskId]);

  useEffect(() => {
    if (task && textRef.current) {
      wrapLetters(textRef.current);
    }
  }, [task]);

  const wrapLetters = (element) => {
    const text = element.textContent;
    element.innerHTML = '';
    for (let char of text) {
      const span = document.createElement('span');
      span.className = char === ':' ? 'letter-box space' : 'letter-box';
      span.textContent = char === ' ' ? '\u00A0' : char; // non-breaking space
      element.appendChild(span);
    }
  };

  const getStatusImage = (status) => {
    // Handle both array and string status values
    const statusValue = Array.isArray(status) ? status[0] : status;
    switch (statusValue) {
      case "Pending":
        return "/Images/Pending.png"; // Note the leading slash
      case "In Progress":
        return "/Images/InProgress.png";
      case "Completed":
        return "/Images/Completed.png";
      default:
        return "/Images/InProgress.png";
    }
  };

  const handleHomeClick = () => {
    if (onHomeClick) onHomeClick();
  };

  const handleEditClick = () => {
    if (onEditClick) onEditClick(taskId);
  };

  const handleDeleteClick = async () => {
    const isConfirmed = window.confirm("Are you sure you want to delete this task?");
    if (!isConfirmed) return;
    
    try {
      const response = await fetch(`http://localhost:5000/tasks/${taskId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        if (onHomeClick) onHomeClick();
      } else {
        console.error('Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  if (loading) {
    return (
      <div>
        <h1>Task Details</h1>
        <p>Loading task details...</p>
      </div>
    );
  }

  if (!task) {
    return (
      <div>
        <h1>Task Details</h1>
        <p>Task not found.</p>
        <button className="usualbutton" onClick={handleHomeClick}>HOME</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Task Details</h1>
      <div className="colm">
        <div className="Note2">
          <h2>{task.Title}</h2>
          <h3>Description:</h3>
          <p className="normaltext">{task.Description}</p>
          <div className="space"></div>
          <h3>Status:</h3>
          <img 
            src={getStatusImage(task.Status)} 
            className="Bar" 
            alt={task.Status}
            onError={(e) => {
              e.target.onerror = null; 
              e.target.src = "/Images/InProgress.png";
            }}
          />
          <h4>{Array.isArray(task.Status) ? task.Status[0] : task.Status}</h4>
          <div className="space"></div>
          <h3>Due Date:</h3>
          <div className="space"></div>
          <h4><div id="text" ref={textRef}>{task.Due_Date}</div></h4>
          <div className="space"></div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px' }}>
            <button className="usualbutton" onClick={handleHomeClick}>HOME</button>
            <button className="usualbutton" onClick={handleEditClick}>EDIT</button>
            <button className="usualbutton" onClick={handleDeleteClick}>DELETE</button>
          </div>
        </div>
      </div>
    </div>
  );
}