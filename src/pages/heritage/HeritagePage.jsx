import { modules } from "../../config/modules";
import { useResource } from "../../hooks/useResource";
import { RecordList } from "../../components/records/RecordList";
export function HeritagePage() {
  const resource = useResource(modules.heritage.getAll);
  return (
    <RecordList
      config={modules.heritage}
      resource={resource}
      moduleKey="heritage"
    />
  );
}
