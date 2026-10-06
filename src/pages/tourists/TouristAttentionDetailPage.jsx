import { useParams } from "react-router-dom";
import { modules } from "../../config/modules";
import { useResource } from "../../hooks/useResource";
import { RecordDetail } from "../../components/records/RecordDetail";
export function TouristAttentionDetailPage() {
  const { id } = useParams();
  const resource = useResource(modules.tourists.getById, id);
  return (
    <RecordDetail
      key={id}
      config={modules.tourists}
      resource={resource}
      moduleKey="tourists"
    />
  );
}
