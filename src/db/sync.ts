import { db } from './index';

// Supabase sync configuration
// Set these in your .env file when ready to enable cloud sync:
// VITE_SUPABASE_URL=https://your-project.supabase.co
// VITE_SUPABASE_ANON_KEY=your-anon-key

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSyncEnabled = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export async function syncPendingSessions(): Promise<void> {
  if (!isSyncEnabled) {
    console.log('[Sync] Supabase not configured, skipping sync');
    return;
  }

  try {
    const pendingSessions = await db.workoutSessions
      .where('syncStatus')
      .equals('pending_sync')
      .toArray();

    if (pendingSessions.length === 0) return;

    console.log(`[Sync] Syncing ${pendingSessions.length} sessions...`);

    // Dynamic import to avoid loading supabase when not configured
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);

    for (const session of pendingSessions) {
      // Sync session
      const { error: sessionError } = await supabase
        .from('workout_sessions')
        .upsert({
          id: session.id,
          routine_id: session.routineId,
          start_time: session.startTime,
          end_time: session.endTime,
          notes: session.notes,
          sync_status: 'synced',
        }, { onConflict: 'id' });

      if (sessionError) {
        console.error('[Sync] Session sync failed:', sessionError);
        continue;
      }

      // Sync sets for this session
      const sets = await db.workoutSets
        .where('sessionId')
        .equals(session.id)
        .toArray();

      if (sets.length > 0) {
        const { error: setsError } = await supabase
          .from('workout_sets')
          .upsert(
            sets.map(s => ({
              id: s.id,
              session_id: s.sessionId,
              exercise_id: s.exerciseId,
              set_number: s.setNumber,
              weight_kg: s.weightKg,
              reps: s.reps,
              is_completed: s.isCompleted,
              logged_at: s.loggedAt,
            })),
            { onConflict: 'id' }
          );

        if (setsError) {
          console.error('[Sync] Sets sync failed:', setsError);
          continue;
        }
      }

      // Mark as synced locally
      await db.workoutSessions.update(session.id, { syncStatus: 'synced' });
      console.log(`[Sync] Session ${session.id} synced successfully`);
    }
  } catch (error) {
    console.error('[Sync] Sync failed:', error);
  }
}

export async function syncExercises(): Promise<void> {
  if (!isSyncEnabled) return;

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);

    const exercises = await db.exercises.toArray();
    if (exercises.length === 0) return;

    const { error } = await supabase
      .from('exercises')
      .upsert(
        exercises.map(e => ({
          id: e.id,
          name: e.name,
          target_muscle: e.targetMuscle,
          equipment: e.equipment,
          created_at: e.createdAt,
        })),
        { onConflict: 'id' }
      );

    if (error) console.error('[Sync] Exercise sync failed:', error);
  } catch (error) {
    console.error('[Sync] Exercise sync failed:', error);
  }
}

export async function syncRoutines(): Promise<void> {
  if (!isSyncEnabled) return;

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);

    const routines = await db.routines.toArray();
    const routineExercises = await db.routineExercises.toArray();

    if (routines.length > 0) {
      await supabase
        .from('routines')
        .upsert(
          routines.map(r => ({
            id: r.id,
            name: r.name,
            description: r.description,
            created_at: r.createdAt,
          })),
          { onConflict: 'id' }
        );
    }

    if (routineExercises.length > 0) {
      await supabase
        .from('routine_exercises')
        .upsert(
          routineExercises.map(re => ({
            id: re.id,
            routine_id: re.routineId,
            exercise_id: re.exerciseId,
            order_index: re.orderIndex,
            target_sets: re.targetSets,
          })),
          { onConflict: 'id' }
        );
    }
  } catch (error) {
    console.error('[Sync] Routine sync failed:', error);
  }
}
