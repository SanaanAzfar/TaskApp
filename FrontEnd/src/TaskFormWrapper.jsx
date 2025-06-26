import { useParams, useNavigate } from "react-router-dom";
import TaskForm from './TaskForm';

function TaskFormWrapper() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  
  return (
    <TaskForm 
      taskId={taskId}
      onHomeClick={() => navigate('/')}
      onSaveComplete={(savedTask) => navigate(`/task/${savedTask._id}`)}
      onCancelClick={() => {
        if (taskId) {
          // If we're editing (has taskId), go back to task details
          navigate(`/task/${taskId}`);
        } else {
          // If we're creating new, go back to home
          navigate('/');
        }
      }}
    />
  );
}

export default TaskFormWrapper;