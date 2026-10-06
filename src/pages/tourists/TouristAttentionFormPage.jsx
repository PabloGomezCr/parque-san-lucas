import { useParams } from "react-router-dom";
import { modules } from "../../config/modules";
import { useRecordEditor } from "../../hooks/useRecordEditor";
import { RecordForm } from "../../components/records/RecordForm";
export function TouristAttentionFormPage() {
  const { id } = useParams();
  const editor = useRecordEditor(modules.tourists, id);
  return <RecordForm config={modules.tourists} editor={editor} id={id} />;
}
