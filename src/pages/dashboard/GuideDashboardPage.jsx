import { WeatherSummaryCard } from "../../components/weather/WeatherSummaryCard";
import { useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useMutation } from "../../hooks/useMutation";
import { useResource } from "../../hooks/useResource";
import { Button } from "../../components/common/Button";
import { Card } from "../../components/common/Card";
import { DataTable } from "../../components/common/DataTable";
import { EmptyState } from "../../components/feedback/EmptyState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { LoadingSkeleton } from "../../components/feedback/LoadingSkeleton";
import { FormField } from "../../components/forms/FormField";
import { PageHeader } from "../../components/layout/PageHeader";
import { incidentService } from "../../services/incidentService";
import { parkInfoService } from "../../services/parkInfoService";
import { tourService } from "../../services/tourService";
import { visitorGroupService } from "../../services/visitorGroupService";

const loadGuideData = async () => {
  const [tours, groups, incidents, parkInfo, routes] = await Promise.all([
    tourService.getTours(),
    visitorGroupService.getGroups(),
    incidentService.getOwnIncidents(),
    parkInfoService.getParkInfo(),
    tourService.getRoutes(),
  ]);
  return { tours, groups, incidents, parkInfo, routes };
};

const today = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const tourStatusLabels = {
  scheduled: "Programado",
  in_progress: "En curso",
  completed: "Completado",
  cancelled: "Cancelado",
};

const sectionCopy = {
  home: ["Inicio del guía", "Orientación, recorridos y asistencia a visitantes."],
  tours: ["Mis recorridos", "Programa y actualiza tus recorridos del parque."],
  visitors: ["Visitantes", "Registra grupos con datos mínimos para la atención."],
  incidents: ["Reportar incidencia", "Envía un reporte para revisión del equipo del parque."],
  info: ["Información del parque", "Consulta rutas y datos generales para orientar visitantes."],
};

