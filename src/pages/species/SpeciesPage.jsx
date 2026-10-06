import { modules } from "../../config/modules";
import { useResource } from "../../hooks/useResource";
import { RecordList } from "../../components/records/RecordList";
export function SpeciesPage() {
  const resource = useResource(modules.species.getAll);
  return (
    <RecordList
      config={modules.species}
      resource={resource}
      moduleKey="species"
    />
  );
}
