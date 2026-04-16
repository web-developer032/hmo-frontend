"use client";

import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Define colors palette
const COLORS = [
  "var(--accent)",
  "var(--accent-mid)",
  "var(--blue)",
  "var(--amber)",
  "var(--green)",
];

interface ChartDataItem {
  [key: string]: string | number;
}

interface BaseChartProps {
  data: ChartDataItem[];
  height?: number;
  className?: string;
}

interface SingleSeriesChartProps extends BaseChartProps {
  dataKey: string;
  color?: string;
  name?: string;
}

interface PieChartProps extends Omit<BaseChartProps, "data"> {
  data: Array<{ name: string; value: number }>;
}

/**
 * Recharts Line Chart Component
 * Displays trend data with optimized performance
 * @example
 * ```tsx
 * <RechartLineChart
 *   data={rentData}
 *   dataKey="amount"
 *   name="Monthly Rent"
 * />
 * ```
 */
export const RechartLineChart = React.memo(
  ({
    data,
    dataKey,
    color = "var(--accent)",
    name = dataKey,
    height = 300,
    className = "",
  }: SingleSeriesChartProps) => {
    const memoizedData = useMemo(() => data, [data]);

    if (!memoizedData || memoizedData.length === 0) {
      return (
        <div
          className={`flex h-[${height}px] items-center justify-center ${className}`}
        >
          <p className="text-sm text-muted">No data available</p>
        </div>
      );
    }

    return (
      <div className={`w-full ${className}`}>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart
            data={memoizedData}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border-design)"
            />
            <XAxis
              dataKey="name"
              stroke="var(--ink-3)"
              style={{ fontSize: "0.75rem" }}
            />
            <YAxis stroke="var(--ink-3)" style={{ fontSize: "0.75rem" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--paper)",
                border: "1px solid var(--border-design)",
                borderRadius: "var(--radius-md)",
              }}
              labelStyle={{ color: "var(--foreground)" }}
            />
            <Legend wrapperStyle={{ paddingTop: "1rem" }} />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              name={name}
              dot={{ fill: color, r: 4 }}
              activeDot={{ r: 6 }}
              strokeWidth={2}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }
);

RechartLineChart.displayName = "RechartLineChart";

/**
 * Recharts Bar Chart Component
 * Displays categorical data with optimized performance
 */
export const RechartBarChart = React.memo(
  ({
    data,
    dataKey,
    color = "var(--accent)",
    name = dataKey,
    height = 300,
    className = "",
  }: SingleSeriesChartProps) => {
    const memoizedData = useMemo(() => data, [data]);

    if (!memoizedData || memoizedData.length === 0) {
      return (
        <div
          className={`flex h-[${height}px] items-center justify-center ${className}`}
        >
          <p className="text-sm text-muted">No data available</p>
        </div>
      );
    }

    return (
      <div className={`w-full ${className}`}>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={memoizedData}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border-design)"
            />
            <XAxis
              dataKey="name"
              stroke="var(--ink-3)"
              style={{ fontSize: "0.75rem" }}
            />
            <YAxis stroke="var(--ink-3)" style={{ fontSize: "0.75rem" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--paper)",
                border: "1px solid var(--border-design)",
                borderRadius: "var(--radius-md)",
              }}
              labelStyle={{ color: "var(--foreground)" }}
            />
            <Legend wrapperStyle={{ paddingTop: "1rem" }} />
            <Bar
              dataKey={dataKey}
              fill={color}
              name={name}
              radius={[8, 8, 0, 0]}
              isAnimationActive={true}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }
);

RechartBarChart.displayName = "RechartBarChart";

/**
 * Recharts Area Chart Component
 * Displays cumulative trend data with gradient fill
 */
export const RechartAreaChart = React.memo(
  ({
    data,
    dataKey,
    color = "var(--accent)",
    name = dataKey,
    height = 300,
    className = "",
  }: SingleSeriesChartProps) => {
    const memoizedData = useMemo(() => data, [data]);

    if (!memoizedData || memoizedData.length === 0) {
      return (
        <div
          className={`flex h-[${height}px] items-center justify-center ${className}`}
        >
          <p className="text-sm text-muted">No data available</p>
        </div>
      );
    }

    return (
      <div className={`w-full ${className}`}>
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart
            data={memoizedData}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <defs>
              <linearGradient
                id={`color-${dataKey}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                <stop offset="95%" stopColor={color} stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border-design)"
            />
            <XAxis
              dataKey="name"
              stroke="var(--ink-3)"
              style={{ fontSize: "0.75rem" }}
            />
            <YAxis stroke="var(--ink-3)" style={{ fontSize: "0.75rem" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--paper)",
                border: "1px solid var(--border-design)",
                borderRadius: "var(--radius-md)",
              }}
              labelStyle={{ color: "var(--foreground)" }}
            />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              fillOpacity={1}
              fill={`url(#color-${dataKey})`}
              name={name}
              isAnimationActive={true}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }
);

RechartAreaChart.displayName = "RechartAreaChart";

/**
 * Recharts Pie Chart Component
 * Displays proportional data distribution
 */
export const RechartPieChart = React.memo(
  ({ data, height = 300, className = "" }: PieChartProps) => {
    const memoizedData = useMemo(() => data, [data]);

    if (!memoizedData || memoizedData.length === 0) {
      return (
        <div
          className={`flex h-[${height}px] items-center justify-center ${className}`}
        >
          <p className="text-sm text-muted">No data available</p>
        </div>
      );
    }

    return (
      <div className={`w-full ${className}`}>
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={memoizedData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              isAnimationActive={true}
            >
              {memoizedData.map((_entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--paper)",
                border: "1px solid var(--border-design)",
                borderRadius: "var(--radius-md)",
              }}
              labelStyle={{ color: "var(--foreground)" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }
);

RechartPieChart.displayName = "RechartPieChart";
