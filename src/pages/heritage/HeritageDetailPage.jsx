import { useParams } from "react-router-dom";
import { modules } from "../../config/modules";
import { useResource } from "../../hooks/useResource";
import { RecordDetail } from "../../components/records/RecordDetail";
export function HeritageDetailPage() {
  const { id } = useParams();
  const resource = useResource(modules.heritage.getById, id);
  return (
    <RecordDetail
      key={id}
      config={modules.heritage}
      resource={resource}
      moduleKey="heritage"
    />
  );
}
