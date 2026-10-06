import { useParams } from "react-router-dom";
import { modules } from "../../config/modules";
import { useResource } from "../../hooks/useResource";
import { RecordDetail } from "../../components/records/RecordDetail";
export function TaskDetailPage() {
  const { id } = useParams();
  const resource = useResource(modules.tasks.getById, id);
  return (
    <RecordDetail
      key={id}
      config={modules.tasks}
      resource={resource}
      moduleKey="tasks"
    />
  );
}
