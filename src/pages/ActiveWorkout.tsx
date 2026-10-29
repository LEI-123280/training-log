import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Play,
  Square,
  Plus,
  Timer,
  Dumbbell,
  ChevronRight,
  CheckCircle2,
  Flame,
  Award,
  Trash2,
  Search,
  Eye,
  Calendar,
  X,
} from 'lucide-react';
import { db } from '@/db';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
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
import { MUSCLE_GROUPS, EQUIPMENT_TYPES, type Routine, type Exercise, type WorkoutSession, type WorkoutSet } from '@/types';

interface DetailedPastSession extends WorkoutSession {
  routineName?: string;
  totalSets: number;
  tonnage: number;
  exercisesWithSets?: { exercise: Exercise; sets: WorkoutSet[] }[];
}

export function ActiveWorkoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const workout = useWorkout();

  const [routines, setRoutines] = useState<Routine[]>([]);
  const [recentSessions, setRecentSessions] = useState<DetailedPastSession[]>([]);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);

  // Dialog states
  const [isAddExerciseOpen, setIsAddExerciseOpen] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [isCreatingExercise, setIsCreatingExercise] = useState(false);
  const [newExerciseForm, setNewExerciseForm] = useState({
    name: '',
    targetMuscle: 'Peito',
    equipment: 'Barra',
  });

  const [isFinishDialogOpen, setIsFinishDialogOpen] = useState(false);
  const [finishNotes, setFinishNotes] = useState('');

  // Selected past session details modal
  const [selectedPastSession, setSelectedPastSession] = useState<DetailedPastSession | null>(null);

  const loadData = async () => {
    const r = await db.routines.orderBy('createdAt').reverse().toArray();
    setRoutines(r);

    const ex = await db.exercises.orderBy('name').toArray();
    setAllExercises(ex);

    const sessions = await db.workoutSessions
      .orderBy('startTime')
      .reverse()
      .limit(10)
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

  useEffect(() => {
    loadData();
  }, [workout.isActive]);

  // Auto-start from routine navigation if passed via route state
  useEffect(() => {
    const startRoutineId = (location.state as any)?.startRoutineId;
    if (startRoutineId && !workout.isActive) {
      workout.startWorkout(startRoutineId);
      navigate('/', { replace: true, state: {} });
    }
  }, [location.state, workout.isActive]);

  const formatElapsed = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
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
    await loadData();
  };

  const handleCreateAndAddExercise = async () => {
    if (!newExerciseForm.name.trim()) return;
    await workout.createAndAddExercise(
      newExerciseForm.name,
      newExerciseForm.targetMuscle,
      newExerciseForm.equipment,
      3
    );
    // Refresh exercise list
    const updated = await db.exercises.orderBy('name').toArray();
    setAllExercises(updated);
    setNewExerciseForm({ name: '', targetMuscle: 'Peito', equipment: 'Barra' });
    setIsCreatingExercise(false);
    setIsAddExerciseOpen(false);
    setExerciseSearch('');
  };

  // Open past workout details
  const handleOpenPastSession = async (session: DetailedPastSession) => {
    const sets = await db.workoutSets.where('sessionId').equals(session.id).toArray();
    
    // Group sets by exercise
    const exerciseMap = new Map<string, WorkoutSet[]>();
    for (const set of sets) {
      const existing = exerciseMap.get(set.exerciseId) || [];
      existing.push(set);
      exerciseMap.set(set.exerciseId, existing);
    }

    const exercisesWithSets = await Promise.all(
      Array.from(exerciseMap.entries()).map(async ([exerciseId, exerciseSets]) => {
        const exercise = await db.exercises.get(exerciseId) || {
          id: exerciseId,
          name: 'Exercício Desconhecido',
          targetMuscle: 'Outro',
          equipment: '',
          createdAt: new Date(),
        };
        return {
          exercise,
          sets: exerciseSets.sort((a, b) => a.setNumber - b.setNumber),
        };
      })
    );

    setSelectedPastSession({
      ...session,
      exercisesWithSets,
    });
  };

  // Delete past session
  const handleDeletePastSession = async (sessionId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (window.confirm('Tens a certeza que queres eliminar este treino do histórico?')) {
      await db.workoutSets.where('sessionId').equals(sessionId).delete();
      await db.workoutSessions.delete(sessionId);
      if (selectedPastSession?.id === sessionId) {
        setSelectedPastSession(null);
      }
      await loadData();
    }
  };

  // Filter exercises in add modal
  const filteredExercises = allExercises.filter(ex =>
    ex.name.toLowerCase().includes(exerciseSearch.toLowerCase()) ||
    ex.targetMuscle.toLowerCase().includes(exerciseSearch.toLowerCase())
  );

  // -------------------------------------------------------------
  // ACTIVE WORKOUT VIEW
  // -------------------------------------------------------------
  if (workout.isActive) {
    return (
      <div className="px-4 pb-28 pt-2 max-w-lg mx-auto">
        {/* Real-time Workout Metrics Banner */}
        <div className="sticky top-14 z-30 bg-zinc-950/95 backdrop-blur-md pb-2 pt-1 -mx-4 px-4">
          <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-2.5 shadow-lg">
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
                {totalVolume >= 1000
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
              <p className="text-sm font-semibold text-zinc-200">Treino ativo sem exercícios</p>
              <p className="text-xs text-zinc-400 mt-1 mb-4">
                Adiciona exercícios agora para começar a preencher pesos e repetições.
              </p>
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
                onRemoveSet={workout.removeSetFromExercise}
                onRemoveExercise={workout.removeExercise}
              />
            ))
          )}
        </div>

        {/* Add Exercise CTA Button */}
        <button
          type="button"
          onClick={() => {
            setIsCreatingExercise(false);
            setExerciseSearch('');
            setIsAddExerciseOpen(true);
          }}
          className="w-full mt-3 h-12 rounded-2xl border-2 border-dashed border-zinc-700 bg-zinc-900/50 text-zinc-300 flex items-center justify-center gap-2 hover:border-emerald-500 hover:text-emerald-400 active:scale-[0.98] transition-all"
        >
          <Plus className="h-5 w-5 text-emerald-400" />
          <span className="text-sm font-bold">Adicionar Exercício ao Treino</span>
        </button>

        {/* Cancel / Finish Controls */}
        <div className="flex gap-2.5 mt-5">
          <Button
            variant="destructive"
            className="flex-1 h-12 text-sm font-semibold"
            onClick={() => {
              if (window.confirm('Descartar este treino em curso? Todos os dados deste treino serão cancelados.')) {
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

        {/* Add / Create Exercise Modal */}
        <Dialog open={isAddExerciseOpen} onOpenChange={setIsAddExerciseOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {isCreatingExercise ? 'Criar Novo Exercício' : 'Adicionar ao Treino'}
              </DialogTitle>
              <DialogDescription>
                {isCreatingExercise
                  ? 'Ficará guardado na tua biblioteca para este e futuros treinos.'
                  : 'Pesquisa na tua biblioteca ou cria um exercício novo diretamente.'}
              </DialogDescription>
            </DialogHeader>

            {isCreatingExercise ? (
              /* Inline Create Exercise Form */
              <div className="space-y-4 py-2">
                <div>
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 block">
                    Nome do Exercício
                  </label>
                  <Input
                    placeholder="Ex: Elevação Pélvica, Supino Declinado..."
                    value={newExerciseForm.name}
                    onChange={e => setNewExerciseForm(f => ({ ...f, name: e.target.value }))}
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 block">
                    Grupo Muscular Principal
                  </label>
                  <Select
                    value={newExerciseForm.targetMuscle}
                    onChange={e => setNewExerciseForm(f => ({ ...f, targetMuscle: e.target.value }))}
                    options={MUSCLE_GROUPS.map(m => ({ value: m, label: m }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 block">
                    Equipamento
                  </label>
                  <Select
                    value={newExerciseForm.equipment}
                    onChange={e => setNewExerciseForm(f => ({ ...f, equipment: e.target.value }))}
                    options={EQUIPMENT_TYPES.map(e => ({ value: e, label: e }))}
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsCreatingExercise(false)}
                  >
                    Voltar à Lista
                  </Button>
                  <Button
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 font-bold"
                    onClick={handleCreateAndAddExercise}
                    disabled={!newExerciseForm.name.trim()}
                  >
                    Criar e Adicionar
                  </Button>
                </div>
              </div>
            ) : (
              /* Exercise Search & Selection List */
              <div className="space-y-3">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input
                    placeholder="Pesquisar exercício ou músculo..."
                    value={exerciseSearch}
                    onChange={e => setExerciseSearch(e.target.value)}
                    className="pl-9 bg-zinc-950"
                  />
                </div>

                {/* Direct "Create New Exercise" Button */}
                <button
                  type="button"
                  onClick={() => {
                    setNewExerciseForm({
                      name: exerciseSearch.trim(),
                      targetMuscle: 'Peito',
                      equipment: 'Barra',
                    });
                    setIsCreatingExercise(true);
                  }}
                  className="w-full p-3 rounded-xl border border-dashed border-emerald-500/50 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 flex items-center justify-center gap-2 font-semibold text-xs active:scale-[0.98] transition-all"
                >
                  <Plus className="h-4 w-4 text-emerald-400" />
                  <span>
                    {exerciseSearch.trim()
                      ? `Criar exercício "${exerciseSearch.trim()}"`
                      : '+ Criar Novo Exercício (Guardar para Sempre)'}
                  </span>
                </button>

                {/* List of existing exercises */}
                <div className="space-y-1.5 max-h-[45vh] overflow-y-auto pr-1">
                  {filteredExercises.length === 0 ? (
                    <div className="text-center py-6 text-zinc-500">
                      <p className="text-xs">Nenhum exercício encontrado com esse nome.</p>
                      <p className="text-xs text-emerald-400 mt-1">Usa o botão acima para criá-lo!</p>
                    </div>
                  ) : (
                    filteredExercises.map(exercise => (
                      <button
                        key={exercise.id}
                        type="button"
                        onClick={() => {
                          workout.addExerciseToWorkout(exercise.id);
                          setIsAddExerciseOpen(false);
                          setExerciseSearch('');
                        }}
                        className="w-full text-left p-3 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 active:bg-zinc-700 transition-colors flex items-center justify-between"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="text-sm font-semibold text-zinc-100 truncate">{exercise.name}</p>
                          <div className="flex gap-1.5 mt-1">
                            <Badge variant="secondary" className="bg-zinc-900 text-zinc-400 text-[10px]">
                              {exercise.targetMuscle}
                            </Badge>
                            {exercise.equipment && (
                              <Badge variant="outline" className="border-zinc-700 text-zinc-500 text-[10px]">
                                {exercise.equipment}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Plus className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
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
            <p className="text-xs text-emerald-100">Regista séries e exercícios livremente</p>
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

      {/* Recent Activity History (CLICKABLE WITH FULL DRILL-DOWN & DELETE) */}
      {recentSessions.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Últimos Treinos
            </h2>
            <span className="text-[11px] text-zinc-500">Toca para ver detalhes</span>
          </div>

          <div className="space-y-2">
            {recentSessions.map(session => (
              <Card
                key={session.id}
                onClick={() => handleOpenPastSession(session)}
                className="p-3.5 bg-zinc-900 border-zinc-800/80 hover:border-zinc-700 active:scale-[0.99] transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="text-sm font-bold text-zinc-100 truncate">
                      {session.routineName || 'Treino Livre'}
                    </p>
                    <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                      <span className="text-zinc-500">
                        {new Date(session.startTime).toLocaleDateString('pt-PT', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span>·</span>
                      <span className="text-zinc-300 font-semibold">{session.totalSets} séries</span>
                      {session.tonnage > 0 && (
                        <>
                          <span>·</span>
                          <span className="text-emerald-400 font-mono font-semibold">
                            {Math.round(session.tonnage).toLocaleString('pt-PT')} kg
                          </span>
                        </>
                      )}
                    </p>
                    {session.notes && (
                      <p className="text-xs text-zinc-500 italic mt-1 line-clamp-1">
                        "{session.notes}"
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleDeletePastSession(session.id, e)}
                      aria-label="Eliminar treino"
                      className="h-9 w-9 flex items-center justify-center rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-500/10 active:scale-95 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <ChevronRight className="h-4 w-4 text-zinc-600" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Past Workout Details Dialog */}
      <Dialog open={selectedPastSession !== null} onOpenChange={(open) => { if (!open) setSelectedPastSession(null); }}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          {selectedPastSession && (
            <>
              <DialogHeader>
                <DialogTitle className="text-base text-zinc-50">
                  {selectedPastSession.routineName || 'Treino Livre'}
                </DialogTitle>
                <DialogDescription>
                  {new Date(selectedPastSession.startTime).toLocaleDateString('pt-PT', {
                    weekday: 'long',
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </DialogDescription>
              </DialogHeader>

              {/* KPI metrics of past session */}
              <div className="grid grid-cols-2 gap-2 my-2">
                <div className="bg-zinc-800/80 rounded-xl p-2.5 text-center">
                  <p className="text-xs text-zinc-400 font-medium">Séries Concluídas</p>
                  <p className="text-lg font-bold text-zinc-100">{selectedPastSession.totalSets}</p>
                </div>
                <div className="bg-zinc-800/80 rounded-xl p-2.5 text-center">
                  <p className="text-xs text-zinc-400 font-medium">Tonelagem Total</p>
                  <p className="text-lg font-bold text-emerald-400 font-mono">
                    {Math.round(selectedPastSession.tonnage).toLocaleString('pt-PT')} kg
                  </p>
                </div>
              </div>

              {selectedPastSession.notes && (
                <div className="bg-zinc-800/40 border border-zinc-700/50 rounded-xl p-3 my-2">
                  <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Notas</p>
                  <p className="text-sm text-zinc-200 mt-0.5">{selectedPastSession.notes}</p>
                </div>
              )}

              {/* Breakdown of exercises and sets */}
              <div className="space-y-3 my-3">
                <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Exercícios e Séries Registadas
                </h4>

                {selectedPastSession.exercisesWithSets?.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic">Nenhuma série registada.</p>
                ) : (
                  selectedPastSession.exercisesWithSets?.map(({ exercise, sets }) => (
                    <div key={exercise.id} className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-zinc-200">{exercise.name}</span>
                        <Badge variant="secondary" className="text-[10px]">
                          {exercise.targetMuscle}
                        </Badge>
                      </div>

                      <div className="space-y-1">
                        {sets.map(s => (
                          <div
                            key={s.id}
                            className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800/50"
                          >
                            <span className="font-semibold text-zinc-400">Série {s.setNumber}</span>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-emerald-400">{s.weightKg} kg</span>
                              <span className="text-zinc-400">×</span>
                              <span className="font-semibold text-zinc-200">{s.reps} reps</span>
                              <span className="text-zinc-600 text-[10px] font-mono">
                                ({Math.round(s.weightKg * s.reps)} kg)
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <DialogFooter className="flex flex-row justify-between gap-2 mt-4 pt-3 border-t border-zinc-800">
                <Button
                  variant="destructive"
                  onClick={() => handleDeletePastSession(selectedPastSession.id)}
                  className="flex items-center gap-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30"
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar Treino
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setSelectedPastSession(null)}
                >
                  Fechar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
