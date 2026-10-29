import React, { useState } from 'react';
import { BarChart3, TrendingUp, Activity, Calendar, Filter, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select } from '@/components/ui/select';
import { DateKgChart, MuscleVolumeChart } from '@/components/analytics/VolumeChart';
import { useAnalytics, type TimePeriod, type MetricType } from '@/hooks/useAnalytics';

export function AnalyticsPage() {
  const {
    period,
    setPeriod,
    metric,
    setMetric,
    selectedExerciseId,
    setSelectedExerciseId,
    exercisesList,
    timelineData,
    aggregatedByMuscle,
    loading,
  } = useAnalytics();

  const [chartView, setChartView] = useState<'timeline' | 'muscle'>('timeline');
  const [timelineMode, setTimelineMode] = useState<'total' | 'max'>('total');

  const totalKgAccumulated = timelineData.reduce((sum, d) => sum + d.totalKg, 0);
  const maxRecordedKg = timelineData.reduce((max, d) => Math.max(max, d.maxWeightKg), 0);
  const totalSetsDone = timelineData.reduce((sum, d) => sum + d.setsCount, 0);

  return (
    <div className="px-4 pb-28 pt-3 max-w-lg mx-auto">
      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-2.5 mb-4">
        <Card className="p-3 text-center bg-zinc-900 border-zinc-800">
          <p className="text-xl font-black text-emerald-400 tracking-tight font-mono">
            {totalKgAccumulated >= 1000
              ? `${(totalKgAccumulated / 1000).toFixed(1)}t`
              : `${Math.round(totalKgAccumulated)}kg`}
          </p>
          <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider mt-0.5">
            Carga Total
          </p>
        </Card>
        <Card className="p-3 text-center bg-zinc-900 border-zinc-800">
          <p className="text-xl font-black text-blue-400 tracking-tight font-mono">
            {maxRecordedKg}kg
          </p>
          <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider mt-0.5">
            Carga Máx.
          </p>
        </Card>
        <Card className="p-3 text-center bg-zinc-900 border-zinc-800">
          <p className="text-xl font-black text-amber-400 tracking-tight font-mono">
            {totalSetsDone}
          </p>
          <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider mt-0.5">
            Séries
          </p>
        </Card>
      </div>

      {/* Period Tabs */}
      <div className="mb-3">
        <Tabs value={period} onValueChange={v => setPeriod(v as TimePeriod)}>
          <TabsList className="bg-zinc-900 border border-zinc-800">
            <TabsTrigger value="current_week">Esta Semana</TabsTrigger>
            <TabsTrigger value="last_4_weeks">4 Semanas</TabsTrigger>
            <TabsTrigger value="last_3_months">3 Meses</TabsTrigger>
            <TabsTrigger value="all_time">Tudo</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* View Switch: Datas vs Kgs vs Grupo Muscular */}
      <div className="mb-3">
        <Tabs value={chartView} onValueChange={v => setChartView(v as 'timeline' | 'muscle')}>
          <TabsList className="bg-zinc-900 border border-zinc-800">
            <TabsTrigger value="timeline" className="flex items-center gap-1.5 font-bold">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
              <span>Progresso (Datas vs Kgs)</span>
            </TabsTrigger>
            <TabsTrigger value="muscle" className="flex items-center gap-1.5 font-bold">
              <BarChart3 className="h-3.5 w-3.5 text-blue-400" />
              <span>Por Músculo</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* TIMELINE VIEW (Datas no eixo X, Kgs no eixo Y) */}
      {chartView === 'timeline' && (
        <Card className="bg-zinc-900 border-zinc-800 shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-zinc-200">
                  <Calendar className="h-4 w-4 text-emerald-400" />
                  Evolução por Data
                </CardTitle>

                {/* Sub-toggle: Tonelagem vs Carga Máxima */}
                <div className="flex bg-zinc-950 rounded-lg p-0.5 border border-zinc-800 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setTimelineMode('total')}
                    className={`px-2 py-1 rounded-md font-semibold transition-all ${
                      timelineMode === 'total'
                        ? 'bg-emerald-600 text-white'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Tonelagem (kg)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimelineMode('max')}
                    className={`px-2 py-1 rounded-md font-semibold transition-all ${
                      timelineMode === 'max'
                        ? 'bg-emerald-600 text-white'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Carga Máx (kg)
                  </button>
                </div>
              </div>

              {/* Filter by Exercise */}
              <div className="flex items-center gap-2 pt-1">
                <Filter className="h-3.5 w-3.5 text-zinc-500 flex-shrink-0" />
                <Select
                  value={selectedExerciseId}
                  onChange={e => setSelectedExerciseId(e.target.value)}
                  className="h-9 text-xs py-1 bg-zinc-950 border-zinc-800"
                  options={[
                    { value: 'all', label: 'Todos os Exercícios (Volume Geral)' },
                    ...exercisesList.map(ex => ({ value: ex.id, label: ex.name })),
                  ]}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-2">
            {loading ? (
              <div className="flex items-center justify-center h-64 text-zinc-500 text-sm">
                A carregar gráfico...
              </div>
            ) : (
              <>
                <DateKgChart data={timelineData} mode={timelineMode} />
                <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-2 border-t border-zinc-800/80 px-1">
                  <span>Eixo X: <strong>Datas dos Treinos</strong></span>
                  <span>Eixo Y: <strong>{timelineMode === 'total' ? 'Quilos Acumulados' : 'Carga Máxima (kg)'}</strong></span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* MUSCLE GROUP VIEW */}
      {chartView === 'muscle' && (
        <Card className="bg-zinc-900 border-zinc-800 shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-zinc-200">
                <BarChart3 className="h-4 w-4 text-emerald-400" />
                Volume por Grupo Muscular
              </CardTitle>

              {/* Toggle Sets vs Volume */}
              <div className="flex bg-zinc-950 rounded-lg p-0.5 border border-zinc-800 text-[11px]">
                <button
                  type="button"
                  onClick={() => setMetric('sets')}
                  className={`px-2 py-1 rounded-md font-semibold transition-all ${
                    metric === 'sets'
                      ? 'bg-emerald-600 text-white'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Séries
                </button>
                <button
                  type="button"
                  onClick={() => setMetric('volume')}
                  className={`px-2 py-1 rounded-md font-semibold transition-all ${
                    metric === 'volume'
                      ? 'bg-emerald-600 text-white'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Tonelagem (kg)
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            {loading ? (
              <div className="flex items-center justify-center h-64 text-zinc-500 text-sm">
                A carregar métricas...
              </div>
            ) : (
              <MuscleVolumeChart data={aggregatedByMuscle} metric={metric} />
            )}
          </CardContent>
        </Card>
      )}

      {/* Breakdown per muscle details list */}
      {aggregatedByMuscle.length > 0 && (
        <div className="mt-4 space-y-2">
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Detalhamento Muscular
          </h3>
          <div className="space-y-1.5">
            {aggregatedByMuscle.map(m => (
              <div
                key={m.muscle}
                className="flex items-center justify-between bg-zinc-900 border border-zinc-800/80 rounded-xl px-3.5 py-2.5"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-zinc-200">{m.muscle}</span>
                  {m.sets >= 10 && m.sets <= 20 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                      Meta 10-20
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-zinc-100">
                    {m.sets} <span className="text-xs font-normal text-zinc-500">sets</span>
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">
                    {Math.round(m.volume).toLocaleString('pt-PT')} kg
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
