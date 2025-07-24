
// LoginPage.jsx
import { useState } from "react";
import { useNavigate } from 'react-router-dom';

export default function LoginPage() { // Removed unused props
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    name: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Make sure VITE_API_URL is set correctly in your .env file (e.g., VITE_API_URL=http://localhost:5000)
  // If not set, fallback to localhost:5000
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    
   // --- ADD FRONTEND VALIDATION ---
    if (!credentials.name.trim() || !credentials.password.trim()) {
      setError('Please enter both username and password.');
      return; // Stop the submission
    }
    // --- END ADDITION ---

    setLoading(true);

    console.log("Attempting login with credentials:", credentials);

    try {
      // --- FIX: Correct the endpoint URL ---
      // Assuming backend user routes are mounted at /api/users
      // and the login route is /Login (with capital L)
      const response = await fetch(`${apiUrl}/api/users/Login`, {
        method: 'POST',
      headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      // Store the token
      localStorage.setItem('token', data.token);
      // Navigate to the TaskBoard after successful login
      navigate('/'); // Navigate to home/TaskBoard
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Function to navigate to the Register page
  const handleRegisterClick = () => {
    navigate('/register'); // <-- Navigate to Register Page
  };

  // Function to navigate to the TaskBoard (used to be onHomeClick)
  const handleHomeClick = () => {
    navigate('/'); // Navigate to home/TaskBoard
  };

  return (
    <div>
      <h1>Login</h1>
      <div className="colm">
        <div className="Note2">
          <div className="space"></div>
          <h3>Enter UserName</h3>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Enter Name"
            className="TitleBox"
            value={credentials.name}
            onChange={handleInputChange}
          />

          <div className="space"></div>

            <h3>Enter Password</h3>
            <input
            id="password"
            name="password"
            type="password"
            placeholder="Enter Password"
            className="TitleBox"
            value={credentials.password}
            onChange={handleInputChange}
          />
          <div className="space"></div>
          {error && <p style={{ color: 'red' }}>{error}</p>}

          <div className="button-container">
            {/* Replaced "HOME" button with "SIGN IN" button */}
            <button
              className="usualbutton"
              onClick={handleRegisterClick} // <-- Use handleRegisterClick
              disabled={loading}
            >
              SIGN IN {/* <-- Changed button text */}
            </button>
            <button
              className="usualbutton"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'LOGGING IN...' : 'LOGIN'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
