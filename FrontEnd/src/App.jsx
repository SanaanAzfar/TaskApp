import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TaskBoard from './TaskBoard';
import TaskDetailWrapper from './TaskDetailWrapper';
import TaskFormWrapper from './TaskFormWrapper';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<TaskBoard />} />
          <Route path="/task/:taskId" element={<TaskDetailWrapper />} />
          <Route path="/task/:taskId/edit" element={<TaskFormWrapper />} />
          <Route path="/create" element={<TaskFormWrapper />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;