import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import type { MetricType } from '@/hooks/useAnalytics';

interface MuscleGroupData {
  muscle: string;
  sets: number;
  volume: number;
}

interface VolumeChartProps {
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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 shadow-xl">
        <p className="text-sm font-medium text-zinc-50">{label}</p>
        <p className="text-sm text-zinc-300">
          {data.name === 'sets' 
            ? `${data.value} séries` 
            : `${data.value.toLocaleString('pt-PT')} kg`}
        </p>
      </div>
    );
  }
  return null;
};

export function VolumeChart({ data, metric }: VolumeChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-500 text-sm">
        Sem dados para o período selecionado
      </div>
    );
  }

  const dataKey = metric === 'sets' ? 'sets' : 'volume';

  return (
    <ResponsiveContainer width="100%" height={Math.max(280, data.length * 48)}>
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
          fontSize={12}
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
          width={90}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
        
        {/* Hypertrophy reference lines for sets metric (10-20 sets target) */}
        {metric === 'sets' && (
          <>
            <ReferenceLine x={10} stroke="#3f3f46" strokeDasharray="4 4" label={{ value: '10', position: 'top', fill: '#52525b', fontSize: 10 }} />
            <ReferenceLine x={20} stroke="#3f3f46" strokeDasharray="4 4" label={{ value: '20', position: 'top', fill: '#52525b', fontSize: 10 }} />
          </>
        )}

        <Bar
          dataKey={dataKey}
          name={dataKey}
          radius={[0, 6, 6, 0]}
          maxBarSize={32}
        >
          {data.map((entry, index) => {
            const color = MUSCLE_COLORS[entry.muscle] || '#10b981';
            const isInRange = metric === 'sets' && entry.sets >= 10 && entry.sets <= 20;
            const isOver = metric === 'sets' && entry.sets > 20;
            return (
              <Cell
                key={`cell-${index}`}
                fill={isOver ? '#ef4444' : isInRange ? color : `${color}80`}
              />
            );
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
