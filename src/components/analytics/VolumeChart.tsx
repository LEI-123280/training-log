import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ReferenceLine,
} from 'recharts';
import type { TimelineDataPoint, MuscleGroupData, MetricType } from '@/hooks/useAnalytics';

interface DateKgChartProps {
  data: TimelineDataPoint[];
  mode?: 'total' | 'max';
}

const DateTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const item: TimelineDataPoint = payload[0].payload;
    return (
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl p-3 shadow-2xl text-xs space-y-1">
        <p className="font-bold text-zinc-100 text-sm">{item.fullDate || item.dateLabel}</p>
        <div className="flex items-center justify-between gap-4 pt-1">
          <span className="text-zinc-400">Tonelagem (kg):</span>
          <span className="font-bold text-emerald-400 font-mono">
            {item.totalKg.toLocaleString('pt-PT')} kg
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-zinc-400">Carga Máxima:</span>
          <span className="font-bold text-blue-400 font-mono">{item.maxWeightKg} kg</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-zinc-400">Séries Feitas:</span>
          <span className="font-bold text-zinc-200">{item.setsCount} sets</span>
        </div>
      </div>
    );
  }
  return null;
};

export function DateKgChart({ data, mode = 'total' }: DateKgChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-zinc-500 text-xs text-center p-4">
        <p className="font-semibold text-zinc-400 text-sm">Sem treinos registados neste período</p>
        <p className="mt-1">Regista o teu primeiro treino para veres a curva de progresso das datas e kgs!</p>
      </div>
    );
  }

  const dataKey = mode === 'max' ? 'maxWeightKg' : 'totalKg';

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 5 }}>
          <defs>
            <linearGradient id="kgGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          {/* EIXO X: DATAS */}
          <XAxis
            dataKey="dateLabel"
            stroke="#71717a"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#3f3f46' }}
            dy={5}
          />
          {/* EIXO Y: KGS */}
          <YAxis
            stroke="#71717a"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(1)}t` : `${val}k`)}
            dx={-2}
          />
          <Tooltip content={<DateTooltip />} />
          <Area
            type="monotone"
            dataKey={dataKey}
            name="kg"
            stroke="#10b981"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#kgGradient)"
            dot={{ fill: '#10b981', r: 4, strokeWidth: 2, stroke: '#09090b' }}
            activeDot={{ r: 6, fill: '#34d399', stroke: '#fff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// Muscle Group Bar Chart
interface MuscleChartProps {
  data: MuscleGroupData[];
  metric: MetricType;
}

const MUSCLE_COLORS: Record<string, string> = {
  'Peito': '#ef4444',
  'Costas': '#3b82f6',
  'Ombros': '#f59e0b',
  'Bíceps': '#8b5cf6',
  'Tríceps': '#ec4899',
  'Quadríceps': '#10b981',
  'Isquiotibiais': '#14b8a6',
  'Gémeos': '#06b6d4',
  'Abdominais': '#f97316',
  'Glúteos': '#a855f7',
  'Antebraços': '#6366f1',
  'Trapézio': '#84cc16',
};

const MuscleTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 shadow-xl text-xs">
        <p className="font-semibold text-zinc-100">{label}</p>
        <p className="text-emerald-400 font-bold mt-0.5">
          {data.name === 'sets'
            ? `${data.value} séries`
            : `${data.value.toLocaleString('pt-PT')} kg`}
        </p>
      </div>
    );
  }
  return null;
};

export function MuscleVolumeChart({ data, metric }: MuscleChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-500 text-xs">
        Sem dados de grupos musculares no período
      </div>
    );
  }

  const dataKey = metric === 'sets' ? 'sets' : 'volume';

  return (
    <ResponsiveContainer width="100%" height={Math.max(260, data.length * 42)}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        barCategoryGap="20%"
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
        <XAxis
          type="number"
          stroke="#71717a"
          fontSize={11}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          type="category"
          dataKey="muscle"
          stroke="#71717a"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          width={85}
        />
        <Tooltip content={<MuscleTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
        {metric === 'sets' && (
          <>
            <ReferenceLine x={10} stroke="#3f3f46" strokeDasharray="4 4" />
            <ReferenceLine x={20} stroke="#3f3f46" strokeDasharray="4 4" />
          </>
        )}
        <Bar dataKey={dataKey} name={dataKey} radius={[0, 6, 6, 0]} maxBarSize={28}>
          {data.map((entry, index) => {
            const color = MUSCLE_COLORS[entry.muscle] || '#10b981';
            return <Cell key={`cell-${index}`} fill={color} />;
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