export function GuideDashboardPage({ section = "home" }) {
  const { user, can } = useAuth();
  const resource = useResource(loadGuideData, user?.id);
  const tourMutation = useMutation(tourService.createTour);
  const statusMutation = useMutation(tourService.updateTour);
  const groupMutation = useMutation(visitorGroupService.createGroup);
  const incidentMutation = useMutation(incidentService.createIncident);
  const [tourForm, setTourForm] = useState({
    date: today(),
    startTime: "09:00",
    endTime: "11:00",
    routeId: "",
    groupId: "",
    status: "scheduled",
    notes: "",
  });
  const [groupForm, setGroupForm] = useState({
    quantity: "1",
    origin: "",
    language: "Español",
    groupType: "Familia",
    date: today(),
    time: "09:00",
    observations: "",
  });
  const [incidentForm, setIncidentForm] = useState({
    category: "visitor_assistance",
    title: "",
    description: "",
    location: "",
  });

  if (resource.loading) return <LoadingSkeleton rows={5} />;
  if (resource.error)
    return <ErrorState message={resource.error} onRetry={resource.reload} />;

  const { tours, groups, incidents, parkInfo, routes } = resource.data;
  const copy = sectionCopy[section] || sectionCopy.home;
  const todayTours = tours.filter((tour) => tour.date === today());
  const upcomingTours = tours
    .filter((tour) => tour.date > today() && tour.status === "scheduled")
    .sort((first, second) => first.date.localeCompare(second.date));
  const totalVisitors = groups.reduce(
    (total, group) => total + Number(group.quantity || 0),
    0,
  );
  const routeName = (routeId) =>
    routes.find((route) => String(route.id) === String(routeId))?.name ||
    "Ruta no disponible";
  const reloadAfter = async (mutation, ...args) => {
    const result = await mutation.run(...args);
    if (result) resource.reload();
    return result;
  };

  return (
    <>
      <PageHeader title={copy[0]} subtitle={copy[1]} />
      {section === "home" && <WeatherSummaryCard />}
      {section === "home" && (
        <>
          <div className="metric-grid">
            <GuideMetric label="Recorridos de hoy" value={todayTours.length} />
            <GuideMetric label="Próximos recorridos" value={upcomingTours.length} />
            <GuideMetric label="Grupos registrados" value={groups.length} />
            <GuideMetric label="Visitantes atendidos" value={totalVisitors} />
          </div>
          <div className="content-grid">
            <div className="stack">
              <Card title="Recorridos de hoy">
                {todayTours.length ? (
                  <DataTable
                    caption="Recorridos del día de hoy"
                    data={todayTours}
                    columns={[
                      { key: "startTime", label: "Hora", render: (tour) => `${tour.startTime}–${tour.endTime}` },
                      { key: "routeId", label: "Recorrido", render: (tour) => routeName(tour.routeId) },
                      { key: "status", label: "Estado", render: (tour) => tourStatusLabels[tour.status] },
                    ]}
                  />
                ) : (
                  <p className="muted">No tienes recorridos programados para hoy.</p>
                )}
                <Link className="text-link" to="/tours">Ver mis recorridos</Link>
              </Card>
              <Card title="Próximos recorridos">
                {upcomingTours.length ? (
                  <ul>
                    {upcomingTours.slice(0, 4).map((tour) => (
                      <li key={tour.id}>
                        {tour.date} · {tour.startTime} · {routeName(tour.routeId)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="muted">No hay próximos recorridos programados.</p>
                )}
              </Card>
              <Card title="Incidencias reportadas">
                {incidents.length ? (
                  <ul>
                    {incidents.slice(-3).reverse().map((incident) => (
                      <li key={incident.id}>{incident.title} · {incident.status}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="muted">Aún no has enviado reportes.</p>
                )}
                <Link className="text-link" to="/incidents">Ver y reportar incidencias</Link>
              </Card>
            </div>
            <aside className="stack">
              <Card title="Información del parque">
                <p><strong>{parkInfo.park.name}</strong></p>
                <p className="muted">{parkInfo.park.type} · {parkInfo.park.country}</p>
                <p>{routes.length} recorridos disponibles</p>
                <Link className="text-link" to="/park-info">Consultar rutas e información</Link>
              </Card>
              <Card title="Avisos">
                <p>Confirma las condiciones del recorrido antes de salir y reporta cualquier riesgo observado.</p>
                <p className="muted">Los avisos oficiales requieren validación institucional.</p>
              </Card>
              <Card title="Chat grupal del parque">
                <p>Coordina asistencia y comparte información con el equipo del mismo parque.</p>
                <Link className="btn btn-secondary" to="/chat"><MessageCircle size={16} /> Abrir chat grupal</Link>
              </Card>
              <Card title="Apoyo interpretativo">
                <div className="stack">
                  {can("species.view") && <Link className="text-link" to="/species">Consultar especies</Link>}
                  {can("heritage.view") && <Link className="text-link" to="/heritage">Consultar patrimonio</Link>}
                </div>
              </Card>
            </aside>
          </div>
        </>
      )}

      {section === "tours" && (
        <div className="content-grid">
          <Card title="Programar recorrido · propuesta funcional">
            <form className="stack" onSubmit={async (event) => {
              event.preventDefault();
              if (await reloadAfter(tourMutation, tourForm))
                setTourForm({ ...tourForm, routeId: "", groupId: "", notes: "" });
            }}>
              <div className="form-grid">
                <FormField label="Fecha" required><input type="date" value={tourForm.date} onChange={(event) => setTourForm({ ...tourForm, date: event.target.value })} required /></FormField>
                <FormField label="Recorrido" required><select value={tourForm.routeId} onChange={(event) => setTourForm({ ...tourForm, routeId: event.target.value })} required><option value="">Selecciona una ruta</option>{routes.map((route) => <option key={route.id} value={route.id}>{route.name}</option>)}</select></FormField>
                <FormField label="Hora de inicio" required><input type="time" value={tourForm.startTime} onChange={(event) => setTourForm({ ...tourForm, startTime: event.target.value })} required /></FormField>
                <FormField label="Hora de finalización" required><input type="time" value={tourForm.endTime} onChange={(event) => setTourForm({ ...tourForm, endTime: event.target.value })} required /></FormField>
                <FormField label="Grupo"><select value={tourForm.groupId} onChange={(event) => setTourForm({ ...tourForm, groupId: event.target.value })}><option value="">Sin grupo asociado</option>{groups.map((group) => <option key={group.id} value={group.id}>{group.date} · {group.quantity} visitantes · {group.groupType}</option>)}</select></FormField>
                <FormField label="Estado"><select value={tourForm.status} onChange={(event) => setTourForm({ ...tourForm, status: event.target.value })}>{Object.entries(tourStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></FormField>
              </div>
              <FormField label="Notas"><textarea maxLength={500} value={tourForm.notes} onChange={(event) => setTourForm({ ...tourForm, notes: event.target.value })} /></FormField>
              {tourMutation.error && <p role="alert">{tourMutation.error}</p>}
              <Button type="submit" disabled={tourMutation.busy || !routes.length}>Guardar recorrido</Button>
            </form>
          </Card>
          <Card title="Mis recorridos">
            {tours.length ? <DataTable caption="Recorridos propios" data={tours} columns={[
              { key: "date", label: "Fecha" },
              { key: "time", label: "Horario", render: (tour) => `${tour.startTime}–${tour.endTime}` },
              { key: "routeId", label: "Ruta", render: (tour) => routeName(tour.routeId) },
              { key: "status", label: "Estado", render: (tour) => can("tour.update_own") ? <select aria-label={`Estado de ${routeName(tour.routeId)} ${tour.date}`} value={tour.status} disabled={statusMutation.busy} onChange={(event) => reloadAfter(statusMutation, tour.id, { status: event.target.value })}>{Object.entries(tourStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select> : tourStatusLabels[tour.status] },
            ]} /> : <EmptyState title="Todavía no tienes recorridos" />}
            {statusMutation.error && <p role="alert">{statusMutation.error}</p>}
          </Card>
        </div>
      )}

      {section === "visitors" && (
        <div className="content-grid">
          <Card title="Registrar grupo">
            <form className="stack" onSubmit={async (event) => {
              event.preventDefault();
              if (await reloadAfter(groupMutation, groupForm))
                setGroupForm({ ...groupForm, quantity: "1", origin: "", observations: "" });
            }}>
              <div className="form-grid">
                <FormField label="Cantidad de visitantes" required><input type="number" min="1" step="1" value={groupForm.quantity} onChange={(event) => setGroupForm({ ...groupForm, quantity: event.target.value })} required /></FormField>
                <FormField label="Procedencia" required><input value={groupForm.origin} maxLength={80} onChange={(event) => setGroupForm({ ...groupForm, origin: event.target.value })} required /></FormField>
                <FormField label="Idioma" required><input value={groupForm.language} maxLength={40} onChange={(event) => setGroupForm({ ...groupForm, language: event.target.value })} required /></FormField>
                <FormField label="Tipo de grupo" required><select value={groupForm.groupType} onChange={(event) => setGroupForm({ ...groupForm, groupType: event.target.value })}><option>Familia</option><option>Educativo</option><option>Organizado</option><option>Otro</option></select></FormField>
                <FormField label="Fecha" required><input type="date" value={groupForm.date} onChange={(event) => setGroupForm({ ...groupForm, date: event.target.value })} required /></FormField>
                <FormField label="Hora" required><input type="time" value={groupForm.time} onChange={(event) => setGroupForm({ ...groupForm, time: event.target.value })} required /></FormField>
              </div>
              <FormField label="Observaciones" hint="No incluyas nombres ni información personal."><textarea maxLength={300} value={groupForm.observations} onChange={(event) => setGroupForm({ ...groupForm, observations: event.target.value })} /></FormField>
              {groupMutation.error && <p role="alert">{groupMutation.error}</p>}
              <Button type="submit" disabled={groupMutation.busy}>Registrar grupo</Button>
            </form>
          </Card>
          <Card title="Grupos registrados">
            {groups.length ? <DataTable caption="Grupos atendidos por la persona guía" data={groups} columns={[
              { key: "date", label: "Fecha y hora", render: (group) => `${group.date} · ${group.time}` },
              { key: "quantity", label: "Visitantes" },
              { key: "origin", label: "Procedencia" },
              { key: "groupType", label: "Grupo" },
            ]} /> : <EmptyState title="Todavía no has registrado grupos" />}
          </Card>
        </div>
      )}

      {section === "incidents" && (
        <div className="content-grid">
          <Card title="Nuevo reporte">
            <form className="stack" onSubmit={async (event) => {
              event.preventDefault();
              if (await reloadAfter(incidentMutation, incidentForm))
                setIncidentForm({ ...incidentForm, title: "", description: "", location: "" });
            }}>
              <FormField label="Tipo de situación" required><select value={incidentForm.category} onChange={(event) => setIncidentForm({ ...incidentForm, category: event.target.value })}><option value="visitor_assistance">Visitante requiere asistencia</option><option value="trail_condition">Sendero observado en mal estado</option><option value="damaged_signage">Señalización dañada</option><option value="operational">Situación operativa</option><option value="lost_property">Objeto perdido</option></select></FormField>
              <FormField label="Título" required><input value={incidentForm.title} maxLength={120} onChange={(event) => setIncidentForm({ ...incidentForm, title: event.target.value })} required /></FormField>
              <FormField label="Descripción" required><textarea value={incidentForm.description} maxLength={1500} onChange={(event) => setIncidentForm({ ...incidentForm, description: event.target.value })} required /></FormField>
              <FormField label="Ubicación" hint="Describe el sector; no registres datos personales."><input value={incidentForm.location} maxLength={120} onChange={(event) => setIncidentForm({ ...incidentForm, location: event.target.value })} /></FormField>
              {incidentMutation.error && <p role="alert">{incidentMutation.error}</p>}
              <Button type="submit" disabled={incidentMutation.busy}>Enviar reporte</Button>
              <p className="notice">El reporte se envía al equipo para revisión. No asigna mantenimiento ni crea tareas automáticamente.</p>
            </form>
          </Card>
          <Card title="Mis reportes">
            {incidents.length ? <DataTable caption="Incidencias enviadas por el guía" data={incidents} columns={[
              { key: "title", label: "Reporte" },
              { key: "location", label: "Ubicación" },
              { key: "reportedAt", label: "Enviado", render: (incident) => new Date(incident.reportedAt).toLocaleString("es-CR") },
              { key: "status", label: "Estado" },
            ]} /> : <EmptyState title="No hay reportes propios" />}
          </Card>
        </div>
      )}

      {section === "info" && (
        <div className="content-grid">
          <Card title={parkInfo.park.name}>
            <dl className="record-details">
              <div><dt>Tipo</dt><dd>{parkInfo.park.type || "Por validar"}</dd></div>
              <div><dt>País</dt><dd>{parkInfo.park.country || "Por validar"}</dd></div>
              <div><dt>Región</dt><dd>{parkInfo.park.region || "Por validar"}</dd></div>
              <div><dt>Estado</dt><dd>{parkInfo.park.status || "Por validar"}</dd></div>
            </dl>
            <p className="notice">Confirma horarios, condiciones y protocolos vigentes con la administración del parque antes de orientar a visitantes.</p>
          </Card>
          <Card title="Rutas disponibles">
            {routes.length ? <DataTable caption="Rutas autorizadas para consulta" data={routes} columns={[
              { key: "name", label: "Ruta" },
              { key: "difficulty", label: "Dificultad", render: (route) => route.difficulty || "Por validar" },
              { key: "duration", label: "Duración", render: (route) => route.duration || "Por validar" },
              { key: "description", label: "Descripción", render: (route) => route.description || "Información por validar" },
            ]} /> : <EmptyState title="No hay rutas publicadas" />}
          </Card>
        </div>
      )}
    </>
  );
}

function GuideMetric({ label, value }) {
  return (
    <Card className="guide-metric">
      <span className="eyebrow">{label}</span>
      <strong>{value}</strong>
    </Card>
  );
}