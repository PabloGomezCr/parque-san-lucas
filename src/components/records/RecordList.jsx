import { useAuth } from "../../hooks/useAuth";
import { useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { Plus, Download } from "lucide-react";
import { PageHeader } from "../layout/PageHeader";
import { StatCard } from "../dashboard/StatCard";
import { SearchBar } from "../common/SearchBar";
import { SegmentedControl } from "../common/Tabs";
import { Button } from "../common/Button";
import { Card } from "../common/Card";
import { DataTable } from "../common/DataTable";
import { Pagination } from "../common/Pagination";
import { StatusBadge } from "../common/StatusBadge";
import { LoadingSkeleton } from "../feedback/LoadingSkeleton";
import { EmptyState } from "../feedback/EmptyState";
import { NoResultsState } from "../feedback/NoResultsState";
import { ErrorState } from "../feedback/ErrorState";
import { Toast } from "../feedback/Toast";
import { RecordCard } from "./RecordCard";
import { TaskKanban } from "../tasks/TaskKanban";
import { getModuleMetrics } from "../../utils/calculations";
import { formatDate, statusLabels } from "../../utils/formatters";
import { csvDownload } from "../../utils/export";
import "./records.scss";
export function RecordList({ config, resource, moduleKey }) {
  const { can } = useAuth();
  const [params, setParams] = useSearchParams();
  const query = params.get("q") || "";
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("newest");
  const [view, setView] = useState(config.view);
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const location = useLocation();
  const [toast, setToast] = useState(location.state?.message || "");
  if (resource.loading) return <LoadingSkeleton />;
  if (resource.error)
    return <ErrorState message={resource.error} onRetry={resource.reload} />;
  const items = resource.data || [];
  const normalized = query
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const filtered = items
    .filter(
      (item) =>
        (!status || item.status === status) &&
        (!category || item[config.categoryKey] === category) &&
        [
          item[config.titleKey],
          item.description,
          item.notes,
          item.scientificName,
          item[config.ownerKey],
          item[config.categoryKey],
        ]
          .join(" ")
          .toLocaleLowerCase("es")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .includes(normalized),
    )
    .sort((a, b) =>
      sort === "name"
        ? String(a[config.titleKey]).localeCompare(
            String(b[config.titleKey]),
            "es",
          )
        : String(b[config.dateKey] || "").localeCompare(
            String(a[config.dateKey] || ""),
          ),
    );
  const pageSize = config.view === "list" ? 4 : 6;
  const currentPage = Math.min(
    page,
    Math.max(1, Math.ceil(filtered.length / pageSize)),
  );
  const visible = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const selected =
    filtered.find((item) => item.id === selectedId) || filtered[0];
  const columns = [
    {
      key: config.dateKey,
      label: "Fecha / hora",
      render: (item) => formatDate(item[config.dateKey]),
    },
    {
      key: config.titleKey,
      label: moduleKey === "tourists" ? "Responsable del grupo" : "Registro",
      render: (item) => (
        <Link className="text-link" to={`${config.path}/${item.id}`}>
          {item[config.titleKey]}
        </Link>
      ),
    },
    {
      key: config.categoryKey,
      label: moduleKey === "tourists" ? "Tipo de visita" : "Categoría",
    },
    ...(moduleKey === "tourists"
      ? [
          {
            key: "visitorCount",
            label: "Visitantes",
            render: (item) => `${item.visitorCount || 1} pax`,
          },
          { key: "origin", label: "Procedencia" },
        ]
      : []),
    {
      key: "status",
      label: "Estado",
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: "action",
      label: "Acciones",
      render: (item) => (
        <Link className="btn btn-secondary" to={`${config.path}/${item.id}`}>
          Ver detalle
        </Link>
      ),
    },
  ];
  return (
    <>
      <PageHeader
        title={config.title}
        subtitle={config.subtitle}
        actions={
          <>
            {moduleKey !== "tasks" && can("reports.export") && (
              <a
                className="btn btn-secondary"
                href={csvDownload(filtered, [
                  { key: config.titleKey, label: "Registro" },
                  { key: config.dateKey, label: "Fecha" },
                  { key: "status", label: "Estado" },
                ])}
                download={`${moduleKey}-mock.csv`}
              >
                <Download size={16} />
                Exportar CSV mock
              </a>
            )}
            {can(`${config.permission}.create`) && (
              <Link className="btn btn-primary" to={`${config.path}/new`}>
                <Plus size={16} />
                {config.createTitle}
              </Link>
            )}
          </>
        }
      />
      {moduleKey === "heritage" && (
        <div className="notice">
          Registro técnico de conservación · demostración. Las autorizaciones,
          categorías y protocolos institucionales están por validar.
        </div>
      )}
      <div className="metric-grid">
        {getModuleMetrics(moduleKey, items).map((metric) => (
          <StatCard key={metric.label} {...metric} />
        ))}
      </div>
      <div className="filter-bar">
        <SearchBar
          value={query}
          onChange={(q) => {
            setPage(1);
            setParams(q ? { q } : {}, { replace: true });
          }}
          placeholder={
            moduleKey === "species"
              ? "Buscar por nombre común, científico o categoría…"
              : "Buscar por nombre o descripción…"
          }
        />
        <select
          className="filter-select"
          aria-label="Filtrar por estado"
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
        >
          <option value="">Todos los estados</option>
          {config.states.map((key) => (
            <option key={key} value={key}>
              {statusLabels[key]}
            </option>
          ))}
        </select>
        <select
          className="filter-select"
          aria-label="Filtrar por categoría"
          value={category}
          onChange={(e) => {
            setPage(1);
            setCategory(e.target.value);
          }}
        >
          <option value="">Todas las categorías</option>
          {[
            ...new Set(
              items.map((item) => item[config.categoryKey]).filter(Boolean),
            ),
          ].map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
        <select
          className="filter-select"
          aria-label="Ordenar registros"
          value={sort}
          onChange={(e) => {
            setPage(1);
            setSort(e.target.value);
          }}
        >
          <option value="newest">Fecha más reciente</option>
          <option value="name">Nombre A–Z</option>
        </select>
        {["tasks", "species"].includes(moduleKey) && (
          <SegmentedControl
            label="Vista de registros"
            value={view}
            onChange={setView}
            options={
              moduleKey === "tasks"
                ? [
                    { value: "list", label: "Vista de lista" },
                    { value: "kanban", label: "Vista Kanban" },
                  ]
                : [
                    { value: "grid", label: "Grid visual" },
                    { value: "table", label: "Vista de tabla" },
                  ]
            }
          />
        )}
      </div>
      {!items.length ? (
        <EmptyState
          action={
            can(`${config.permission}.create`) && (
              <Link className="btn btn-primary" to={`${config.path}/new`}>
                {config.createTitle}
              </Link>
            )
          }
        />
      ) : !filtered.length ? (
        <NoResultsState
          query={query}
          action={
            <Button
              onClick={() => {
                setParams({});
                setStatus("");
                setCategory("");
              }}
            >
              Limpiar filtros
            </Button>
          }
        />
      ) : (
        <>
          {view === "kanban" ? (
            <TaskKanban tasks={filtered} config={config} />
          ) : view === "table" ? (
            <Card>
              <DataTable
                columns={columns}
                data={visible}
                caption={config.title}
              />
              <Pagination
                page={currentPage}
                total={filtered.length}
                pageSize={pageSize}
                onChange={setPage}
              />
            </Card>
          ) : moduleKey === "maintenance" ? (
            <div className="content-grid">
              <div className="record-list">
                {visible.map((item) => (
                  <div key={item.id}>
                    <RecordCard config={config} item={item} />
                    <Button
                      variant="ghost"
                      onClick={() => setSelectedId(item.id)}
                    >
                      Ver resumen de {item.title}
                    </Button>
                  </div>
                ))}
              </div>
              <Card title="Ficha técnica">
                <div className="stack">
                  <StatusBadge status={selected.status} />
                  <h2>{selected.title}</h2>
                  <div className="notice">
                    <p>Área afectada: {selected.location || "Por validar"}</p>
                    <p>Responsable: {selected.assignedTo || "Por asignar"}</p>
                    <p>Fecha: {formatDate(selected.date)}</p>
                  </div>
                  <p>
                    {selected.description ||
                      "Consulta el registro para ver o actualizar los detalles del mantenimiento."}
                  </p>
                  {selected.image && (
                    <img
                      className="record-detail__image"
                      src={selected.image}
                      alt="Referencia de mantenimiento de Stitch"
                    />
                  )}
                  <Link
                    className="btn btn-secondary"
                    to={`${config.path}/${selected.id}/edit`}
                  >
                    Editar reporte
                  </Link>
                  <Link
                    className="btn btn-primary"
                    to={`${config.path}/${selected.id}`}
                  >
                    Consultar ficha completa
                  </Link>
                </div>
              </Card>
            </div>
          ) : (
            <div className={view === "grid" ? "card-grid" : "record-list"}>
              {visible.map((item) => (
                <RecordCard config={config} item={item} key={item.id} />
              ))}
            </div>
          )}
          {!["table", "kanban"].includes(view) && (
            <Card>
              <Pagination
                page={currentPage}
                total={filtered.length}
                pageSize={pageSize}
                onChange={setPage}
              />
            </Card>
          )}
        </>
      )}
      <Toast message={toast} onClose={() => setToast("")} />
    </>
  );
}
