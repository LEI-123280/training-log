import { useState, useEffect, useCallback, useMemo } from 'react';
import { db } from '@/db';
import type { WorkoutSet, Exercise, WorkoutSession } from '@/types';
import { startOfWeek, subWeeks, subMonths, format } from 'date-fns';
import { pt } from 'date-fns/locale';

export type TimePeriod = 'current_week' | 'last_4_weeks' | 'last_3_months' | 'all_time';
export type MetricType = 'sets' | 'volume';

export interface TimelineDataPoint {
  date: string;          // "2026-10-29"
  dateLabel: string;     // "29 Out"
  fullDate: string;      // "29 de Outubro"
  totalKg: number;       // total tonnage (kg * reps) on that date
  maxWeightKg: number;   // highest single weight on that date
  setsCount: number;     // number of sets on that date
  exerciseName?: string;
}

export interface MuscleGroupData {
  muscle: string;
  sets: number;
  volume: number;
}

export interface WeeklyData {
  week: string;
  weekLabel: string;
  muscles: MuscleGroupData[];
}

export function useAnalytics() {
  const [period, setPeriod] = useState<TimePeriod>('last_4_weeks');
  const [metric, setMetric] = useState<MetricType>('volume');
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('all');
  const [exercisesList, setExercisesList] = useState<Exercise[]>([]);
  const [timelineData, setTimelineData] = useState<TimelineDataPoint[]>([]);
  const [aggregatedByMuscle, setAggregatedByMuscle] = useState<MuscleGroupData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const allExercises = await db.exercises.orderBy('name').toArray();
      setExercisesList(allExercises);
      const exMap = new Map(allExercises.map(e => [e.id, e]));

      const now = new Date();
      let rangeStart: Date | null = null;

      switch (period) {
        case 'current_week':
          rangeStart = startOfWeek(now, { weekStartsOn: 1 });
          break;
        case 'last_4_weeks':
          rangeStart = startOfWeek(subWeeks(now, 3), { weekStartsOn: 1 });
          break;
        case 'last_3_months':
          rangeStart = startOfWeek(subMonths(now, 3), { weekStartsOn: 1 });
          break;
        case 'all_time':
          rangeStart = null;
          break;
      }

      // Fetch completed sets
      let setsQuery = db.workoutSets.where('loggedAt');
      let allSets: WorkoutSet[] = [];

      if (rangeStart) {
        allSets = await setsQuery.between(rangeStart, now, true, true).toArray();
      } else {
        allSets = await db.workoutSets.toArray();
      }

      const completedSets = allSets.filter(s => s.isCompleted);

      // 1. Calculate Timeline Data (X-axis: Date, Y-axis: Kgs)
      // Filter sets by selected exercise if not 'all'
      const filteredForTimeline = selectedExerciseId === 'all'
        ? completedSets
        : completedSets.filter(s => s.exerciseId === selectedExerciseId);

      const dateMap = new Map<string, WorkoutSet[]>();

      for (const set of filteredForTimeline) {
        const dateObj = new Date(set.loggedAt);
        const dayKey = format(dateObj, 'yyyy-MM-dd');
        const existing = dateMap.get(dayKey) || [];
        existing.push(set);
        dateMap.set(dayKey, existing);
      }

      // Sort dates chronologically
      const sortedDayKeys = Array.from(dateMap.keys()).sort();

      const timelineResult: TimelineDataPoint[] = sortedDayKeys.map(dayKey => {
        const daySets = dateMap.get(dayKey) || [];
        const dateObj = new Date(`${dayKey}T12:00:00`);
        const totalKg = daySets.reduce((sum, s) => sum + (s.weightKg * s.reps), 0);
        const maxWeightKg = daySets.reduce((max, s) => Math.max(max, s.weightKg), 0);

        return {
          date: dayKey,
          dateLabel: format(dateObj, 'dd MMM', { locale: pt }),
          fullDate: format(dateObj, "dd 'de' MMMM", { locale: pt }),
          totalKg: Math.round(totalKg),
          maxWeightKg,
          setsCount: daySets.length,
        };
      });

      setTimelineData(timelineResult);

      // 2. Calculate Muscle Groups Aggregation
      const muscleMap = new Map<string, MuscleGroupData>();
      for (const set of completedSets) {
        const ex = exMap.get(set.exerciseId);
        if (!ex) continue;
        const muscle = ex.targetMuscle;
        const existing = muscleMap.get(muscle) || { muscle, sets: 0, volume: 0 };
        existing.sets += 1;
        existing.volume += (set.weightKg * set.reps);
        muscleMap.set(muscle, existing);
      }

      setAggregatedByMuscle(
        Array.from(muscleMap.values()).sort((a, b) => b.sets - a.sets)
      );

    } catch (e) {
      console.error('Failed to load analytics data:', e);
    } finally {
      setLoading(false);
    }
  }, [period, selectedExerciseId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
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
    refresh: loadData,
  };
}
