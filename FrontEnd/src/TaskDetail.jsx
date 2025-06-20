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
    switch (status) {
      case "Pending":
        return "./assets/Images/Pending.png";
      case "In Progress":
        return "./assets/Images/InProgress.png";
      case "Completed":
        return "./assets/Images/Completed.png";
      default:
        return "./assets/Images/InProgress.png";
    }
  };

  const handleHomeClick = () => {
    if (onHomeClick) onHomeClick();
  };

  const handleEditClick = () => {
    if (onEditClick) onEditClick(taskId);
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
          <img src={getStatusImage(task.Status)} className="Bar" alt={task.Status}/>
          <h4>{task.Status}</h4>
          <div className="space"></div>
          <h3>Due Date:</h3>
          <div className="space"></div>
          <h4><div id="text" ref={textRef}>{task.Due_Date}</div></h4>
          <div className="space"></div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px' }}>
            <button className="usualbutton" onClick={handleHomeClick}>HOME</button>
            <button className="usualbutton" onClick={handleEditClick}>EDIT</button>
          </div>
        </div>
      </div>
    </div>
  );
}