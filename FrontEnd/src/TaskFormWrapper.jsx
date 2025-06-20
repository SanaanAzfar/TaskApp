import { useParams, useNavigate } from "react-router-dom";
import TaskForm from './TaskForm';

function TaskFormWrapper() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  
  return (
    <TaskForm 
      taskId={taskId} // Will be undefined for /create route
      onHomeClick={() => navigate('/')}
      onSaveComplete={(savedTask) => {
        // Navigate to task detail after saving
        navigate(`/task/${savedTask._id}`);
      }}
    />
  );
}

export default TaskFormWrapper;
