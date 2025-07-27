// src/DashboardPage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

// --- Import Chart.js components ---
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
// --- END Chart.js imports ---

// --- Register Chart.js components (REQUIRED) ---
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);
// --- END Registration ---

export default function DashboardPage() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [trends, setTrends] = useState([]); // This will hold the raw trend data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = getAuthToken();
      if (!token) {
        console.error("No auth token found for fetching dashboard data");
        setError("You need to be logged in to view the dashboard.");
        setLoading(false);
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // --- Fetch Overview ---
        const overviewResponse = await fetch(`${apiUrl}/api/tasks/analytics/overview`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!overviewResponse.ok) {
          let errorMessage = `Failed to fetch overview (Status: ${overviewResponse.status})`;
          if (overviewResponse.status === 401 || overviewResponse.status === 403) {
            errorMessage = "Unauthorized. Please log in.";
            localStorage.removeItem('token');
            navigate('/login');
          } else {
            const contentType = overviewResponse.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
              try {
                const errorData = await overviewResponse.json();
                errorMessage = errorData.message || errorMessage;
              } catch (e) { /* Ignore */ }
            }
          }
          throw new Error(errorMessage);
        }
        const overviewData = await overviewResponse.json();
        setOverview(overviewData);

        // --- Fetch Trends ---
        const trendsResponse = await fetch(`${apiUrl}/api/tasks/analytics/trends`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!trendsResponse.ok) {
            let errorMessage = `Failed to fetch trends (Status: ${trendsResponse.status})`;
            // Handle 401/403 similarly if needed
            const contentType = trendsResponse.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
              try {
                const errorData = await trendsResponse.json();
                errorMessage = errorData.message || errorMessage;
              } catch (e) { /* Ignore */ }
            }
            throw new Error(errorMessage);
        }
        const trendsData = await trendsResponse.json();
        setTrends(trendsData); // Store the raw trend data

      } catch (err) {
        console.error('Error fetching dashboard data (frontend):', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleHomeClick = () => {
    navigate('/'); // Navigate to TaskBoard
  };

  // --- Prepare data for Chart.js ---
  // Check if trends data exists and is an array
  const hasTrendData = trends && Array.isArray(trends) && trends.length > 0;

  // Define chartData only if there's data
  const chartData = hasTrendData
    ? {
        // X-axis labels: Dates from the trends data
        labels: trends.map(item => item._id), // item._id is the "YYYY-MM-DD" string
        datasets: [
          {
            label: 'Tasks Created',
            // Y-axis data: Counts from the trends data
            data: trends.map(item => item.count),
            // --- FURTHER UPDATED POINT STYLING ---
            borderColor: 'rgb(54, 162, 235)',        // Blue line
            backgroundColor: 'rgba(54, 162, 235, 0.1)', // Light blue fill
            borderWidth: 3,                           // Slightly thicker line
            pointBackgroundColor: 'rgb(255, 99, 132)',  // Red points (Visible color)
            pointBorderColor: '#fff',                // White point border
            pointBorderWidth: 2,                     // Point border width
            pointRadius: 6,                          // Increase point radius (default is often ~3)
            pointHoverBackgroundColor: '#fff',       // White point on hover
            pointHoverBorderColor: 'rgb(255, 99, 132)', // Red point border on hover
            pointHoverRadius: 8,                     // Increase point radius on hover
            pointHoverBorderWidth: 2,                // Point hover border width
            tension: 0.2,                            // Slightly more curve
            fill: true                               // Fill the area under the line
            // --- END FURTHER UPDATED POINT STYLING ---
          },

        ],
      }
    : null; // Return null if no data

  // Define chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Allow chart to fill container height
    plugins: {
      legend: {
        position: 'top',
         // --- Optional: Style legend labels ---
         labels: {
           color: 'rgba(0, 0, 0, 0.8)', // Darker text for legend
           font: {
             size: 14 // Slightly larger font
           }
         }
         // --- END Optional legend style ---
      },
      title: {
        display: true,
        text: 'Tasks Created Per Day (Last 7 Days)',
         // --- Optional: Style title ---
         color: 'rgba(0, 0, 0, 0.8)', // Darker text for title
         font: {
           size: 16 // Slightly larger font
         }
         // --- END Optional title style ---
      },
    },
    scales: {
      y: {
        beginAtZero: true, // Y-axis starts at 0
        ticks: {
            precision: 0, // Ensure whole numbers on Y-axis
            // --- Optional: Style Y-axis ticks ---
            color: 'rgba(0, 0, 0, 0.7)' // Darker text for ticks
            // --- END Optional Y-axis tick style ---
        },
        title: {
            display: true,
            text: 'Number of Tasks',
             // --- Optional: Style Y-axis title ---
             color: 'rgba(0, 0, 0, 0.7)'
             // --- END Optional Y-axis title style ---
        },
        // --- Add grid line styling for Y-axis ---
        grid: {
            color: 'rgba(0, 0, 0, 0.1)' // Subtle grey grid lines
        }
        // --- END Y-axis grid ---
      },
      x: {
        title: {
            display: true,
            text: 'Date',
             // --- Optional: Style X-axis title ---
             color: 'rgba(0, 0, 0, 0.7)'
             // --- END Optional X-axis title style ---
        },
        // --- Add grid line styling for X-axis ---
        grid: {
            color: 'rgba(0, 0, 0, 0.05)' // Even more subtle grey grid lines
        },
         // --- Optional: Style X-axis ticks ---
        ticks: {
            color: 'rgba(0, 0, 0, 0.7)'
        }
        // --- END Optional X-axis tick style & grid ---
      }
    },
  };
  // --- END Chart.js data preparation ---

  if (loading) {
    return (
      <div className="Note2">
        <h1>Dashboard</h1>
        <p>Loading analytics data...</p>
        <button className="usualbutton" onClick={handleHomeClick}>HOME</button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="Note2">
        <h1>Dashboard</h1>
        <p style={{ color: 'red' }}>Error loading dashboard: {error}</p>
        <button className="usualbutton" onClick={handleHomeClick}>HOME</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="colm">
        {/* --- Overview Section --- */}
        <div className="Note2">
          <h2>Task Overview</h2>
          {overview ? (
            <div>
              <h3><strong>Total Tasks:</strong> {overview.totalTasks}</h3>
              <h3><strong>Completed Tasks:</strong> {overview.completedTasks}</h3>
              <h3><strong>Pending Tasks:</strong> {overview.pendingTasks}</h3>
              <h3><strong>In Progress Tasks:</strong> {overview.inProgressTasks}</h3>
            </div>
          ) : (
            <p>No overview data available.</p>
          )}
        </div>

        {/* --- Trends Section with Chart --- */}
        <div className="Note2">
          <h2>Recent Activity</h2>
          {/* Container for the chart with increased size and internal padding */}
          <div style={{
              height: '500px',     // Increased height
              width: '100%',       // Ensure it takes the full width of the parent Note2
              padding: '20px 10px', // Add padding inside the container
              boxSizing: 'border-box' // Include padding in the element's total width and height
            }}>
            {hasTrendData ? (
              // Render the Line chart if data exists
              // Wrap the chart in another div for potential background styling
              <div style={{ height: '100%', width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.7)', padding: '10px', borderRadius: '8px' }}> {/* Optional: Light white background */}
                <Line data={chartData} options={chartOptions} />
              </div>
            ) : (
              // Message if no data - also centered within the larger container
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <p>No recent activity data available for the last 7 days.</p>
              </div>
            )}
          </div>
        </div>
        {/* --- END Trends Section --- */}

        {/* Home Button */}
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <button className="usualbutton" onClick={handleHomeClick} style={{ marginTop: '20px' }}>
            HOME
          </button>
        </div>
      </div>
    </div>
  );
}
