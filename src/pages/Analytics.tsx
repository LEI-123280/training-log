import React from 'react';
import { BarChart3, TrendingUp, Activity, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VolumeChart } from '@/components/analytics/VolumeChart';
import { useAnalytics, type TimePeriod, type MetricType } from '@/hooks/useAnalytics';

export function AnalyticsPage() {
  const { period, setPeriod, metric, setMetric, aggregatedByMuscle, loading } = useAnalytics();

  const totalSets = aggregatedByMuscle.reduce((sum, m) => sum + m.sets, 0);
  const totalVolume = aggregatedByMuscle.reduce((sum, m) => sum + m.volume, 0);
  const activeMuscles = aggregatedByMuscle.filter(m => m.sets > 0).length;

  return (
    <div className="px-4 pb-28 pt-3 max-w-lg mx-auto">
      {/* Summary KPI Cards */}
      <div className="grid grid-cols-3 gap-2.5 mb-4">
        <Card className="p-3 text-center bg-zinc-900 border-zinc-800">
          <p className="text-2xl font-black text-emerald-400 tracking-tight">{totalSets}</p>
          <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider mt-0.5">Séries Totais</p>
        </Card>
        <Card className="p-3 text-center bg-zinc-900 border-zinc-800">
          <p className="text-2xl font-black text-blue-400 tracking-tight">
            {totalVolume >= 1000 ? `${(totalVolume / 1000).toFixed(1)}t` : `${Math.round(totalVolume)}kg`}
          </p>
          <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider mt-0.5">Tonelagem</p>
        </Card>
        <Card className="p-3 text-center bg-zinc-900 border-zinc-800">
          <p className="text-2xl font-black text-amber-400 tracking-tight">{activeMuscles}</p>
          <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider mt-0.5">Músculos</p>
        </Card>
      </div>

      {/* Period Selection */}
      <div className="mb-3">
        <Tabs value={period} onValueChange={(v) => setPeriod(v as TimePeriod)}>
          <TabsList className="bg-zinc-900 border border-zinc-800">
            <TabsTrigger value="current_week">Esta Semana</TabsTrigger>
            <TabsTrigger value="last_4_weeks">4 Semanas</TabsTrigger>
            <TabsTrigger value="last_3_months">3 Meses</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Metric Mode Toggle */}
      <div className="mb-4">
        <Tabs value={metric} onValueChange={(v) => setMetric(v as MetricType)}>
          <TabsList className="bg-zinc-900 border border-zinc-800">
            <TabsTrigger value="sets" className="flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-emerald-400" />
              <span>Séries Efetivas</span>
            </TabsTrigger>
            <TabsTrigger value="volume" className="flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-blue-400" />
              <span>Carga / Tonelagem (kg)</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Volume / Sets Chart Card */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold flex items-center justify-between text-zinc-200">
            <span className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-emerald-400" />
              {metric === 'sets' ? 'Séries por Grupo Muscular' : 'Tonelagem Acumulada (kg)'}
            </span>
            {metric === 'sets' && (
              <span className="text-[11px] font-normal text-zinc-400 flex items-center gap-1">
                <Target className="h-3.5 w-3.5 text-emerald-400" /> Meta: 10-20
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64 text-zinc-500 text-sm">
              A carregar métricas...
            </div>
          ) : (
            <VolumeChart data={aggregatedByMuscle} metric={metric} />
          )}

          {metric === 'sets' && aggregatedByMuscle.length > 0 && (
            <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-zinc-800/80 text-[11px] text-zinc-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-600 inline-block" /> &lt;10 (Manutenção)
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> 10-20 (Ótimo)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> &gt;20 (Elevado)
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Breakdown per muscle */}
      {aggregatedByMuscle.length > 0 && (
        <div className="mt-4 space-y-2">
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Detalhamento Muscular
          </h3>
          <div className="space-y-1.5">
            {aggregatedByMuscle.map(m => {
              const isTargetRange = m.sets >= 10 && m.sets <= 20;
              return (
                <div
                  key={m.muscle}
                  className="flex items-center justify-between bg-zinc-900 border border-zinc-800/80 rounded-xl px-3.5 py-2.5"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-zinc-200">{m.muscle}</span>
                    {metric === 'sets' && isTargetRange && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                        Meta Atingida
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-zinc-100">{m.sets} <span className="text-xs font-normal text-zinc-500">sets</span></span>
                    <span className="text-xs text-zinc-400 font-mono">
                      {Math.round(m.volume).toLocaleString('pt-PT')} kg
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
