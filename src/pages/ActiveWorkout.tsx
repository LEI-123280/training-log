import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Play, Square, Plus, Timer, Dumbbell, ChevronRight, CheckCircle2, Flame, Award } from 'lucide-react';
import { db } from '@/db';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { ExerciseCard } from '@/components/workout/ExerciseCard';
import { useWorkout } from '@/hooks/useWorkout';
import type { Routine, Exercise } from '@/types';

export function ActiveWorkoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const workout = useWorkout();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [isAddExerciseOpen, setIsAddExerciseOpen] = useState(false);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [isFinishDialogOpen, setIsFinishDialogOpen] = useState(false);
  const [finishNotes, setFinishNotes] = useState('');

  // Load routines and past workouts for the start screen
  useEffect(() => {
    const load = async () => {
      const r = await db.routines.orderBy('createdAt').reverse().toArray();
      setRoutines(r);
      const ex = await db.exercises.orderBy('name').toArray();
      setAllExercises(ex);

      // Load recent sessions with summary
      const sessions = await db.workoutSessions
        .orderBy('startTime')
        .reverse()
        .limit(6)
        .toArray();

      const enriched = await Promise.all(
        sessions.map(async s => {
          const routine = s.routineId ? await db.routines.get(s.routineId) : null;
          const sets = await db.workoutSets.where('sessionId').equals(s.id).toArray();
          const tonnage = sets.reduce((sum, set) => sum + (set.weightKg * set.reps), 0);
          return {
            ...s,
            routineName: routine?.name,
            totalSets: sets.length,
            tonnage,
          };
        })
      );
      setRecentSessions(enriched);
    };
    load();
  }, [workout.isActive]);

  // Auto-start from routine navigation if passed via route state
  useEffect(() => {
    const startRoutineId = (location.state as any)?.startRoutineId;
    if (startRoutineId && !workout.isActive) {
      workout.startWorkout(startRoutineId);
      // Clean up navigation state
      navigate('/', { replace: true, state: {} });
    }
  }, [location.state, workout.isActive]);

  const formatElapsed = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const totalCompletedSets = workout.exercises.reduce(
    (sum, ex) => sum + ex.sets.filter(s => s.isCompleted).length,
    0
  );

  const totalVolume = workout.exercises.reduce(
    (sum, ex) =>
      sum +
      ex.sets
        .filter(s => s.isCompleted)
        .reduce((s, set) => s + set.weightKg * set.reps, 0),
    0
  );

  const handleFinish = async () => {
    await workout.finishWorkout(finishNotes || undefined);
    setIsFinishDialogOpen(false);
    setFinishNotes('');
  };

  // -------------------------------------------------------------
  // ACTIVE WORKOUT VIEW
  // -------------------------------------------------------------
  if (workout.isActive) {
    return (
      <div className="px-4 pb-28 pt-2 max-w-lg mx-auto">
        {/* Real-time Workout Metrics Banner */}
        <div className="sticky top-14 z-30 bg-zinc-950/90 backdrop-blur-md pb-2 pt-1 -mx-4 px-4">
          <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-2.5 shadow-md">
            <div className="flex items-center gap-2 text-emerald-400">
              <Timer className="h-4 w-4" />
              <span className="text-sm font-mono font-bold tracking-tight">
                {formatElapsed(workout.elapsedTime)}
              </span>
            </div>
            <div className="h-4 w-px bg-zinc-800" />
            <div className="flex items-center gap-1.5 text-zinc-300">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-xs font-semibold">{totalCompletedSets} sets</span>
            </div>
            <div className="h-4 w-px bg-zinc-800" />
            <div className="flex items-center gap-1.5 text-zinc-300">
              <Flame className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-xs font-semibold">
                {totalVolume > 1000
                  ? `${(totalVolume / 1000).toFixed(1)}t`
                  : `${Math.round(totalVolume)}kg`}
              </span>
            </div>
          </div>
        </div>

        {/* Exercises in Session */}
        <div className="space-y-3 mt-1">
          {workout.exercises.length === 0 ? (
            <Card className="p-8 text-center bg-zinc-900/60 border-dashed border-zinc-800">
              <Dumbbell className="h-10 w-10 mx-auto mb-2 text-zinc-600" />
              <p className="text-sm font-medium text-zinc-300">O teu treino começou vazio</p>
              <p className="text-xs text-zinc-500 mt-1 mb-4">Adiciona exercícios para começar a registar séries.</p>
              <Button onClick={() => setIsAddExerciseOpen(true)}>
                <Plus className="h-4 w-4 mr-1" /> Adicionar Exercício
              </Button>
            </Card>
          ) : (
            workout.exercises.map((ex, idx) => (
              <ExerciseCard
                key={ex.id + idx}
                exercise={ex}
                sets={ex.sets}
                previousSets={ex.previousSets}
                exerciseIndex={idx}
                onCompleteSet={workout.completeSet}
                onUncompleteSet={workout.uncompleteSet}
                onUpdateSet={workout.updateSet}
                onAddSet={workout.addSetToExercise}
                onRemoveExercise={workout.removeExercise}
              />
            ))
          )}
        </div>

        {/* Add Exercise CTA Button */}
        {workout.exercises.length > 0 && (
          <button
            onClick={() => setIsAddExerciseOpen(true)}
            className="w-full mt-3 h-12 rounded-2xl border-2 border-dashed border-zinc-700 bg-zinc-900/30 text-zinc-400 flex items-center justify-center gap-2 hover:border-emerald-500 hover:text-emerald-400 active:scale-[0.98] transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span className="text-sm font-semibold">Adicionar Exercício ao Treino</span>
          </button>
        )}

        {/* Cancel / Finish Controls */}
        <div className="flex gap-2.5 mt-5">
          <Button
            variant="destructive"
            className="flex-1 h-12 text-sm font-semibold"
            onClick={() => {
              if (window.confirm('Descartar este treino em curso?')) {
                workout.cancelWorkout();
              }
            }}
          >
            Cancelar
          </Button>
          <Button
            className="flex-[2] h-12 text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30"
            size="lg"
            onClick={() => setIsFinishDialogOpen(true)}
          >
            <Square className="h-4 w-4 mr-2 fill-current" />
            Finalizar Treino
          </Button>
        </div>

        {/* Add Exercise Modal */}
        <Dialog open={isAddExerciseOpen} onOpenChange={setIsAddExerciseOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar ao Treino Ativo</DialogTitle>
              <DialogDescription>Seleciona um exercício da tua biblioteca.</DialogDescription>
            </DialogHeader>
            <div className="space-y-1.5 max-h-[60vh] overflow-y-auto">
              {allExercises.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="text-sm text-zinc-400">Nenhum exercício encontrado.</p>
                  <Button
                    variant="link"
                    className="mt-2 text-emerald-400"
                    onClick={() => {
                      setIsAddExerciseOpen(false);
                      navigate('/exercises');
                    }}
                  >
                    Ir criar exercícios
                  </Button>
                </div>
              ) : (
                allExercises.map(exercise => (
                  <button
                    key={exercise.id}
                    onClick={() => {
                      workout.addExerciseToWorkout(exercise.id);
                      setIsAddExerciseOpen(false);
                    }}
                    className="w-full text-left p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700/80 active:bg-zinc-700 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-zinc-100">{exercise.name}</p>
                      <Badge variant="secondary" className="mt-1 bg-zinc-900 text-zinc-400 text-[10px]">
                        {exercise.targetMuscle}
                      </Badge>
                    </div>
                    <Plus className="h-5 w-5 text-emerald-400" />
                  </button>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Finish Workout Summary Modal */}
        <Dialog open={isFinishDialogOpen} onOpenChange={setIsFinishDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-emerald-400">
                <Award className="h-5 w-5" />
                Treino Concluído!
              </DialogTitle>
              <DialogDescription>
                Duração: <strong className="text-zinc-200">{formatElapsed(workout.elapsedTime)}</strong> · Séries completadas: <strong className="text-zinc-200">{totalCompletedSets}</strong> · Tonelagem: <strong className="text-emerald-400">{Math.round(totalVolume).toLocaleString('pt-PT')} kg</strong>
              </DialogDescription>
            </DialogHeader>
            <div className="py-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 block">
                Notas do Treino (opcional)
              </label>
              <Input
                placeholder="Ex: Excelente pump, supino com facilidade..."
                value={finishNotes}
                onChange={e => setFinishNotes(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsFinishDialogOpen(false)}>
                Voltar ao Treino
              </Button>
              <Button
                onClick={handleFinish}
                className="bg-emerald-600 hover:bg-emerald-500 font-semibold"
              >
                Gravar Treino
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // -------------------------------------------------------------
  // IDLE / START SCREEN
  // -------------------------------------------------------------
  return (
    <div className="px-4 pb-28 pt-4 max-w-lg mx-auto">
      {/* Quick Start Free Workout Button */}
      <button
        onClick={() => workout.startWorkout()}
        className="w-full mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xl shadow-emerald-600/20 flex items-center justify-between active:scale-[0.98] transition-transform"
      >
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-white/10 flex items-center justify-center">
            <Plus className="h-6 w-6 text-white" />
          </div>
          <div className="text-left">
            <p className="font-bold text-base">Iniciar Treino Livre</p>
            <p className="text-xs text-emerald-100">Sem rotina pré-definida</p>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-emerald-100" />
      </button>

      {/* Routine Templates */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Rotinas Rápidas
          </h2>
          <button
            onClick={() => navigate('/routines')}
            className="text-xs text-emerald-400 font-medium hover:underline"
          >
            Gerir todas
          </button>
        </div>

        {routines.length === 0 ? (
          <Card className="p-5 text-center bg-zinc-900 border-zinc-800">
            <Dumbbell className="h-8 w-8 mx-auto mb-2 text-zinc-600" />
            <p className="text-sm text-zinc-300 font-medium">Ainda sem rotinas criadas</p>
            <p className="text-xs text-zinc-500 mt-1 mb-3">
              Cria as tuas rotinas para acelerares o registo no ginásio.
            </p>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => navigate('/routines')}
              className="bg-zinc-800 text-zinc-200"
            >
              Criar Rotina
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-2.5">
            {routines.map(routine => (
              <button
                key={routine.id}
                onClick={() => workout.startWorkout(routine.id)}
                className="w-full text-left p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 active:scale-[0.98] transition-all flex items-center justify-between"
              >
                <div className="min-w-0 pr-2">
                  <p className="font-semibold text-zinc-100 truncate text-sm">{routine.name}</p>
                  {routine.description && (
                    <p className="text-xs text-zinc-500 truncate mt-0.5">{routine.description}</p>
                  )}
                </div>
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  <Play className="h-4 w-4 text-emerald-400 fill-emerald-400" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity History */}
      {recentSessions.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2.5">
            Últimos Treinos
          </h2>
          <div className="space-y-2">
            {recentSessions.map(session => (
              <Card key={session.id} className="p-3 bg-zinc-900 border-zinc-800/80">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-zinc-200 truncate">
                      {session.routineName || 'Treino Livre'}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {new Date(session.startTime).toLocaleDateString('pt-PT', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {' · '}
                      <span className="text-zinc-400">{session.totalSets} séries</span>
                      {session.tonnage > 0 && (
                        <> · <span className="text-emerald-400 font-medium">{Math.round(session.tonnage)} kg</span></>
                      )}
                    </p>
                    {session.notes && (
                      <p className="text-xs text-zinc-400 italic mt-1 line-clamp-1">
                        "{session.notes}"
                      </p>
                    )}
                  </div>
                  <Badge variant="secondary" className="text-[10px] bg-zinc-800 text-zinc-400 flex-shrink-0 ml-2">
                    Concluído
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
