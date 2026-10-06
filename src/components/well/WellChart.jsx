import { chartColors } from "../../config/chartColors";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import "../dashboard/charts.scss";
export function WellChart({ data }) {
  return (
    <div
      className="chart-frame chart-frame--large"
      role="img"
      aria-label="Histórico de nivel en metros y caudal en litros por minuto; valores disponibles en la tabla de lecturas"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={[...data].sort((a, b) => a.date.localeCompare(b.date))}
          margin={{ top: 20, right: 10, left: -20, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="date"
            stroke="var(--muted)"
            tickFormatter={(date) => date.slice(5, 10)}
          />
          <YAxis yAxisId="level" stroke={chartColors.species} />
          <YAxis
            yAxisId="flow"
            orientation="right"
            stroke={chartColors.wellReadings}
          />
          <Tooltip
            contentStyle={{
              background: "var(--surface)",
              color: "var(--text-primary)",
              borderColor: "var(--border)",
            }}
          />
          <Legend />
          <Line
            yAxisId="level"
            name="Nivel (m)"
            type="monotone"
            dataKey="level"
            stroke={chartColors.species}
            strokeWidth={2}
            isAnimationActive={false}
          />
          <Line
            yAxisId="flow"
            name="Caudal (L/min)"
            type="monotone"
            dataKey="flow"
            stroke={chartColors.wellReadings}
            strokeWidth={2}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
