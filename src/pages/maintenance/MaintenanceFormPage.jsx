import { useParams } from "react-router-dom";
import { modules } from "../../config/modules";
import { useRecordEditor } from "../../hooks/useRecordEditor";
import { RecordForm } from "../../components/records/RecordForm";
export function MaintenanceFormPage() {
  const { id } = useParams();
  const editor = useRecordEditor(modules.maintenance, id);
  return <RecordForm config={modules.maintenance} editor={editor} id={id} />;
}
