import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/db';
import type { WorkoutSession, WorkoutSet, Exercise } from '@/types';

export interface WorkoutExercise extends Exercise {
  sets: WorkoutSet[];
  previousSets: WorkoutSet[];
  targetSets: number;
}

interface WorkoutContextType {
  session: WorkoutSession | null;
  exercises: WorkoutExercise[];
  elapsedTime: number;
  isActive: boolean;
  startWorkout: (routineId?: string) => Promise<string>;
  addExerciseToWorkout: (exerciseId: string, targetSets?: number) => Promise<void>;
  createAndAddExercise: (name: string, targetMuscle: string, equipment: string, targetSets?: number) => Promise<void>;
  addSetToExercise: (exerciseIndex: number) => void;
  removeSetFromExercise: (exerciseIndex: number, setIndex: number) => void;
  updateSet: (exerciseIndex: number, setIndex: number, updates: Partial<WorkoutSet>) => void;
  completeSet: (exerciseIndex: number, setIndex: number, weightKg: number, reps: number) => void;
  uncompleteSet: (exerciseIndex: number, setIndex: number) => void;
  removeExercise: (exerciseIndex: number) => void;
  finishWorkout: (notes?: string) => Promise<WorkoutSession | null>;
  cancelWorkout: () => Promise<void>;
}

const STORAGE_KEY = 'gymlog_active_workout_v2';

