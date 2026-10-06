import { ArrowRight, CalendarDays, MapPin, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "../common/Card";
import { StatusBadge } from "../common/StatusBadge";
import { formatDate } from "../../utils/formatters";
export function RecordCard({ config, item }) {
  return (
    <Card className="record-card">
      {item.image && (
        <img
          className="record-card__image"
          src={item.image}
          alt={`Referencia visual: ${item[config.titleKey]}`}
          loading="lazy"
        />
      )}
      <div className="record-card__body">
        <div className="row">
          <span className="badge">{item[config.categoryKey]}</span>
          <StatusBadge status={item.status} />
          {item.priority && <StatusBadge status={item.priority} />}
        </div>
        <h2>{item[config.titleKey]}</h2>
        {item.scientificName && (
          <p className="record-card__scientific">{item.scientificName}</p>
        )}
        <div className="record-card__meta">
          <span>
            <CalendarDays size={14} />
            {formatDate(item[config.dateKey])}
          </span>
          {item[config.ownerKey] && (
            <span>
              <UserRound size={14} />
              {item[config.ownerKey]}
            </span>
          )}
          {item.location && (
            <span>
              <MapPin size={14} />
              {item.location}
            </span>
          )}
        </div>
        {config.view === "grid" && (
          <p className="record-card__description">
            {item.notes ||
              item.description ||
              "Registro de demostración para seguimiento del parque."}
          </p>
        )}
      </div>
      <div className="record-card__footer">
        <Link className="btn btn-secondary" to={`${config.path}/${item.id}`}>
          {config.path === "/species"
            ? "Ficha técnica"
            : `Ver ${config.singular}`}
          <ArrowRight size={16} />
        </Link>
      </div>
    </Card>
  );
}
