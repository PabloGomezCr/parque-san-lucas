import { Activity } from "lucide-react";
import { Card } from "../common/Card";
export function StatCard({ label, value, detail, icon: Icon = Activity, module }) {
  return (
    <Card className="stat-card" data-module={module}>
      <div className="stat-card__top">
        <span className="eyebrow">{label}</span>
        <span className="stat-card__icon">
          <Icon size={20} />
        </span>
      </div>
      <strong className="stat-card__value">{value}</strong>
      <p className="stat-card__detail">{detail}</p>
    </Card>
  );
}