const WorkoutContext = createContext<WorkoutContextType | null>(null);

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<WorkoutSession | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.session) {
          return {
            ...parsed.session,
            startTime: new Date(parsed.session.startTime),
            endTime: parsed.session.endTime ? new Date(parsed.session.endTime) : undefined,
          };
        }
      }
    } catch (e) {
      console.error('Error loading saved workout session:', e);
    }
    return null;
  });

  const [exercises, setExercises] = useState<WorkoutExercise[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.exercises) {
          return parsed.exercises.map((ex: any) => ({
            ...ex,
            createdAt: new Date(ex.createdAt),
            sets: ex.sets.map((s: any) => ({
              ...s,
              loggedAt: new Date(s.loggedAt),
            })),
            previousSets: (ex.previousSets || []).map((s: any) => ({
              ...s,
              loggedAt: new Date(s.loggedAt),
            })),
          }));
        }
      }
    } catch (e) {
      console.error('Error loading saved workout exercises:', e);
    }
    return [];
  });

  const [elapsedTime, setElapsedTime] = useState<number>(0);

  // Sync state to localStorage whenever session or exercises change
  useEffect(() => {
    if (session) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ session, exercises }));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [session, exercises]);

  // Elapsed timer ticker
  useEffect(() => {
    if (!session) {
      setElapsedTime(0);
      return;
    }

    const updateTimer = () => {
      const start = new Date(session.startTime).getTime();
      const now = Date.now();
      setElapsedTime(Math.max(0, Math.floor((now - start) / 1000)));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [session]);

  const startWorkout = useCallback(async (routineId?: string) => {
    const sessionId = uuidv4();
    const newSession: WorkoutSession = {
      id: sessionId,
      routineId,
      startTime: new Date(),
      syncStatus: 'pending_sync',
    };

    await db.workoutSessions.put(newSession);

    const loadedExercises: WorkoutExercise[] = [];

    if (routineId) {
      const routineExercises = await db.routineExercises
        .where('routineId')
        .equals(routineId)
        .sortBy('orderIndex');

      for (const re of routineExercises) {
        const exercise = await db.exercises.get(re.exerciseId);
        if (!exercise) continue;

        const previousSets = await getPreviousSets(re.exerciseId);
        const targetSets = re.targetSets || 3;
        const sets: WorkoutSet[] = [];

        for (let i = 1; i <= targetSets; i++) {
          const prev = previousSets.find(s => s.setNumber === i) || previousSets[previousSets.length - 1];
          sets.push({
            id: uuidv4(),
            sessionId,
            exerciseId: re.exerciseId,
            setNumber: i,
            weightKg: prev ? prev.weightKg : 0,
            reps: prev ? prev.reps : 0,
            isCompleted: false,
            loggedAt: new Date(),
          });
        }

        loadedExercises.push({
          ...exercise,
          sets,
          previousSets,
          targetSets,
        });
      }
    }

    setSession(newSession);
    setExercises(loadedExercises);
    return sessionId;
  }, []);

  const addExerciseToWorkout = useCallback(async (exerciseId: string, targetSets: number = 3) => {
    if (!session) return;
    const exercise = await db.exercises.get(exerciseId);
    if (!exercise) return;

    const previousSets = await getPreviousSets(exerciseId);
    const sets: WorkoutSet[] = [];

    for (let i = 1; i <= targetSets; i++) {
      const prev = previousSets.find(s => s.setNumber === i) || previousSets[previousSets.length - 1];
      sets.push({
        id: uuidv4(),
        sessionId: session.id,
        exerciseId,
        setNumber: i,
        weightKg: prev ? prev.weightKg : 0,
        reps: prev ? prev.reps : 0,
        isCompleted: false,
        loggedAt: new Date(),
      });
    }

    setExercises(prev => [...prev, { ...exercise, sets, previousSets, targetSets }]);
  }, [session]);

  const createAndAddExercise = useCallback(async (
    name: string,
    targetMuscle: string,
    equipment: string,
    targetSets: number = 3
  ) => {
    if (!session || !name.trim()) return;

    const newExercise: Exercise = {
      id: uuidv4(),
      name: name.trim(),
      targetMuscle,
      equipment: equipment || 'Outro',
      createdAt: new Date(),
    };

    // 1. Save permanently to Dexie DB so it's always in the library
    await db.exercises.add(newExercise);

    // 2. Add directly to the active workout
    const sets: WorkoutSet[] = [];
    for (let i = 1; i <= targetSets; i++) {
      sets.push({
        id: uuidv4(),
        sessionId: session.id,
        exerciseId: newExercise.id,
        setNumber: i,
        weightKg: 0,
        reps: 0,
        isCompleted: false,
        loggedAt: new Date(),
      });
    }

    setExercises(prev => [...prev, { ...newExercise, sets, previousSets: [], targetSets }]);
  }, [session]);

  const addSetToExercise = useCallback((exerciseIndex: number) => {
    if (!session) return;
    setExercises(prev => {
      const copy = [...prev];
      const ex = { ...copy[exerciseIndex] };
      const newSetNumber = ex.sets.length + 1;
      const lastSet = ex.sets[ex.sets.length - 1];
      const prevForSet = ex.previousSets.find(s => s.setNumber === newSetNumber) || lastSet;

      ex.sets = [
        ...ex.sets,
        {
          id: uuidv4(),
          sessionId: session.id,
          exerciseId: ex.id,
          setNumber: newSetNumber,
          weightKg: prevForSet ? prevForSet.weightKg : 0,
          reps: prevForSet ? prevForSet.reps : 0,
          isCompleted: false,
          loggedAt: new Date(),
        },
      ];
      copy[exerciseIndex] = ex;
      return copy;
    });
  }, [session]);

  const removeSetFromExercise = useCallback((exerciseIndex: number, setIndex: number) => {
    setExercises(prev => {
      const copy = [...prev];
      const ex = { ...copy[exerciseIndex] };
      ex.sets = ex.sets.filter((_, idx) => idx !== setIndex).map((s, idx) => ({
        ...s,
        setNumber: idx + 1,
      }));
      copy[exerciseIndex] = ex;
      return copy;
    });
  }, []);

  const updateSet = useCallback((exerciseIndex: number, setIndex: number, updates: Partial<WorkoutSet>) => {
    setExercises(prev => {
      const copy = [...prev];
      const ex = { ...copy[exerciseIndex] };
      ex.sets = [...ex.sets];
      ex.sets[setIndex] = { ...ex.sets[setIndex], ...updates };
      copy[exerciseIndex] = ex;
      return copy;
    });
  }, []);

  const completeSet = useCallback((exerciseIndex: number, setIndex: number, weightKg: number, reps: number) => {
    setExercises(prev => {
      const copy = [...prev];
      const ex = { ...copy[exerciseIndex] };
      ex.sets = [...ex.sets];
      ex.sets[setIndex] = {
        ...ex.sets[setIndex],
        weightKg,
        reps,
        isCompleted: true,
        loggedAt: new Date(),
      };
      copy[exerciseIndex] = ex;
      return copy;
    });
  }, []);

  const uncompleteSet = useCallback((exerciseIndex: number, setIndex: number) => {
    setExercises(prev => {
      const copy = [...prev];
      const ex = { ...copy[exerciseIndex] };
      ex.sets = [...ex.sets];
      ex.sets[setIndex] = {
        ...ex.sets[setIndex],
        isCompleted: false,
      };
      copy[exerciseIndex] = ex;
      return copy;
    });
  }, []);

  const removeExercise = useCallback((exerciseIndex: number) => {
    setExercises(prev => prev.filter((_, i) => i !== exerciseIndex));
  }, []);

  const finishWorkout = useCallback(async (notes?: string) => {
    if (!session) return null;

    const endTime = new Date();
    const completedSets = exercises.flatMap(ex =>
      ex.sets.filter(s => s.isCompleted)
    );

    if (completedSets.length > 0) {
      await db.workoutSets.bulkPut(completedSets);
    }

    await db.workoutSessions.update(session.id, {
      endTime,
      notes,
      syncStatus: 'pending_sync',
    });

    const finishedSession: WorkoutSession = { ...session, endTime, notes };

    // Clear state & storage
    setSession(null);
    setExercises([]);
    setElapsedTime(0);
    localStorage.removeItem(STORAGE_KEY);

    return finishedSession;
  }, [session, exercises]);

  const cancelWorkout = useCallback(async () => {
    if (session) {
      try {
        await db.workoutSessions.delete(session.id);
        await db.workoutSets.where('sessionId').equals(session.id).delete();
      } catch (e) {
        console.error('Error cleaning up cancelled session:', e);
      }
    }
    setSession(null);
    setExercises([]);
    setElapsedTime(0);
    localStorage.removeItem(STORAGE_KEY);
  }, [session]);

  return (
    <WorkoutContext.Provider
      value={{
        session,
        exercises,
        elapsedTime,
        isActive: session !== null,
        startWorkout,
        addExerciseToWorkout,
        createAndAddExercise,
        addSetToExercise,
        removeSetFromExercise,
        updateSet,
        completeSet,
        uncompleteSet,
        removeExercise,
        finishWorkout,
        cancelWorkout,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout() {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
}

async function getPreviousSets(exerciseId: string): Promise<WorkoutSet[]> {
  try {
    const allSets = await db.workoutSets
      .where('exerciseId')
      .equals(exerciseId)
      .reverse()
      .sortBy('loggedAt');

    if (allSets.length === 0) return [];

    const latestSessionId = allSets[0].sessionId;
    return allSets
      .filter(s => s.sessionId === latestSessionId && s.isCompleted)
      .sort((a, b) => a.setNumber - b.setNumber);
  } catch (e) {
    console.error('Error fetching previous sets:', e);
    return [];
  }
}
