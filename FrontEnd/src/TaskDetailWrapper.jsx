import { useParams, useNavigate } from "react-router-dom";
import TaskDetail from './TaskDetail';

function TaskDetailWrapper() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  
  return (
    <TaskDetail 
      taskId={taskId}
      onHomeClick={() => navigate('/')}
      onEditClick={(id) => navigate(`/task/${id}/edit`)}
    />
  );
}

export default TaskDetailWrapper;
