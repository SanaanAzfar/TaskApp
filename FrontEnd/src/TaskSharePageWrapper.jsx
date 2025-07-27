// src/TaskSharePageWrapper.jsx
import { useParams, useNavigate } from "react-router-dom";
import TaskSharePage from './TaskSharePage';

function TaskSharePageWrapper() {
  // useParams and useNavigate are used inside TaskSharePage via useParams() and useNavigate()
  // This wrapper is primarily for routing consistency if needed later.
  return <TaskSharePage />;
}

export default TaskSharePageWrapper;
