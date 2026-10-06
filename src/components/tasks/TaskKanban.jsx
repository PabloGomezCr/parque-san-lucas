import { RecordCard } from "../records/RecordCard";
import { statusLabels } from "../../utils/formatters";
export function TaskKanban({ tasks, config }) {
  return (
    <div className="kanban" aria-label="Tablero de tareas">
      {[
        "pending",
        "in_progress",
        "review",
        "delivered",
        "completed",
        "cancelled",
      ].map((status) => (
        <section className="kanban__column" key={status}>
          <h2>
            {statusLabels[status]}
            <span className="badge">
              {tasks.filter((task) => task.status === status).length}
            </span>
          </h2>
          {tasks
            .filter((task) => task.status === status)
            .map((task) => (
              <RecordCard key={task.id} item={task} config={config} />
            ))}
          {!tasks.some((task) => task.status === status) && (
            <p className="muted">Sin tareas en este estado.</p>
          )}
        </section>
      ))}
    </div>
  );
}
