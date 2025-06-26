import { useParams, useNavigate } from "react-router-dom";
import TaskForm from './TaskForm';

function TaskFormWrapper() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  
  return (
    <TaskForm 
      taskId={taskId}
      onHomeClick={() => navigate('/')}
      onSaveComplete={(taskId) => navigate(`/task/${taskId}`)}  // Changed this line
      onCancelClick={() => {
        if (taskId) {
          navigate(`/task/${taskId}`);
        } else {
          navigate('/');
        }
      }}
    />
  );
}

export default TaskFormWrapper;