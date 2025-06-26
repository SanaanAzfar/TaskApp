import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function TaskBoard() {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("All");
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const statusOptions = ['All', 'Pending', 'In Progress', 'Completed'];

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                // Using Vite's environment variables
                const apiUrl = import.meta.env.VITE_API_URL || `http://localhost:${import.meta.env.VITE_API_PORT || 5000}`;
                console.log('Fetching from:', apiUrl);
                
                const response = await fetch(`${apiUrl}/tasks`);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                console.log('API Response:', data);
                
                // Handle different response formats
                const tasksArray = Array.isArray(data) ? data : 
                                  (data?.tasks ? data.tasks : []);
                
                setTasks(tasksArray);
                setLoading(false);
                
            } catch (error) {
                console.error('Error fetching tasks:', error);
                setTasks([]);
                setLoading(false);
            }
        };
        fetchTasks();
    }, []);

    // Filter tasks based on status only
    const filteredTasks = tasks.filter(task => {
        const taskStatus = Array.isArray(task.Status) ? task.Status[0] : task.Status;
        return statusFilter === "All" || taskStatus === statusFilter;
    });

    const handleTaskClick = (taskId) => {
        navigate(`/task/${taskId}`);
    };

    const getStatusImage = (status) => {
        const statusValue = Array.isArray(status) ? status[0] : status;
        switch (statusValue) {
            case "Pending": return "/Images/Pending.png";
            case "In Progress": return "/Images/InProgress.png";
            case "Completed": return "/Images/Completed.png";
            default: return "/Images/InProgress.png";
        }
    };

    const handleStatusFilterChange = (status) => {
        setStatusFilter(status);
        setDropdownOpen(false);
    };

    const clearFilters = () => {
        setStatusFilter("All");
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
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <button
                    className="usualbutton"
                    onClick={() => navigate('/task/new')}
                    style={{
                        backgroundColor: "#4CAF50",
                        fontSize: '28px',
                        padding: '8px 30px'
                    }}
                >
                    Add
                </button>
            </div>
            
            <div className="aligner" style={{ marginBottom: '30px' }}>
                <div className="dropdown">
                    <button 
                        className="dropbtn"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        type="button"
                    >
                        {statusFilter}
                    </button>
                    {dropdownOpen && (
                        <div className="dropdown-content">
                            {statusOptions.map((status) => (
                                <a 
                                    key={status}
                                    href="#" 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleStatusFilterChange(status);
                                    }}
                                >
                                    {status}
                                </a>
                            ))}
                        </div>
                    )}
                </div>
                
                {statusFilter !== "All" && (
                    <button
                        className="usualbutton"
                        onClick={clearFilters}
                        style={{
                            backgroundColor: "#FF6B6B",
                            fontSize: '28px',
                            padding: '8px 30px',
                            marginTop: '10px'
                        }}
                    >
                        Clear Filters
                    </button>
                )}
                
                <p className="normaltext2" style={{ margin: '10px 0' }}>
                    Showing {filteredTasks.length} of {tasks.length} tasks
                    {statusFilter !== "All" && ` with status "${statusFilter}"`}
                </p>
            </div>

            <div className="colm">
                {filteredTasks.length > 0 ? (
                    filteredTasks.map((task) => (
                        <div
                            key={task._id}
                            className="Note"
                            onClick={() => handleTaskClick(task._id)}
                            style={{ cursor: 'pointer' }}
                        >
                            <h5 style={{ marginBottom: '5px' }}>{task.Title}</h5>
                            <div className="aligner" style={{ margin: '3px 0' }}>
                                <img 
                                    src={getStatusImage(task.Status)} 
                                    className="Barsm" 
                                    alt={task.Status}
                                />
                            </div>
                            <p className="normaltext2" style={{ marginTop: '3px' }}>
                                {Array.isArray(task.Status) ? task.Status[0] : task.Status}
                            </p>
                        </div>
                    ))
                ) : (
                    <div className="aligner">
                        <p className="normaltext2">
                            {statusFilter !== "All" 
                                ? "No tasks match your current filter" 
                                : "No tasks available"
                            }
                        </p>
                        {statusFilter !== "All" && (
                            <button
                                className="usualbutton"
                                onClick={clearFilters}
                                style={{ marginTop: '20px' }}
                            >
                                Show All Tasks
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}