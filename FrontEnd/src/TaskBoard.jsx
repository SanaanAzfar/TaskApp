// src/TaskBoard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// --- Helper function to get User ID from JWT token ---
const getUserIdFromToken = (token) => {
  if (!token) return null;
  try {
    // JWT has 3 parts separated by dots. The payload is the middle part.
    const base64Url = token.split('.')[1];
    // Fix potential base64 padding issues
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    const decoded = JSON.parse(jsonPayload);
    // Adjust 'id' based on what your JWT payload actually uses (could be 'userId', '_id', etc.)
    return decoded.id || decoded.userId || decoded._id || null;
  } catch (error) {
    console.error("Error decoding token to get user ID:", error);
    return null;
  }
};
// --- End Helper Function ---

export default function TaskBoard() {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("All");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    // State to potentially store user ID if needed elsewhere, or just use helper
    // const [currentUserId, setCurrentUserId] = useState(null);

    const statusOptions = ['All', 'Pending', 'In Progress', 'Completed'];

    // Check if user is logged in (token exists)
    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
        // Optional: Set user ID in state if needed elsewhere
        // if (token) {
        //   const userId = getUserIdFromToken(token);
        //   setCurrentUserId(userId);
        // }
    }, []);

    // Fetch tasks with JWT token
    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                // --- Get User ID from token ---
                const userId = getUserIdFromToken(token);
                if (!userId) {
                     console.error("Could not retrieve user ID from token");
                     throw new Error("User ID not found in token");
                }
                // --- End Get User ID ---

                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                // --- FIX: Update URL to use user ID from token ---
                const response = await fetch(`${apiUrl}/api/tasks/${userId}/tasks`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                // --- END FIX ---

                if (response.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login');
                    return;
                }

                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

                const data = await response.json();
                setTasks(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Fetch error:', error);
                // Optionally set an error state to display to user
                setTasks([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, [navigate]); // Consider if userId should be a dependency

    // Handle logout
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId'); // Remove if you store it elsewhere
        setIsLoggedIn(false);
        // setCurrentUserId(null); // Reset user ID state if used
        navigate('/login');
    };

    // --- Rest of the component (filtering, rendering, etc.) remains largely the same ---
    // Filter tasks by status
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

    // ... rest of the return statement (JSX) is unchanged ...
    // (It's the same as your provided code, just the fetch logic above was updated)
    return (
        <div>
            {/* Header with Login/Dashboard buttons */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
            }}>
                {/* Left side: Dashboard button */}
                <div style={{ flex: 1, textAlign: 'left' }}>
                    {isLoggedIn && (
                        <button
                            className="usualbutton"
                            onClick={() => navigate('/dashboard')}
                        >
                            Dashboard
                        </button>
                    )}
                </div>

                {/* Center: Task Board Title */}
                <h1 style={{ flex: 2, textAlign: 'center', margin: 0 }}>
                    Task Board
                </h1>

                {/* Right side: Logout/Login button */}
                <div style={{ flex: 1, textAlign: 'right' }}>
                    {isLoggedIn ? (
                        <button
                            className="usualbutton"
                            onClick={handleLogout}
                            style={{ backgroundColor: '#FF6B6B' }}
                        >
                            Logout
                        </button>
                    ) : (
                        <button
                            className="usualbutton"
                            onClick={() => navigate('/login')}
                        >
                            Login
                        </button>
                    )}
                </div>
            </div>

            {/* Add Task Button */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                {isLoggedIn && (
                    <button
                        className="usualbutton"
                        onClick={() => navigate('/task/new')}
                        style={{
                            backgroundColor: "#4CAF50",
                            fontSize: '28px',
                            padding: '8px 30px'
                        }}
                    >
                        Add Task
                    </button>
                )}
            </div>

            {/* Status Filter */}
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

            {/* Task List */}
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
