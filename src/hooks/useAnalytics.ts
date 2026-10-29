import { useState, useEffect, useCallback, useMemo } from 'react';
import { db } from '@/db';
import type { WorkoutSet, Exercise } from '@/types';
import { startOfWeek, endOfWeek, subWeeks, subMonths, isWithinInterval, format } from 'date-fns';
import { pt } from 'date-fns/locale';

export type TimePeriod = 'current_week' | 'last_4_weeks' | 'last_3_months';
export type MetricType = 'sets' | 'volume';

interface MuscleGroupData {
  muscle: string;
  sets: number;
  volume: number;
}

interface WeeklyData {
  week: string;
  weekLabel: string;
  muscles: MuscleGroupData[];
}

export function useAnalytics() {
  const [period, setPeriod] = useState<TimePeriod>('current_week');
  const [metric, setMetric] = useState<MetricType>('sets');
  const [data, setData] = useState<WeeklyData[]>([]);
  const [exerciseMap, setExerciseMap] = useState<Map<string, Exercise>>(new Map());
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Load exercises for muscle group mapping
      const exercises = await db.exercises.toArray();
      const exMap = new Map(exercises.map(e => [e.id, e]));
      setExerciseMap(exMap);

      // Determine date range
      const now = new Date();
      let rangeStart: Date;

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
      }

      // Load all completed sets in range
      const allSets = await db.workoutSets
        .where('loggedAt')
        .between(rangeStart, now, true, true)
        .toArray();

      const completedSets = allSets.filter(s => s.isCompleted);

      // Group by week
      const weeklyMap = new Map<string, WorkoutSet[]>();

      // Generate all weeks in range
      let weekStart = startOfWeek(rangeStart, { weekStartsOn: 1 });
      while (weekStart <= now) {
        const weekKey = format(weekStart, 'yyyy-MM-dd');
        weeklyMap.set(weekKey, []);
        weekStart = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
      }

      // Assign sets to weeks
      for (const set of completedSets) {
        const setDate = new Date(set.loggedAt);
        const weekKey = format(startOfWeek(setDate, { weekStartsOn: 1 }), 'yyyy-MM-dd');
        const existing = weeklyMap.get(weekKey) || [];
        existing.push(set);
        weeklyMap.set(weekKey, existing);
      }

      // Build weekly data
      const result: WeeklyData[] = [];

      for (const [weekKey, sets] of weeklyMap) {
        const weekDate = new Date(weekKey);
        const weekLabel = format(weekDate, "dd MMM", { locale: pt });

        // Group by muscle
        const muscleMap = new Map<string, MuscleGroupData>();

        for (const set of sets) {
          const exercise = exMap.get(set.exerciseId);
          if (!exercise) continue;

          const muscle = exercise.targetMuscle;
          const existing = muscleMap.get(muscle) || { muscle, sets: 0, volume: 0 };
          existing.sets += 1;
          existing.volume += set.weightKg * set.reps;
          muscleMap.set(muscle, existing);
        }

        result.push({
          week: weekKey,
          weekLabel,
          muscles: Array.from(muscleMap.values()).sort((a, b) => b.sets - a.sets),
        });
      }

      result.sort((a, b) => a.week.localeCompare(b.week));
      setData(result);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Aggregate data for current period (for the bar chart)
  const aggregatedByMuscle = useMemo(() => {
    const muscleMap = new Map<string, MuscleGroupData>();

    for (const week of data) {
      for (const m of week.muscles) {
        const existing = muscleMap.get(m.muscle) || { muscle: m.muscle, sets: 0, volume: 0 };
        existing.sets += m.sets;
        existing.volume += m.volume;
        muscleMap.set(m.muscle, existing);
      }
    }

    return Array.from(muscleMap.values()).sort((a, b) => b.sets - a.sets);
  }, [data]);

  return {
    period,
    setPeriod,
    metric,
    setMetric,
    data,
    aggregatedByMuscle,
    loading,
    refresh: loadData,
  };
}
