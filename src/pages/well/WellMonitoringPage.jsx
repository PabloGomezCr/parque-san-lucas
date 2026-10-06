import { useAuth } from "../../hooks/useAuth";
import { useState } from "react";
import { Droplet, Waves, Thermometer, FlaskConical, Plus } from "lucide-react";
import { WellChart } from "../../components/well/WellChart";
import { ReadingForm } from "../../components/well/ReadingForm";
import { StatCard } from "../../components/dashboard/StatCard";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Tabs } from "../../components/common/Tabs";
import { Modal, Drawer } from "../../components/common/Modal";
import { DataTable } from "../../components/common/DataTable";
import { StatusBadge } from "../../components/common/StatusBadge";
import { LoadingSkeleton } from "../../components/feedback/LoadingSkeleton";
import { ErrorState } from "../../components/feedback/ErrorState";
import { EmptyState } from "../../components/feedback/EmptyState";
import { NoResultsState } from "../../components/feedback/NoResultsState";
import { useResource } from "../../hooks/useResource";
import { wellService } from "../../services/wellService";
import { getLatestWellReading, getWellTrend } from "../../utils/calculations";
import { formatDate } from "../../utils/formatters";
export function WellMonitoringPage() {
  const { can } = useAuth();
  const resource = useResource(wellService.getReadings);
  const [tab, setTab] = useState("current");
  const [selected, setSelected] = useState(null);
  const [register, setRegister] = useState(false);
  const [date, setDate] = useState("");
  if (resource.loading) return <LoadingSkeleton />;
  if (resource.error)
    return <ErrorState message={resource.error} onRetry={resource.reload} />;
  const readings = resource.data || [];
  const latest = getLatestWellReading(readings);
  const trend = getWellTrend(readings);
  const filtered = [...readings]
    .filter((r) => !date || r.date.slice(0, 10) === date)
    .sort((a, b) => b.date.localeCompare(a.date));
  return (
    <>
      <PageHeader
        title="Monitoreo del Pozo de Agua"
        subtitle="Últimas mediciones y seguimiento hidrológico. Asociación del pozo al parque por validar."
        actions={
          can("well.create") && (
            <Button onClick={() => setRegister(true)}>
              <Plus size={16} />
              Registrar medición manual
            </Button>
          )
        }
      />
      <div className="notice">
        Datos mock · los sensores, umbrales, alertas y enlaces BGAN/VHF están
        por validar.
      </div>
      {latest ? (
        <>
          <div className="metric-grid">
            <StatCard
              label="Caudal de bombeo"
              value={`${latest.flow} L/min`}
              detail="Última lectura manual o simulada"
              icon={Waves}
            />
            <StatCard
              label="Nivel piezométrico"
              value={`${latest.level} m`}
              detail={
                trend === null
                  ? "Sin lectura previa"
                  : `Variación entre lecturas: ${trend > 0 ? "+" : ""}${trend} m`
              }
              icon={Droplet}
            />
            <StatCard
              label="Temperatura"
              value={`${latest.temperature} °C`}
              detail={formatDate(latest.date)}
              icon={Thermometer}
            />
            <StatCard
              label="Potencial de hidrógeno"
              value={latest.ph}
              detail="Sin evaluación de potabilidad"
              icon={FlaskConical}
            />
          </div>
          <Tabs
            value={tab}
            onChange={setTab}
            options={[
              { value: "current", label: "Monitoreo actual" },
              { value: "history", label: "Histórico de lecturas" },
            ]}
          >
            {tab === "current" ? (
              <div className="content-grid">
                <Card title="Telemetría hidrodinámica · mock">
                  <p className="muted">
                    Nivel y caudal de los registros disponibles.
                  </p>
                  <WellChart data={readings} />
                </Card>
                <Card title="Estado de la última lectura">
                  <div className="stack">
                    <StatusBadge status={latest.status} />
                    <div className="well-reading">
                      <small>NIVEL ACTUAL</small>
                      <strong>{latest.level} m</strong>
                      <small>{formatDate(latest.date)}</small>
                    </div>
                    <Button
                      variant="secondary"
                      onClick={() => setSelected(latest)}
                    >
                      Ver lectura seleccionada
                    </Button>
                    <p className="muted">
                      Estado suministrado por el registro de demostración. No
                      activa ni controla hardware.
                    </p>
                  </div>
                </Card>
              </div>
            ) : (
              <div className="filter-bar">
                <label htmlFor="reading-date">Filtrar por fecha</label>
                <input
                  id="reading-date"
                  className="filter-select"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
                <Button variant="secondary" onClick={() => setDate("")}>
                  Limpiar filtro
                </Button>
              </div>
            )}
            <Card
              title={
                tab === "current"
                  ? "Últimas cinco lecturas"
                  : "Histórico de lecturas"
              }
            >
              {filtered.length ? (
                <DataTable
                  caption="Lecturas del pozo"
                  data={
                    tab === "current"
                      ? [...readings]
                          .sort((a, b) => b.date.localeCompare(a.date))
                          .slice(0, 5)
                      : filtered
                  }
                  columns={[
                    {
                      key: "date",
                      label: "Fecha",
                      render: (r) => formatDate(r.date),
                    },
                    { key: "level", label: "Nivel (m)" },
                    { key: "flow", label: "Caudal (L/min)" },
                    { key: "ph", label: "pH" },
                    {
                      key: "status",
                      label: "Estado",
                      render: (r) => <StatusBadge status={r.status} />,
                    },
                    {
                      key: "action",
                      label: "Acción",
                      render: (r) => (
                        <Button variant="ghost" onClick={() => setSelected(r)}>
                          Ver lectura
                        </Button>
                      ),
                    },
                  ]}
                />
              ) : (
                <NoResultsState />
              )}
            </Card>
          </Tabs>
        </>
      ) : (
        <EmptyState
          title="No hay lecturas registradas"
          action={
            can("well.create") && (
              <Button onClick={() => setRegister(true)}>
                Registrar primera lectura
              </Button>
            )
          }
        />
      )}
      <Modal
        open={register}
        title="Registrar medición manual"
        onClose={() => setRegister(false)}
      >
        <ReadingForm
          onSaved={() => {
            setRegister(false);
            resource.reload();
          }}
        />
      </Modal>
      <Drawer
        open={Boolean(selected)}
        title="Detalle de lectura hidrogeológica"
        onClose={() => setSelected(null)}
      >
        {selected && (
          <>
            <StatusBadge status={selected.status} />
            <dl className="record-details">
              {[
                ["Fecha", formatDate(selected.date)],
                ["Nivel", `${selected.level} m`],
                ["Caudal", `${selected.flow} L/min`],
                ["Temperatura", `${selected.temperature} °C`],
                ["pH", selected.ph],
                ["Notas", selected.notes || "Sin notas"],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <p className="notice">
              Fuente: {selected.source || "Datos de demostración"}. Sensores y
              umbrales por validar.
            </p>
          </>
        )}
      </Drawer>
    </>
  );
}
