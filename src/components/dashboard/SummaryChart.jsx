import { chartColors } from "../../config/chartColors";
import {
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import "./charts.scss";
export function SummaryChart({
  data,
  kind = "bar",
  label = "Resumen",
  dataKey = "value",
  nameKey = "name",
  color = chartColors.monitoring,
}) {
  return (
    <div
      className="chart-frame"
      role="img"
      aria-label={`${label}: ${data.map((item) => `${item[nameKey]} ${item[dataKey]}`).join(", ")}`}
    >
      <ResponsiveContainer width="100%" height="100%">
        {kind === "area" ? (
          <AreaChart
            data={data}
            margin={{ top: 15, right: 20, left: -20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey={nameKey} stroke="var(--muted)" />
            <YAxis stroke="var(--muted)" allowDecimals={false} />
            <Tooltip
              contentStyle={{
                background: "var(--surface)",
                color: "var(--text-primary)",
                borderColor: "var(--border)",
              }}
            />
            <Area
              name={label}
              type="monotone"
              dataKey={dataKey}
              fill={color}
              fillOpacity={0.12}
              stroke={color}
              strokeWidth={2}
              isAnimationActive={false}
            />
          </AreaChart>
        ) : (
          <BarChart
            data={data}
            margin={{ top: 15, right: 20, left: -20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey={nameKey} stroke="var(--muted)" />
            <YAxis stroke="var(--muted)" allowDecimals={false} />
            <Tooltip
              contentStyle={{
                background: "var(--surface)",
                color: "var(--text-primary)",
                borderColor: "var(--border)",
              }}
            />
            <Bar
              name={label}
              dataKey={dataKey}
              fill={color}
              radius={[6, 6, 0, 0]}
              isAnimationActive={false}
            >
              {data.map((item, index) => (
                <Cell key={index} fill={chartColors[item.module] || color} />
              ))}
            </Bar>
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
