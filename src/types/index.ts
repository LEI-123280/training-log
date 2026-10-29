export interface Exercise {
  id: string;
  name: string;
  targetMuscle: string;
  equipment: string;
  createdAt: Date;
}

export interface Routine {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
}

export interface RoutineExercise {
  id: string;
  routineId: string;
  exerciseId: string;
  orderIndex: number;
  targetSets: number;
}

export interface WorkoutSession {
  id: string;
  routineId?: string;
  startTime: Date;
  endTime?: Date;
  notes?: string;
  syncStatus: 'synced' | 'pending_sync';
}

export interface WorkoutSet {
  id: string;
  sessionId: string;
  exerciseId: string;
  setNumber: number;
  weightKg: number;
  reps: number;
  isCompleted: boolean;
  loggedAt: Date;
}

export const MUSCLE_GROUPS = [
  'Peito',
  'Costas',
  'Ombros',
  'Bíceps',
  'Tríceps',
  'Quadríceps',
  'Isquiotibiais',
  'Gémeos',
  'Abdominais',
  'Glúteos',
  'Antebraços',
  'Trapézio',
] as const;

export const EQUIPMENT_TYPES = [
  'Barra',
  'Haltere',
  'Máquina',
  'Cabo',
  'Peso Corporal',
  'Kettlebell',
  'Elástico',
  'Outro',
] as const;

export type MuscleGroup = typeof MUSCLE_GROUPS[number];
export type EquipmentType = typeof EQUIPMENT_TYPES[number];
