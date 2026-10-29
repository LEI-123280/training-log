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
  }
}

export const db = new GymLogDB();
