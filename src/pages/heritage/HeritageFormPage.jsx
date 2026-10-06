import { useParams } from "react-router-dom";
import { modules } from "../../config/modules";
import { useRecordEditor } from "../../hooks/useRecordEditor";
import { RecordForm } from "../../components/records/RecordForm";
export function HeritageFormPage() {
  const { id } = useParams();
  const editor = useRecordEditor(modules.heritage, id);
  return <RecordForm config={modules.heritage} editor={editor} id={id} />;
}
