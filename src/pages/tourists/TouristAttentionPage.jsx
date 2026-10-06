import { modules } from "../../config/modules";
import { useResource } from "../../hooks/useResource";
import { RecordList } from "../../components/records/RecordList";
export function TouristAttentionPage() {
  const resource = useResource(modules.tourists.getAll);
  return (
    <RecordList
      config={modules.tourists}
      resource={resource}
      moduleKey="tourists"
    />
  );
}
