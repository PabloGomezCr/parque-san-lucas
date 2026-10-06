import { WeatherSummaryCard } from "../../components/weather/WeatherSummaryCard";
import { IncidentInbox } from "../../components/incidents/IncidentInbox";
import { useAuth } from "../../hooks/useAuth";
import { UserManagement } from "../../components/admin/UserManagement";
import { ChatPanel } from "../../components/chat/ChatPanel";
import { DelegationSummary } from "../../components/admin/DelegationSummary";
import { chartColors } from "../../config/chartColors";
import { Link } from "react-router-dom";
import {
  ClipboardList,
  CheckCheck,
  Clock,
  Users,
  Wrench,
  Landmark,
  Rabbit,
  Droplet,
  Plus,
  RefreshCw,
  FileText,
} from "lucide-react";
import { PageHeader } from "../../components/layout/PageHeader";
import { StatCard } from "../../components/dashboard/StatCard";
import { SummaryChart } from "../../components/dashboard/SummaryChart";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { DataTable } from "../../components/common/DataTable";
import { StatusBadge } from "../../components/common/StatusBadge";
import { LoadingSkeleton } from "../../components/feedback/LoadingSkeleton";
import { ErrorState } from "../../components/feedback/ErrorState";
import { EmptyState } from "../../components/feedback/EmptyState";
import { useResource } from "../../hooks/useResource";
import { reportService } from "../../services/reportService";
import {
  getCompletedTasks,
  getLatestWellReading,
  getPendingTasks,
  getTouristTotal,
  getRecentActivity,
  groupTouristsByDate,
} from "../../utils/calculations";
import { formatDate } from "../../utils/formatters";
export function DashboardPage({ section }) {
  if (section === "users") return <UserManagement />;
  if (section === "incidents") return <IncidentInbox />;
  if (section === "chat") return <ChatPanel />;
  return <DashboardOverview />;
}
function DashboardOverview() {
  const { can, user } = useAuth();
  const resource = useResource(reportService.getDashboardData, user);
  if (resource.loading) return <LoadingSkeleton rows={8} />;
  if (resource.error)
    return <ErrorState message={resource.error} onRetry={resource.reload} />;
  const data = resource.data;
  const latest = getLatestWellReading(data.wellReadings);
  const activity = getRecentActivity(data);
  const metrics = [
    {
      label: "Tareas pendientes",
      value: getPendingTasks(data.tasks),
      detail: "Atención requerida",
      icon: ClipboardList,
      module: "tasks",
      permission: "task.view",
    },
    {
      label: "Tareas en proceso",
      value: data.tasks.filter((x) => x.status === "in_progress").length,
      detail: "En curso operativo",
      icon: Clock,
      module: "tasks",
      permission: "task.view",
    },
    {
      label: "Tareas finalizadas",
      value: getCompletedTasks(data.tasks),
      detail: "Histórico de tareas concluidas",
      icon: CheckCheck,
      module: "species",
      permission: "task.view",
    },
    {
      label: "Turistas atendidos",
      value: getTouristTotal(data.tourists),
      detail: "Visitantes del período registrado",
      icon: Users,
      module: "tourists",
      permission: "tourist.view",
    },
    {
      label: "Mantenimientos activos",
      value: data.maintenance.filter((x) =>
        ["planned", "in_progress"].includes(x.status),
      ).length,
      detail: "Infraestructura y servicios",
      icon: Wrench,
      module: "maintenance",
      permission: "maintenance.view",
    },
    {
      label: "Intervenciones patrimonio",
      value: data.heritage.filter((x) =>
        ["pending", "in_progress"].includes(x.status),
      ).length,
      detail: "Seguimiento de conservación",
      icon: Landmark,
      module: "heritage",
      permission: "heritage.view",
    },
    {
      label: "Especies registradas",
      value: data.species.length,
      detail: "Catálogo de biodiversidad",
      icon: Rabbit,
      module: "species",
      permission: "species.view",
    },
    {
      label: "Pozo de agua",
      value: latest ? `${latest.level} m` : "Sin lectura",
      detail: "Último nivel registrado · mock",
      icon: Droplet,
      module: "well-monitoring",
      permission: "well.view",
    },
  ];
  return (
    <>
      <PageHeader
        title="Resumen del Parque"
        subtitle="Consulta el estado general de las actividades registradas, el monitoreo del agua y la atención de visitantes."
        actions={
          <>
            <Button variant="secondary" onClick={resource.reload}>
              <RefreshCw size={16} />
              Actualizar datos
            </Button>
            {can("task.create") && (
              <Link className="btn btn-primary" to="/tasks/new">
                <Plus size={16} />
                Nueva tarea
              </Link>
            )}
          </>
        }
      />
      <div className="row">
        <span className="badge">Supervisión territorial · SINAC</span>
        <span className="badge">Entorno de demostración</span>
      </div>
      <WeatherSummaryCard variant="detailed" />
      {can("delegation.view_history") && <DelegationSummary />}
      <div className="metric-grid">
        {metrics
          .filter((metric) => can(metric.permission))
          .map((metric) => (
            <StatCard key={metric.label} {...metric} />
          ))}
      </div>
      {!activity.length && (
        <EmptyState
          title="No hay actividades registradas"
          action={can("task.create") ? (
            <Link className="btn btn-primary" to="/tasks/new">
              Registrar primera tarea
            </Link>
          ) : undefined}
        />
      )}
      <div className="content-grid">
        <div className="stack">
          <Card title="Actividad Operativa Reciente">
            <DataTable
              caption="Actividad reciente de todos los módulos"
              data={activity.slice(0, 5)}
              columns={[
                {
                  key: "category",
                  label: "Categoría y detalle",
                  render: (item) => (
                    <div className="stack">
                      <span className="badge">{item.category}</span>
                      <Link className="text-link" to={item.path}>
                        {item.title}
                      </Link>
                    </div>
                  ),
                },
                {
                  key: "date",
                  label: "Fecha",
                  render: (item) => formatDate(item.date),
                },
                {
                  key: "status",
                  label: "Estado",
                  render: (item) => <StatusBadge status={item.status} />,
                },
              ]}
            />
            <div className="pagination">
              <span>
                Mostrando {Math.min(activity.length, 5)} de {activity.length}{" "}
                operaciones
              </span>
              {can("reports.view") && (
                <Link className="text-link" to="/reports">
                  Consultar reporte completo →
                </Link>
              )}
            </div>
          </Card>
          {can("tourist.view") && (
            <Card title="Turistas por período">
              <p className="muted">
                Afluencia registrada en las bitácoras de atención.
              </p>
              <SummaryChart
                kind="area"
                color={chartColors.tourists}
                data={groupTouristsByDate(data.tourists)}
                nameKey="date"
                label="Visitantes"
              />
              <Link className="text-link" to="/tourists">
                Consultar atenciones de turistas →
              </Link>
            </Card>
          )}
        </div>
        <aside className="stack">
          {can("well.view") && (
            <Card
              title={
                <>
                  <Droplet size={20} />
                  Pozo de Agua
                </>
              }
            >
              <div className="stack">
                {latest ? (
                  <>
                    <div className="well-reading">
                      <small>NIVEL ACTUAL</small>
                      <strong>{latest.level} m</strong>
                      <small>Lectura mock</small>
                    </div>
                    <div className="notice">
                      <p>Caudal: {latest.flow} L/min</p>
                      <p>Temperatura: {latest.temperature} °C</p>
                      <p>pH: {latest.ph}</p>
                      <p>{formatDate(latest.date)}</p>
                    </div>
                  </>
                ) : (
                  <p className="muted">Sin lecturas disponibles.</p>
                )}
                <Link className="btn btn-primary" to="/well-monitoring">
                  Abrir módulo de monitoreo del pozo
                </Link>
              </div>
            </Card>
          )}
          <Card title="Tareas por estado">
            <SummaryChart
              label="Tareas"
              color={chartColors.tasks}
              data={[
                { name: "Pendientes", value: getPendingTasks(data.tasks) },
                {
                  name: "En curso",
                  value: data.tasks.filter((x) => x.status === "in_progress")
                    .length,
                },
                { name: "Finalizadas", value: getCompletedTasks(data.tasks) },
              ]}
            />
          </Card>
          <Card title="Enlaces rápidos">
            <div className="dashboard-links">
              {can("tourist.create") && (
                <Link to="/tourists/new">
                  <Users size={20} />
                  Registrar atención de turistas
                </Link>
              )}
              {can("species.create") && (
                <Link to="/species/new">
                  <Rabbit size={20} />
                  Registro de fauna y flora
                </Link>
              )}
              {can("reports.view") && (
                <Link to="/reports">
                  <FileText size={20} />
                  Reportes del parque
                </Link>
              )}
            </div>
          </Card>
        </aside>
      </div>
    </>
  );
}
