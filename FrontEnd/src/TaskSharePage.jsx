// src/TaskSharePage.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';

export default function TaskSharePage() {
    const { taskId } = useParams();
    const navigate = useNavigate();
    const [sharedUsers, setSharedUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [taskTitle, setTaskTitle] = useState(""); // Store task title if needed elsewhere
    const [userIdToShare, setUserIdToShare] = useState('');
    const [addError, setAddError] = useState('');

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const getAuthToken = () => {
        return localStorage.getItem('token');
    };

    useEffect(() => {
        const fetchSharedUsers = async () => {
            const token = getAuthToken();
            if (!token || !taskId) {
                console.error("Missing token or taskId");
                setError("Authentication or task ID missing.");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                setAddError('');

                const taskResponse = await fetch(`${apiUrl}/api/tasks/${taskId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!taskResponse.ok) {
                    if (taskResponse.status === 404) {
                        throw new Error("Task not found.");
                    } else if (taskResponse.status === 401 || taskResponse.status === 403) {
                        throw new Error("Unauthorized. Please log in.");
                    } else {
                        throw new Error(`Failed to fetch task details (Status: ${taskResponse.status})`);
                    }
                }
                const taskData = await taskResponse.json();
                // Store task title if you need it for other context, but main header is just "Shared"
                setTaskTitle(taskData.Title || "Unknown Task");


                const sharedResponse = await fetch(`${apiUrl}/api/tasks/${taskId}/shared`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!sharedResponse.ok) {
                    if (sharedResponse.status === 404) {
                         setSharedUsers([]);
                         return;
                    } else if (sharedResponse.status === 401 || sharedResponse.status === 403) {
                        throw new Error("Unauthorized to view shared list.");
                    } else {
                        throw new Error(`Failed to fetch shared users (Status: ${sharedResponse.status})`);
                    }
                }

                const sharedData = await sharedResponse.json();
                const sharedList = Array.isArray(sharedData) ? sharedData : (sharedData.Shared || []);
                setSharedUsers(sharedList);

            } catch (err) {
                console.error("Error fetching shared users:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSharedUsers();
    }, [taskId]);

    const handleUnshareUser = async (userIdToRemove) => {
        if (!window.confirm(`Are you sure you want to remove user ${userIdToRemove} from sharing?`)) {
            return;
        }

        const token = getAuthToken();
        if (!token || !taskId) {
            alert("Authentication or task ID missing.");
            return;
        }

        try {
            const response = await fetch(`${apiUrl}/api/tasks/${taskId}/unshare`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId: userIdToRemove })
            });

            if (!response.ok) {
                let errorMessage = `Failed to unshare user (Status: ${response.status})`;
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    try {
                        const errorData = await response.json();
                        errorMessage = errorData.message || errorMessage;
                    } catch (e) { /* Ignore parse error */ }
                }
                throw new Error(errorMessage);
            }

            setSharedUsers(prevUsers => prevUsers.filter(id => id !== userIdToRemove));
            const data = await response.json();
            console.log("Unshare successful:", data.message);
            setAddError('');

        } catch (err) {
            console.error("Error removing user:", err);
            alert(`Failed to remove user: ${err.message}`);
        }
    };

    const handleAddUser = async () => {
        if (!userIdToShare.trim()) {
            setAddError("Please enter a User ID to share with.");
            return;
        }

        const token = getAuthToken();
        if (!token || !taskId) {
            setAddError("Authentication or task ID missing.");
            return;
        }

        try {
            setAddError('');
            const response = await fetch(`${apiUrl}/api/tasks/${taskId}/share`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId: userIdToShare.trim() })
            });

            if (!response.ok) {
                let errorMessage = `Failed to share task (Status: ${response.status})`;
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    try {
                        const errorData = await response.json();
                        errorMessage = errorData.message || errorMessage;
                    } catch (e) {
                       console.error("Failed to parse add user error JSON:", e);
                    }
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log("Share successful:", data.message);
            setSharedUsers(prevUsers => {
                if (!prevUsers.includes(userIdToShare.trim())) {
                    return [...prevUsers, userIdToShare.trim()];
                }
                return prevUsers;
            });
            setUserIdToShare('');

        } catch (err) {
            console.error("Error adding user:", err);
            setAddError(err.message);
        }
    };

    const handleHomeClick = () => {
        navigate('/');
    };

    const handleClearClick = () => {
        navigate(`/task/${taskId}`);
    };


    if (loading) {
        return (
            <div className="Note2">
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px'
                }}>
                    <button className="usualbutton" onClick={handleHomeClick}>HOME</button>
                    {/* --- CHANGED TITLE --- */}
                    <h1 style={{ margin: 0, textAlign: 'center', flex: 1 }}>Shared</h1>
                    <button className="usualbutton" onClick={handleClearClick}>CLEAR</button>
                </div>
                <p>Loading shared user data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="Note2">
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px'
                }}>
                    <button className="usualbutton" onClick={handleHomeClick}>HOME</button>
                     {/* --- CHANGED TITLE --- */}
                    <h1 style={{ margin: 0, textAlign: 'center', flex: 1 }}>Shared</h1>
                    <button className="usualbutton" onClick={handleClearClick}>CLEAR</button>
                </div>
                <p style={{ color: 'red' }}>Error: {error}</p>
                <button className="usualbutton" onClick={handleClearClick} style={{ marginTop: '10px' }}>
                    Back to Task
                </button>
            </div>
        );
    }

    return (
        <div>
            {/* Header with HOME and CLEAR buttons */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
            }}>
                <button className="usualbutton" onClick={handleHomeClick}>
                    HOME
                </button>
                 {/* --- CHANGED TITLE --- */}
                <h1 style={{ margin: 0, textAlign: 'center', flex: 1 }}>
                    Shared {/* Just "Shared" as requested */}
                </h1>
                <button className="usualbutton" onClick={handleClearClick}>
                    CLEAR
                </button>
            </div>

            {/* --- REVISED SECTION: Add User (Styled like TaskBoard Add Task) --- */}
            {/* Center the entire content block */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
                {/* Use Note2, make it wider like TaskBoard's Add Task area */}
                <div className="Note2" style={{ padding: '25px', width: '100%', maxWidth: '600px' }}> {/* Increased padding and max-width */}

                    {/* Add User Input and Button - Vertical Layout */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '15px' }}> {/* stretch items to fill container */}
                        {/* Use TitleBox class for input */}
                        <input
                            type="text"
                            value={userIdToShare}
                            onChange={(e) => setUserIdToShare(e.target.value)}
                            placeholder="Enter User ID to Share With"
                            className="TitleBox"
                            // Width is handled by the parent container now
                        />
                        {/* Use usualbutton class, styled very similar to TaskBoard's Add Task button */}
                        <button
                            className="usualbutton"
                            onClick={handleAddUser}
                            style={{
                                // Styles to match TaskBoard Add Task button
                                backgroundColor: "#4CAF50", // Green background
                                fontSize: '24px', // Larger font size like Add Task
                                padding: '10px 20px', // Generous padding
                                // width: '100%' // Optional: Uncomment if you want button full width
                            }}
                        >
                            Add User {/* Button text */}
                        </button>
                    </div>

                    {/* Display Add Error - Centered */}
                    {addError && (
                        <p style={{ color: 'red', marginTop: '15px', marginBottom: 0, textAlign: 'center' }}>{addError}</p>
                    )}
                </div>
            </div>
            {/* --- END REVISED SECTION --- */}

            {/* List of Shared Users - Using colm for grid layout like TaskBoard */}
            <div className="colm">
                {sharedUsers && sharedUsers.length > 0 ? (
                    sharedUsers.map((userId) => (
                        <div key={userId} className="Note" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px' }}>
                            <span style={{ wordBreak: 'break-all', marginRight: '10px' }}>{userId}</span>
                            <button
                                className="usualbutton"
                                onClick={() => handleUnshareUser(userId)}
                                style={{ backgroundColor: '#FF6B6B', padding: '5px 15px', minWidth: '80px' }}
                            >
                                Remove
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="aligner">
                        <p className="normaltext2">No users are currently sharing this task.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
