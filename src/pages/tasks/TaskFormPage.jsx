import { useParams } from "react-router-dom";
import { modules } from "../../config/modules";
import { useRecordEditor } from "../../hooks/useRecordEditor";
import { RecordForm } from "../../components/records/RecordForm";
export function TaskFormPage() {
  const { id } = useParams();
  const editor = useRecordEditor(modules.tasks, id);
  return <RecordForm config={modules.tasks} editor={editor} id={id} />;
}
