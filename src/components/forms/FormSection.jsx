import { Card } from "../common/Card";
export function FormSection({ title, children }) {
  return (
    <Card className="form-section" title={title}>
      {children}
    </Card>
  );
}
