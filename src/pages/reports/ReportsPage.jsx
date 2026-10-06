import { useAuth } from "../../hooks/useAuth";
import { useState } from "react";
import {
  Download,
  Eye,
  FileText,
  Users,
  Rabbit,
  Landmark,
  Droplet,
  ClipboardList,
} from "lucide-react";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { DataTable } from "../../components/common/DataTable";
import { Pagination } from "../../components/common/Pagination";
import { StatusBadge } from "../../components/common/StatusBadge";
import { FormField } from "../../components/forms/FormField";
import { SummaryChart } from "../../components/dashboard/SummaryChart";
import { StatCard } from "../../components/dashboard/StatCard";
import { LoadingSkeleton } from "../../components/feedback/LoadingSkeleton";
import { ErrorState } from "../../components/feedback/ErrorState";
import { EmptyState } from "../../components/feedback/EmptyState";
import { useResource } from "../../hooks/useResource";
import {
  reportService,
  reportReadPermissions,
} from "../../services/reportService";
import { filterReportData } from "../../utils/calculations";
import { csvDownload } from "../../utils/export";
import { formatDate } from "../../utils/formatters";
const catalogs = [
  {
    value: "tourists",
    label: "Informe de atención y afluencia turística",
    description:
      "Atenciones, procedencia de visitantes y registros del período.",
    icon: Users,
  },
  {
    value: "species",
    label: "Matriz de biodiversidad y especies",
    description: "Catálogo biológico y seguimiento de especies registradas.",
    icon: Rabbit,
  },
  {
    value: "heritage",
    label: "Reporte de conservación de patrimonio",
    description: "Intervenciones, elementos y labores de conservación.",
    icon: Landmark,
  },
  {
    value: "wellReadings",
    label: "Reporte hidrológico del pozo",
    description: "Lecturas de nivel, caudal y parámetros de campo.",
    icon: Droplet,
  },
  {
    value: "tasks",
    label: "Bitácora y cumplimiento de tareas",
    description: "Estado y seguimiento de las labores del parque.",
    icon: ClipboardList,
  },
  {
    value: "maintenance",
    label: "Reporte técnico de mantenimiento",
    description: "Mantenimiento programado y reparación de infraestructura.",
    icon: FileText,
  },
];
export function ReportsPage() {
  const { can, user } = useAuth();
  const availableCatalogs = catalogs.filter((catalog) =>
    can(reportReadPermissions[catalog.value]),
  );
  const resource = useResource(reportService.getDashboardData, user);
  const [filters, setFilters] = useState({ type: "all", start: "", end: "" });
  const [preview, setPreview] = useState(false);
  const [page, setPage] = useState(1);
  if (resource.loading) return <LoadingSkeleton />;
  if (resource.error)
    return <ErrorState message={resource.error} onRetry={resource.reload} />;
  const invalid = filters.start && filters.end && filters.start > filters.end;
  const rows = invalid ? [] : filterReportData(resource.data, filters);
  const summary = availableCatalogs
    .map((catalog) => ({
      module: catalog.value,
      name: {
        tourists: "Turistas",
        species: "Especies",
        heritage: "Patrimonio",
        wellReadings: "Pozo",
        tasks: "Tareas",
        maintenance: "Mant.",
      }[catalog.value],
      value: filterReportData(resource.data, {
        ...filters,
        type: catalog.value,
      }).length,
    }))
    .filter(
      (_, i) =>
        filters.type === "all" || availableCatalogs[i].value === filters.type,
    );
  const change = (key, value) => {
    setFilters((s) => ({ ...s, [key]: value }));
    setPage(1);
  };
  const exportColumns = [
    { key: "module", label: "Módulo" },
    { key: "title", label: "Registro" },
    { key: "date", label: "Fecha" },
    { key: "status", label: "Estado" },
  ];
  const tableColumns = [
    { key: "module", label: "Módulo" },
    { key: "title", label: "Registro" },
    { key: "date", label: "Fecha", render: (row) => formatDate(row.date) },
    {
      key: "status",
      label: "Estado",
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];
  return (
    <>
      <PageHeader
        title="Centro de Reportes Consolidados"
        subtitle="Consulta los registros operativos y prepara exportaciones de demostración del parque."
        actions={
          <Button
            variant="secondary"
            onClick={() => setPreview(true)}
            disabled={!rows.length}
          >
            <Eye size={16} />
            Vista previa
          </Button>
        }
      />
      <div className="metric-grid">
        <StatCard
          label="Registros del período"
          value={rows.length}
          detail="Calculados desde las colecciones"
        />
        <StatCard
          label="Módulos incluidos"
          value={new Set(rows.map((r) => r.module)).size}
          detail="Fuentes de información"
        />
        <StatCard
          label="Formato disponible"
          value="CSV"
          detail="Exportación mock descargable"
        />
        <StatCard
          label="Validación institucional"
          value="Pendiente"
          detail="Formatos y firmas por validar"
        />
      </div>
      <div className="content-grid">
        <div className="stack">
          <h2>Catálogo de informes técnicos</h2>
          {availableCatalogs.map(
            ({ value, label, description, icon: Icon }) => (
              <Card
                key={value}
                title={
                  <>
                    <Icon size={22} />
                    {label}
                  </>
                }
              >
                <p className="muted">{description}</p>
                <div className="row">
                  <span className="badge">Mock · por validar</span>
                  <Button
                    variant="secondary"
                    onClick={() => change("type", value)}
                  >
                    Preparar reporte
                  </Button>
                </div>
              </Card>
            ),
          )}
        </div>
        <aside className="stack">
          <Card title="Constructor a la medida">
            <div className="stack">
              <FormField label="Tipo de reporte">
                <select
                  value={filters.type}
                  onChange={(e) => change("type", e.target.value)}
                >
                  <option value="all">Todos los módulos</option>
                  {availableCatalogs.map((catalog) => (
                    <option key={catalog.value} value={catalog.value}>
                      {catalog.label}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Desde">
                <input
                  type="date"
                  value={filters.start}
                  onChange={(e) => change("start", e.target.value)}
                />
              </FormField>
              <FormField
                label="Hasta"
                error={
                  invalid
                    ? "La fecha final debe ser posterior o igual a la inicial."
                    : ""
                }
              >
                <input
                  type="date"
                  value={filters.end}
                  onChange={(e) => change("end", e.target.value)}
                />
              </FormField>
              <Button
                variant="secondary"
                onClick={() => {
                  setFilters({ type: "all", start: "", end: "" });
                  setPage(1);
                }}
              >
                Limpiar filtros
              </Button>
              {rows.length > 0 && can("reports.export") && (
                <a
                  className="btn btn-primary"
                  href={csvDownload(rows, exportColumns)}
                  download="reporte-san-lucas-mock.csv"
                >
                  <Download size={16} />
                  Descargar CSV mock
                </a>
              )}
              <Button
                variant="secondary"
                onClick={() => setPreview(true)}
                disabled={!rows.length}
              >
                Generar vista previa
              </Button>
            </div>
          </Card>
          <div className="notice">
            Las exportaciones son archivos de demostración. Formatos oficiales,
            firmas digitales y categorías institucionales están por validar.
          </div>
        </aside>
      </div>
      <Card title="Resumen por módulo">
        <SummaryChart data={summary} label="Registros" />
      </Card>
      <Card title="Registros incluidos en el reporte">
        {rows.length ? (
          <>
            <DataTable
              data={rows.slice((page - 1) * 10, page * 10)}
              columns={tableColumns}
              caption="Registros filtrados del reporte"
            />
            <Pagination
              page={page}
              total={rows.length}
              pageSize={10}
              onChange={setPage}
            />
          </>
        ) : (
          <EmptyState title="No se encontraron datos para los filtros seleccionados" />
        )}
      </Card>
      <Modal
        open={preview}
        title="Vista previa del reporte · mock"
        onClose={() => setPreview(false)}
      >
        <p>Parque Nacional Isla San Lucas · {rows.length} registros</p>
        <p className="muted">
          Período: {filters.start || "Inicio del registro"} —{" "}
          {filters.end || "Todas las fechas"}
        </p>
        <DataTable
          data={rows}
          columns={tableColumns}
          caption="Vista previa del reporte"
        />
        {can("reports.export") && (
          <a
            className="btn btn-primary"
            href={csvDownload(rows, exportColumns)}
            download="reporte-san-lucas-mock.csv"
          >
            Descargar CSV mock
          </a>
        )}
      </Modal>
    </>
  );
}
