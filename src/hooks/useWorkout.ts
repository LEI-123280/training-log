import { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/db';
import type { WorkoutSession, WorkoutSet, RoutineExercise, Exercise } from '@/types';

interface ActiveWorkoutState {
  session: WorkoutSession | null;
  exercises: (Exercise & { sets: WorkoutSet[]; previousSets: WorkoutSet[]; targetSets: number })[];
  elapsedTime: number;
}

export function useWorkout() {
  const [state, setState] = useState<ActiveWorkoutState>({
    session: null,
    exercises: [],
    elapsedTime: 0,
  });

  // Timer for elapsed workout time
  useEffect(() => {
    if (!state.session) return;
    const interval = setInterval(() => {
      setState(prev => ({
        ...prev,
        elapsedTime: Math.floor((Date.now() - prev.session!.startTime.getTime()) / 1000),
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, [state.session]);

  const startWorkout = useCallback(async (routineId?: string) => {
    const sessionId = uuidv4();
    const session: WorkoutSession = {
      id: sessionId,
      routineId,
      startTime: new Date(),
      syncStatus: 'pending_sync',
    };

    await db.workoutSessions.add(session);

    let exercises: (Exercise & { sets: WorkoutSet[]; previousSets: WorkoutSet[]; targetSets: number })[] = [];

    if (routineId) {
      const routineExercises = await db.routineExercises
        .where('routineId')
        .equals(routineId)
        .sortBy('orderIndex');

      for (const re of routineExercises) {
        const exercise = await db.exercises.get(re.exerciseId);
        if (!exercise) continue;

        // Get previous sets for ghost values
        const previousSets = await getPreviousSets(re.exerciseId);

        // Create empty sets based on target
        const sets: WorkoutSet[] = [];
        for (let i = 1; i <= re.targetSets; i++) {
          const prev = previousSets.find(s => s.setNumber === i);
          sets.push({
            id: uuidv4(),
            sessionId,
            exerciseId: re.exerciseId,
            setNumber: i,
            weightKg: 0,
            reps: 0,
            isCompleted: false,
            loggedAt: new Date(),
          });
        }

        exercises.push({
          ...exercise,
          sets,
          previousSets,
          targetSets: re.targetSets,
        });
      }
    }

    setState({ session, exercises, elapsedTime: 0 });
    return sessionId;
  }, []);

  const addExerciseToWorkout = useCallback(async (exerciseId: string, targetSets: number = 3) => {
    const exercise = await db.exercises.get(exerciseId);
    if (!exercise || !state.session) return;

    const previousSets = await getPreviousSets(exerciseId);
    const sets: WorkoutSet[] = [];
    for (let i = 1; i <= targetSets; i++) {
      sets.push({
        id: uuidv4(),
        sessionId: state.session.id,
        exerciseId,
        setNumber: i,
        weightKg: 0,
        reps: 0,
        isCompleted: false,
        loggedAt: new Date(),
      });
    }

    setState(prev => ({
      ...prev,
      exercises: [...prev.exercises, { ...exercise, sets, previousSets, targetSets }],
    }));
  }, [state.session]);

  const addSetToExercise = useCallback(async (exerciseIndex: number) => {
    setState(prev => {
      const exercises = [...prev.exercises];
      const ex = { ...exercises[exerciseIndex] };
      const newSetNumber = ex.sets.length + 1;
      ex.sets = [
        ...ex.sets,
        {
          id: uuidv4(),
          sessionId: prev.session!.id,
          exerciseId: ex.id,
          setNumber: newSetNumber,
          weightKg: 0,
          reps: 0,
          isCompleted: false,
          loggedAt: new Date(),
        },
      ];
      exercises[exerciseIndex] = ex;
      return { ...prev, exercises };
    });
  }, []);

  const updateSet = useCallback((exerciseIndex: number, setIndex: number, updates: Partial<WorkoutSet>) => {
    setState(prev => {
      const exercises = [...prev.exercises];
      const ex = { ...exercises[exerciseIndex] };
      ex.sets = [...ex.sets];
      ex.sets[setIndex] = { ...ex.sets[setIndex], ...updates };
      exercises[exerciseIndex] = ex;
      return { ...prev, exercises };
    });
  }, []);

  const completeSet = useCallback((exerciseIndex: number, setIndex: number, weightKg: number, reps: number) => {
    setState(prev => {
      const exercises = [...prev.exercises];
      const ex = { ...exercises[exerciseIndex] };
      ex.sets = [...ex.sets];
      ex.sets[setIndex] = {
        ...ex.sets[setIndex],
        weightKg,
        reps,
        isCompleted: true,
        loggedAt: new Date(),
      };
      exercises[exerciseIndex] = ex;
      return { ...prev, exercises };
    });
  }, []);

  const uncompleteSet = useCallback((exerciseIndex: number, setIndex: number) => {
    setState(prev => {
      const exercises = [...prev.exercises];
      const ex = { ...exercises[exerciseIndex] };
      ex.sets = [...ex.sets];
      ex.sets[setIndex] = {
        ...ex.sets[setIndex],
        isCompleted: false,
      };
      exercises[exerciseIndex] = ex;
      return { ...prev, exercises };
    });
  }, []);

  const removeExercise = useCallback((exerciseIndex: number) => {
    setState(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== exerciseIndex),
    }));
  }, []);

  const finishWorkout = useCallback(async (notes?: string) => {
    if (!state.session) return null;

    const endTime = new Date();

    // Save all completed sets to IndexedDB
    const completedSets = state.exercises.flatMap(ex =>
      ex.sets.filter(s => s.isCompleted)
    );

    await db.workoutSets.bulkAdd(completedSets);

    // Update session
    await db.workoutSessions.update(state.session.id, {
      endTime,
      notes,
      syncStatus: 'pending_sync',
    });

    const finishedSession = { ...state.session, endTime, notes };

    setState({ session: null, exercises: [], elapsedTime: 0 });

    return finishedSession;
  }, [state.session, state.exercises]);

  const cancelWorkout = useCallback(async () => {
    if (!state.session) return;
    await db.workoutSessions.delete(state.session.id);
    setState({ session: null, exercises: [], elapsedTime: 0 });
  }, [state.session]);

  const isActive = state.session !== null;

  return {
    ...state,
    isActive,
    startWorkout,
    addExerciseToWorkout,
    addSetToExercise,
    updateSet,
    completeSet,
    uncompleteSet,
    removeExercise,
    finishWorkout,
    cancelWorkout,
  };
}

async function getPreviousSets(exerciseId: string): Promise<WorkoutSet[]> {
  // Get the most recent completed sets for this exercise
  const allSets = await db.workoutSets
    .where('exerciseId')
    .equals(exerciseId)
    .reverse()
    .sortBy('loggedAt');

  if (allSets.length === 0) return [];

  // Find the latest session that has this exercise
  const latestSessionId = allSets[0].sessionId;
  return allSets
    .filter(s => s.sessionId === latestSessionId && s.isCompleted)
    .sort((a, b) => a.setNumber - b.setNumber);
}
