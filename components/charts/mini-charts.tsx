"use client";

type Point = { x: number; y: number; label: string };

function buildPoints(
  values: number[],
  labels: string[],
  width: number,
  height: number,
  pad = 8,
): Point[] {
  if (values.length === 0) return [];
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);
  const range = max - min || 1;
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;
  return values.map((v, i) => ({
    x: pad + (innerW * (values.length === 1 ? 0.5 : i / (values.length - 1))),
    y: pad + innerH - ((v - min) / range) * innerH,
    label: labels[i] ?? "",
  }));
}

export function MiniLineChart({
  values,
  labels,
  height = 120,
  stroke = "var(--primary)",
}: {
  values: number[];
  labels: string[];
  height?: number;
  stroke?: string;
}) {
  const width = 280;
  const pts = buildPoints(values, labels, width, height);
  if (pts.length === 0) {
    return (
      <p className="text-xs text-muted">No data in this range.</p>
    );
  }
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="text-foreground"
      role="img"
      aria-label="Trend chart"
    >
      <path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={2}
        vectorEffect="non-scaling-stroke"
      />
      {pts.map((p) => (
        <circle key={p.label + p.x} cx={p.x} cy={p.y} r={3} fill={stroke} />
      ))}
    </svg>
  );
}

export function MiniBarChart({
  items,
  valueKey = "value",
  labelKey = "label",
  color = "var(--primary)",
}: {
  items: Array<Record<string, string | number>>;
  valueKey?: string;
  labelKey?: string;
  color?: string;
}) {
  const nums = items.map((i) => Number(i[valueKey]) || 0);
  const max = Math.max(...nums, 1);
  return (
    <div className="space-y-3" role="img" aria-label="Bar comparison chart">
      {items.map((row) => {
        const v = Number(row[valueKey]) || 0;
        const pct = (v / max) * 100;
        const label = String(row[labelKey] ?? "");
        return (
          <div key={label}>
            <div className="mb-1 flex justify-between text-xs text-muted">
              <span className="truncate pr-2">{label}</span>
              <span className="shrink-0 font-medium text-foreground">{v}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-[width] duration-500"
                style={{ width: `${pct}%`, background: color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
