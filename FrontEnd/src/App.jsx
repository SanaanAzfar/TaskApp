// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TaskBoard from './TaskBoard';
import TaskDetailWrapper from './TaskDetailWrapper';
import TaskFormWrapper from './TaskFormWrapper';
import Login from './Login'; // Make sure this path is correct
import Signin from './Signin.jsx'; // Import RegisterPage

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<TaskBoard />} />
          {/* Route for Login Page */}
          <Route path="/login" element={<Login />} />
          {/* Route for Register Page */}
          <Route path="/register" element={<Signin />} />
          <Route path="/task/:taskId" element={<TaskDetailWrapper />} />
          <Route path="/task/:taskId/edit" element={<TaskFormWrapper />} />
          <Route path="/task/new" element={<TaskFormWrapper />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
