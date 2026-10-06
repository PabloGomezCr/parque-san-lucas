import { modules } from "../../config/modules";
import { useResource } from "../../hooks/useResource";
import { RecordList } from "../../components/records/RecordList";
export function TasksPage() {
  const resource = useResource(modules.tasks.getAll);
  return (
    <RecordList config={modules.tasks} resource={resource} moduleKey="tasks" />
  );
}
