import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { Plus, Play, Edit2, Trash2, GripVertical, ListChecks, Dumbbell, Search } from 'lucide-react';
import { db } from '@/db';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { MUSCLE_GROUPS, EQUIPMENT_TYPES, type Routine, type RoutineExercise, type Exercise } from '@/types';

export function RoutinesPage() {
  const navigate = useNavigate();
  const [routines, setRoutines] = useState<(Routine & { exercises: (RoutineExercise & { exercise: Exercise })[] })[]>([]);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [routineExercises, setRoutineExercises] = useState<{ exerciseId: string; targetSets: number }[]>([]);
  const [isAddExerciseOpen, setIsAddExerciseOpen] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [isCreatingExercise, setIsCreatingExercise] = useState(false);
  const [newExerciseForm, setNewExerciseForm] = useState({
    name: '',
    targetMuscle: 'Peito',
    equipment: 'Barra',
  });

  const loadData = async () => {
    const allRoutines = await db.routines.orderBy('createdAt').reverse().toArray();
    const exercises = await db.exercises.orderBy('name').toArray();
    setAllExercises(exercises);

    const enriched = await Promise.all(
      allRoutines.map(async routine => {
        const rExercises = await db.routineExercises
          .where('routineId')
          .equals(routine.id)
          .sortBy('orderIndex');

        const withExercise = await Promise.all(
          rExercises.map(async re => {
            const exercise = await db.exercises.get(re.exerciseId);
            return { ...re, exercise: exercise! };
          })
        );

        return { ...routine, exercises: withExercise.filter(e => e.exercise) };
      })
    );

    setRoutines(enriched);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async () => {
    if (!form.name.trim()) return;

    const routineId = editingRoutine?.id || uuidv4();

    if (editingRoutine) {
      await db.routines.update(routineId, {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
      });
      await db.routineExercises.where('routineId').equals(routineId).delete();
    } else {
      await db.routines.add({
        id: routineId,
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        createdAt: new Date(),
      });
    }

    // Add routine exercises
    for (let i = 0; i < routineExercises.length; i++) {
      await db.routineExercises.add({
        id: uuidv4(),
        routineId,
        exerciseId: routineExercises[i].exerciseId,
        orderIndex: i,
        targetSets: routineExercises[i].targetSets,
      });
    }

    resetDialog();
    await loadData();
  };

  const handleEdit = async (routine: Routine) => {
    const rExercises = await db.routineExercises
      .where('routineId')
      .equals(routine.id)
      .sortBy('orderIndex');

    setEditingRoutine(routine);
    setForm({ name: routine.name, description: routine.description || '' });
    setRoutineExercises(rExercises.map(re => ({ exerciseId: re.exerciseId, targetSets: re.targetSets })));
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tens a certeza que queres eliminar esta rotina?')) {
      await db.routineExercises.where('routineId').equals(id).delete();
      await db.routines.delete(id);
      await loadData();
    }
  };

  const handleStartWorkout = (routineId: string) => {
    navigate('/', { state: { startRoutineId: routineId } });
  };

  const resetDialog = () => {
    setEditingRoutine(null);
    setForm({ name: '', description: '' });
    setRoutineExercises([]);
    setIsDialogOpen(false);
    setIsAddExerciseOpen(false);
    setIsCreatingExercise(false);
    setExerciseSearch('');
  };

  const addExerciseToRoutine = (exerciseId: string) => {
    setRoutineExercises(prev => [...prev, { exerciseId, targetSets: 3 }]);
    setIsAddExerciseOpen(false);
    setExerciseSearch('');
  };

  const handleCreateAndAddExerciseToRoutine = async () => {
    if (!newExerciseForm.name.trim()) return;
    const newExercise: Exercise = {
      id: uuidv4(),
      name: newExerciseForm.name.trim(),
      targetMuscle: newExerciseForm.targetMuscle,
      equipment: newExerciseForm.equipment || 'Outro',
      createdAt: new Date(),
    };
    await db.exercises.add(newExercise);
    const updated = await db.exercises.orderBy('name').toArray();
    setAllExercises(updated);

    setRoutineExercises(prev => [...prev, { exerciseId: newExercise.id, targetSets: 3 }]);
    setNewExerciseForm({ name: '', targetMuscle: 'Peito', equipment: 'Barra' });
    setIsCreatingExercise(false);
    setIsAddExerciseOpen(false);
    setExerciseSearch('');
  };

  const removeExerciseFromRoutine = (index: number) => {
    setRoutineExercises(prev => prev.filter((_, i) => i !== index));
  };

  const updateTargetSets = (index: number, targetSets: number) => {
    setRoutineExercises(prev => {
      const next = [...prev];
      next[index] = { ...next[index], targetSets: Math.max(1, targetSets) };
      return next;
    });
  };

  const filteredExercises = allExercises.filter(ex =>
    ex.name.toLowerCase().includes(exerciseSearch.toLowerCase()) ||
    ex.targetMuscle.toLowerCase().includes(exerciseSearch.toLowerCase())
  );

  return (
    <div className="px-4 pb-28 pt-3 max-w-lg mx-auto">
      {/* Routine List */}
      <div className="space-y-3">
        {routines.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
            <ListChecks className="h-12 w-12 mb-3 opacity-40 text-emerald-500" />
            <p className="text-base font-medium text-zinc-300">Sem rotinas configuradas</p>
            <p className="text-xs text-zinc-500 mt-1 max-w-xs text-center">
              Cria templates como "Push", "Pull" ou "Pernas" para começares o treino com 1 toque.
            </p>
            <Button
              onClick={() => {
                resetDialog();
                setIsDialogOpen(true);
              }}
              className="mt-4"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Criar Primeira Rotina
            </Button>
          </div>
        ) : (
          routines.map(routine => (
            <Card key={routine.id} className="overflow-hidden bg-zinc-900 border-zinc-800 shadow-md">
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-zinc-50 truncate">{routine.name}</h3>
                    {routine.description && (
                      <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2">{routine.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(routine)}
                      aria-label="Editar rotina"
                      className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 active:scale-95 transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(routine.id)}
                      aria-label="Eliminar rotina"
                      className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-zinc-400 hover:text-red-400 hover:bg-red-500/10 active:scale-95 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {routine.exercises.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 mb-3.5 mt-2">
                    {routine.exercises.map(re => (
                      <Badge key={re.id} variant="secondary" className="bg-zinc-800 text-zinc-300 text-xs">
                        {re.exercise.name} <span className="text-emerald-400 ml-1 font-semibold">{re.targetSets}s</span>
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 italic mb-3">Sem exercícios associados</p>
                )}

                <Button
                  onClick={() => handleStartWorkout(routine.id)}
                  className="w-full h-12 text-base font-semibold shadow-lg shadow-emerald-600/20"
                  size="lg"
                >
                  <Play className="h-4 w-4 mr-2 fill-current" />
                  Iniciar Treino
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => {
          resetDialog();
          setIsDialogOpen(true);
        }}
        aria-label="Nova Rotina"
        className="fixed right-5 bottom-20 h-14 w-14 rounded-full bg-emerald-600 text-white shadow-xl shadow-emerald-600/30 flex items-center justify-center hover:bg-emerald-500 transition-transform active:scale-90 z-40"
      >
        <Plus className="h-7 w-7" />
      </button>

      {/* Create/Edit Routine Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) resetDialog(); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRoutine ? 'Editar Rotina' : 'Nova Rotina'}
            </DialogTitle>
            <DialogDescription>
              Define o template da rotina e os exercícios recomendados.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 block">
                Nome da Rotina
              </label>
              <Input
                placeholder="Ex: Push A - Foco Peito e Tríceps"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 block">
                Descrição ou Notas (opcional)
              </label>
              <Input
                placeholder="Ex: Descanso de 90s entre séries pesadas"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>

            {/* Exercises in routine */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Exercícios ({routineExercises.length})
                </label>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setIsCreatingExercise(false);
                    setExerciseSearch('');
                    setIsAddExerciseOpen(true);
                  }}
                  className="h-8 px-2.5 text-xs bg-zinc-800 text-zinc-200"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Adicionar
                </Button>
              </div>

              {routineExercises.length === 0 ? (
                <div className="border border-dashed border-zinc-800 rounded-xl p-4 text-center">
                  <p className="text-xs text-zinc-500">
                    Nenhum exercício adicionado a este template.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[35vh] overflow-y-auto pr-0.5">
                  {routineExercises.map((re, idx) => {
                    const exercise = allExercises.find(e => e.id === re.exerciseId);
                    return (
                      <div key={idx} className="flex items-center gap-2 bg-zinc-800/80 border border-zinc-700/50 rounded-xl p-2.5">
                        <GripVertical className="h-4 w-4 text-zinc-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-zinc-100 truncate">{exercise?.name || 'Exercício'}</p>
                          <span className="text-[11px] text-zinc-400">{exercise?.targetMuscle}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-zinc-900 px-2 py-1 rounded-lg border border-zinc-700">
                          <input
                            type="number"
                            inputMode="numeric"
                            min="1"
                            max="15"
                            value={re.targetSets}
                            onChange={e => updateTargetSets(idx, parseInt(e.target.value) || 1)}
                            className="w-8 text-center text-sm font-semibold bg-transparent text-emerald-400 focus:outline-none"
                          />
                          <span className="text-[11px] text-zinc-500 font-medium">sets</span>
                        </div>
                        <button
                          onClick={() => removeExerciseFromRoutine(idx)}
                          aria-label="Remover da lista"
                          className="h-9 w-9 flex items-center justify-center rounded-lg text-zinc-400 hover:text-red-400 hover:bg-zinc-700 active:scale-95"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetDialog}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={!form.name.trim()}>
              {editingRoutine ? 'Guardar Alterações' : 'Criar Rotina'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add / Create Exercise to Routine Dialog */}
      <Dialog open={isAddExerciseOpen} onOpenChange={setIsAddExerciseOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isCreatingExercise ? 'Criar Novo Exercício' : 'Selecionar Exercício'}
            </DialogTitle>
            <DialogDescription>
              {isCreatingExercise
                ? 'Ficará gravado para sempre na tua biblioteca.'
                : 'Escolhe da tua biblioteca ou cria um exercício novo.'}
            </DialogDescription>
          </DialogHeader>

          {isCreatingExercise ? (
            <div className="space-y-4 py-2">
              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 block">
                  Nome do Exercício
                </label>
                <Input
                  placeholder="Ex: Leg Press 45º"
                  value={newExerciseForm.name}
                  onChange={e => setNewExerciseForm(f => ({ ...f, name: e.target.value }))}
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 block">
                  Grupo Muscular
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
                  onClick={handleCreateAndAddExerciseToRoutine}
                  disabled={!newExerciseForm.name.trim()}
                >
                  Criar e Adicionar
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  placeholder="Pesquisar exercício ou músculo..."
                  value={exerciseSearch}
                  onChange={e => setExerciseSearch(e.target.value)}
                  className="pl-9 bg-zinc-950"
                />
              </div>

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
                    : '+ Criar Novo Exercício'}
                </span>
              </button>

              <div className="space-y-1.5 max-h-[45vh] overflow-y-auto pr-0.5">
                {filteredExercises.length === 0 ? (
                  <div className="text-center py-6 text-zinc-500">
                    <p className="text-xs">Nenhum exercício encontrado com esse nome.</p>
                  </div>
                ) : (
                  filteredExercises.map(exercise => (
                    <button
                      key={exercise.id}
                      onClick={() => addExerciseToRoutine(exercise.id)}
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
    </div>
  );
}
