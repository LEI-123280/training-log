import Dexie, { type Table } from 'dexie';
import type { Exercise, Routine, RoutineExercise, WorkoutSession, WorkoutSet } from '@/types';

export class GymLogDB extends Dexie {
  exercises!: Table<Exercise>;
  routines!: Table<Routine>;
  routineExercises!: Table<RoutineExercise>;
  workoutSessions!: Table<WorkoutSession>;
  workoutSets!: Table<WorkoutSet>;

  constructor() {
    super('gymlog-db');

    this.version(1).stores({
      exercises: 'id, name, targetMuscle, createdAt',
      routines: 'id, name, createdAt',
      routineExercises: 'id, routineId, exerciseId, orderIndex',
      workoutSessions: 'id, routineId, startTime, syncStatus',
      workoutSets: 'id, sessionId, exerciseId, setNumber, loggedAt',
    });

    this.version(2).stores({
      exercises: 'id, name, *targetMuscles, createdAt',
    }).upgrade(tx => {
      return tx.table('exercises').toCollection().modify((ex: any) => {
        if (!ex.targetMuscles || !Array.isArray(ex.targetMuscles) || ex.targetMuscles.length === 0) {
          ex.targetMuscles = ex.targetMuscle ? [ex.targetMuscle] : ['Peito'];
        }
      });
    });
  }
}

export const db = new GymLogDB();
