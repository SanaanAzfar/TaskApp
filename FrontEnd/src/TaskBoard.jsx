import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function TaskBoard() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('http://localhost:5000/tasks');
        const data = await response.json();
        
        // Debug: Check what we're getting
        console.log('API Response:', data);
        console.log('Is array?', Array.isArray(data));
        
        // Ensure we always set an array
        if (Array.isArray(data)) {
          setTasks(data);
        } else if (data && Array.isArray(data.tasks)) {
          // If API returns {tasks: [...]}
          setTasks(data.tasks);
        } else {
          console.error('API did not return an array:', data);
          setTasks([]); // Set empty array as fallback
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setTasks([]); // Set empty array on error
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const handleTaskClick = (taskId) => {
    navigate(`/task/${taskId}`);
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

  if (loading) {
    return (
      <div>
        <h1>Task Board</h1>
        <p>Loading tasks...</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Task Board</h1>
      {/* <div style={{ marginBottom: '20px' }}>
        <button 
          className="usualbutton" 
          onClick={() => navigate('/create')}
          style={{ marginBottom: '10px' }}
        >
          CREATE NEW TASK
        </button>
      </div> */}
      <div className="colm">
        {Array.isArray(tasks) && tasks.length > 0 ? (
          tasks.map((task) => (
            <div 
              key={task._id} 
              className="Note" 
              onClick={() => handleTaskClick(task._id)}
              style={{ cursor: 'pointer' }}
            >
              <h5>{task.Title}</h5>
              <div className="aligner">
                <img src={getStatusImage(task.Status)} className="Barsm" alt={task.Status}/>
              </div>
              <p className="normaltext2">{task.Status}</p>
            </div>
          ))
        ) : (
          <p>No tasks available</p>
        )}
      </div>
    </div>
  );
}