import { modules } from "../../config/modules";
import { useResource } from "../../hooks/useResource";
import { RecordList } from "../../components/records/RecordList";
export function MaintenancePage() {
  const resource = useResource(modules.maintenance.getAll);
  return (
    <RecordList
      config={modules.maintenance}
      resource={resource}
      moduleKey="maintenance"
    />
  );
}
