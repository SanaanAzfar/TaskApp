// src/TaskDetail.jsx
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

// --- Helper function to get User ID from JWT token (Place at the top or in a utils file) ---
const getUserIdFromToken = (token) => {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    const decoded = JSON.parse(jsonPayload);
    return decoded.id || decoded.userId || decoded._id || null; // Adjust key if needed
  } catch (error) {
    console.error("Error decoding token to get user ID:", error);
    return null;
  }
};
// --- End Helper Function ---

export default function TaskDetail({ taskId, onHomeClick, onEditClick }) {
    const navigate = useNavigate();
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Removed showShareInput and userIdToShareWith states

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const getAuthToken = () => {
        return localStorage.getItem('token');
    };

    // --- Function to determine if the current user is the owner ---
    const isCurrentUserOwner = () => {
        if (!task || !task.Owner) return false;
        const token = getAuthToken();
        if (!token) return false;
        const currentUserId = getUserIdFromToken(token);
        return currentUserId === task.Owner;
    };
    // --- End Ownership Check ---

    // --- Function to show Owner ID ---
    const handleShowOwner = () => {
        if (task && task.Owner) {
            alert(`Owner ID: ${task.Owner}`);
        } else {
            alert("Owner information not available.");
        }
    };

    // --- Function to handle Share button click (navigates to Share Page) ---
    const handleShareClick = () => {
        if (taskId) {
            // Navigate to the dedicated share page/route
            navigate(`/task/${taskId}/share`);
        } else {
            alert("Cannot navigate to share page: Task ID is missing.");
        }
    };
    // --- End Share Navigation ---

    // Removed handlePerformShare function

    useEffect(() => {
        const fetchTask = async () => {
            const token = getAuthToken();
            if (!token) {
                console.error("No auth token found for fetching task details");
                setLoading(false);
                setError("You need to be logged in to view task details.");
                return;
            }

            try {
                setLoading(true);
                setError(null);
                const response = await fetch(`${apiUrl}/api/tasks/${taskId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    let errorMessage = `HTTP error! status: ${response.status}`;
                    if (response.status === 404) {
                        errorMessage = "Task not found.";
                    } else if (response.status === 401 || response.status === 403) {
                        errorMessage = "Unauthorized. Please log in.";
                    } else {
                        const contentType = response.headers.get("content-type");
                        if (contentType && contentType.indexOf("application/json") !== -1) {
                            try {
                                const errorData = await response.json();
                                errorMessage = errorData.message || errorMessage;
                            } catch (e) { /* Ignore */ }
                        } else {
                            try {
                                const errorText = await response.text();
                                errorMessage = errorText || errorMessage;
                            } catch (e) { /* Ignore */ }
                        }
                    }
                    throw new Error(errorMessage);
                }

                const data = await response.json();
                setTask(data);
            } catch (error) {
                console.error('Error fetching task (frontend):', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        if (taskId) {
           fetchTask();
           // Removed share state reset
        } else {
           setLoading(false);
           setError("Task ID is missing.");
        }
    }, [taskId]);


    const handleDeleteClick = async () => {
         if (!isCurrentUserOwner()) {
             alert("You do not have permission to delete this task.");
             return;
         }
        if (!window.confirm("Are you sure you want to delete this task?")) return;

        const token = getAuthToken();
        if (!token) {
            console.error("No auth token found for deleting task");
            alert("You need to be logged in to delete tasks.");
            return;
        }

        try {
            const response = await fetch(`${apiUrl}/api/tasks/${taskId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                onHomeClick?.();
            } else {
                let errorMessage = 'Failed to delete task';
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    try {
                        const errorData = await response.json();
                        errorMessage = errorData.message || errorMessage;
                    } catch (e) { /* Ignore */ }
                } else {
                    try {
                        const errorText = await response.text();
                        errorMessage = errorText || errorMessage;
                    } catch (e) { /* Ignore */ }
                }
                if (response.status === 403) {
                     alert(`Permission Denied: ${errorMessage}`);
                } else {
                     throw new Error(errorMessage);
                }
            }
        } catch (error) {
            console.error('Error deleting task (frontend):', error);
            alert(`Delete failed: ${error.message}`);
        }
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

    const handleHomeClick = () => onHomeClick?.();
    const handleEditClick = () => {
         if (!isCurrentUserOwner()) {
             alert("You do not have permission to edit this task.");
             return;
         }
         onEditClick?.(taskId);
    };

    if (loading) {
        return (
            <div className="Note2">
                 {/* --- FIXED HEADER LAYOUT FOR LOADING --- */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between', // Align items to edges
                    alignItems: 'center',
                    marginBottom: '20px'
                }}>
                    <button className="usualbutton" onClick={handleShowOwner}>
                        OWNER
                    </button>
                    <h1 style={{ margin: 0, textAlign: 'center', flex: 1 }}>
                        Task Details
                    </h1>
                    <button className="usualbutton" onClick={handleShareClick}> {/* Navigate on click */}
                        SHARE
                    </button>
                </div>
                {/* --- END FIXED HEADER LAYOUT --- */}
                <p className="normaltext">Loading task details...</p>
                <button className="usualbutton" onClick={handleHomeClick}>HOME</button>
            </div>
        );
    }

    if (error || !task) {
        return (
            <div className="Note2">
                {/* --- FIXED HEADER LAYOUT FOR ERROR --- */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px'
                }}>
                    <button className="usualbutton" onClick={handleShowOwner}>
                        OWNER
                    </button>
                    <h1 style={{ margin: 0, textAlign: 'center', flex: 1 }}>
                        Task Details
                    </h1>
                    <button className="usualbutton" onClick={handleShareClick}> {/* Navigate on click */}
                        SHARE
                    </button>
                </div>
                {/* --- END FIXED HEADER LAYOUT --- */}
                <p className="normaltext" style={{ color: error ? 'red' : 'inherit' }}>{error || 'Task not found'}</p>
                <button className="usualbutton" onClick={handleHomeClick}>HOME</button>
            </div>
        );
    }

    // --- Determine if buttons should be shown/disabled ---
    const userIsOwner = isCurrentUserOwner();
    // --- End Determination ---

    return (
        <div>
            {/* --- FIXED HEADER SECTION LAYOUT (OWNER | Title | SHARE) --- */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between', // Align items to edges
                alignItems: 'center',
                marginBottom: '20px'
            }}>
                <button className="usualbutton" onClick={handleShowOwner}>
                    OWNER
                </button>
                <h1 style={{ margin: 0, textAlign: 'center', flex: 1 }}> {/* Center title with flex: 1 */}
                    Task Details
                </h1>
                <button className="usualbutton" onClick={handleShareClick}> {/* Navigate on click */}
                    SHARE
                </button>
            </div>
            {/* --- END FIXED HEADER SECTION --- */}

            {/* --- REMOVED CONDITIONAL SHARE INPUT --- */}
            {/* The inline share input block is removed */}

            {/* --- EXISTING TASK DETAILS CONTENT --- */}
            <div className="colm">
                <div className="Note2">
                    {/* --- ADDED CHECK FOR task BEFORE ACCESSING PROPERTIES --- */}
                    {task ? (
                        <>
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
                        </>
                     ) : (
                         // This fallback should rarely render due to outer 'if (error || !task)' check,
                         // but acts as an extra safety net.
                         <p>Loading task data...</p>
                     )}
                     {/* --- END ADDED CHECK --- */}
                    <div className="space"></div>
                    {/* --- UPDATED BUTTON CONTAINER WITH OWNER CHECKS --- */}
                    <div className="button-container">
                        <button className="usualbutton" onClick={handleHomeClick}>HOME</button>
                        <button
                            className="usualbutton"
                            onClick={handleEditClick}
                            disabled={!userIsOwner}
                            title={!userIsOwner ? "Only the task owner can edit" : ""}
                            style={!userIsOwner ? { backgroundColor: '#cccccc', cursor: 'not-allowed' } : {}}
                        >
                            {userIsOwner ? 'EDIT' : 'EDIT (Owner Only)'}
                        </button>
                        <button
                            className="usualbutton"
                            onClick={handleDeleteClick}
                            disabled={!userIsOwner}
                            title={!userIsOwner ? "Only the task owner can delete" : ""}
                            style={!userIsOwner ? { backgroundColor: '#cccccc', cursor: 'not-allowed' } : {}}
                        >
                            {userIsOwner ? 'DELETE' : 'DELETE (Owner Only)'}
                        </button>
                    </div>
                    {/* --- END UPDATED BUTTON CONTAINER --- */}
                </div>
            </div>
            {/* --- END EXISTING TASK DETAILS CONTENT --- */}
        </div>
    );
}
