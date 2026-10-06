import { useParams } from "react-router-dom";
import { modules } from "../../config/modules";
import { useRecordEditor } from "../../hooks/useRecordEditor";
import { RecordForm } from "../../components/records/RecordForm";
export function SpeciesFormPage() {
  const { id } = useParams();
  const editor = useRecordEditor(modules.species, id);
  return <RecordForm config={modules.species} editor={editor} id={id} />;
}
