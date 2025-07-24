
// src/RegisterPage.jsx
import { useState } from "react";
import { useNavigate } from 'react-router-dom';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    name: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(''); // State for success message

  // Make sure VITE_API_URL is set correctly in your .env file
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
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/api/users/Register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Name: credentials.name, Password: credentials.password })
      });

      let data;
      const contentType = response.headers.get("content-type");
      let responseText = "";

      // Attempt to get the response body
      try {
        responseText = await response.text();
      } catch (textError) {
        console.error("Failed to read response body as text:", textError);
        responseText = ""; // Fallback
      }

      // Check if the response is actually JSON
      if (contentType && contentType.indexOf("application/json") !== -1) {
        try {
          // Try parsing the fetched text as JSON
          data = JSON.parse(responseText);
        } catch (parseError) {
          // If parsing fails, log the raw text and throw an error
          console.error("Failed to parse JSON response:", responseText, "Parse error:", parseError);
          throw new Error(`Invalid JSON response received from server: ${responseText.substring(0, 100)}...`);
        }
      } else {
        // If not JSON, log the content type and raw text
        console.error("Non-JSON response received. Content-Type:", contentType, "Response Text:", responseText, "Status:", response.status);
        // Create a data-like object for error handling below
        data = { message: responseText || `Server error (${response.status})` };
      }

      if (!response.ok) {
        // Server sent an error response (4xx, 5xx)
        throw new Error(data.message || `Registration failed (Status: ${response.status})`);
      }

      // If successful (e.g., 201 Created)
      setSuccess(data.message || 'User registered successfully!');
      setCredentials({ name: '', password: '' });

    } catch (err) {
      console.error('Registration error (caught):', err);
      setError(err.message || 'An unexpected error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginClick = () => {
    navigate('/login'); // Navigate to the Login page
  };

  return (
    <div>
      <h1>Sign In</h1> {/* Changed title */}
      <div className="colm">
        <div className="Note2">
          <div className="space"></div>
           <h3>Enter UserName</h3>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Enter Username"
            className="TitleBox"
            value={credentials.name}
            onChange={handleInputChange}
            required // Add required attribute
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
            required // Add required attribute
          />
          
          <div className="space"></div>

          {/* Display Error Message */}
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {/* Display Success Message */}
          {success && <p style={{ color: 'green' }}>{success}</p>}

          <div className="button-container">
            <button
              className="usualbutton"
              onClick={handleLoginClick} // <-- Navigate to Login
              disabled={loading}
            >
              LOGIN {/* Changed button text */}
            </button>
            <button
              className="usualbutton"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'SIGNING IN...' : 'SIGN IN'} {/* Changed button text and loading text */}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
