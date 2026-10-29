import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Search, Edit2, Trash2, Dumbbell } from 'lucide-react';
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
import { MUSCLE_GROUPS, EQUIPMENT_TYPES, type Exercise } from '@/types';

export function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [search, setSearch] = useState('');
  const [filterMuscle, setFilterMuscle] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [form, setForm] = useState({ name: '', targetMuscle: '', equipment: '' });

  const loadExercises = async () => {
    const all = await db.exercises.orderBy('name').toArray();
    setExercises(all);
  };

  useEffect(() => {
    loadExercises();
  }, []);

  const filtered = exercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    const matchesMuscle = !filterMuscle || ex.targetMuscle === filterMuscle;
    return matchesSearch && matchesMuscle;
  });

  const handleSave = async () => {
    if (!form.name || !form.targetMuscle) return;

    if (editingExercise) {
      await db.exercises.update(editingExercise.id, {
        name: form.name.trim(),
        targetMuscle: form.targetMuscle,
        equipment: form.equipment || 'Outro',
      });
    } else {
      await db.exercises.add({
        id: uuidv4(),
        name: form.name.trim(),
        targetMuscle: form.targetMuscle,
        equipment: form.equipment || 'Outro',
        createdAt: new Date(),
      });
    }

    setForm({ name: '', targetMuscle: '', equipment: '' });
    setEditingExercise(null);
    setIsDialogOpen(false);
    await loadExercises();
  };

  const handleEdit = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setForm({
      name: exercise.name,
      targetMuscle: exercise.targetMuscle,
      equipment: exercise.equipment || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tens a certeza que queres eliminar este exercício?')) {
      await db.exercises.delete(id);
      await loadExercises();
    }
  };

  const openNewDialog = () => {
    setEditingExercise(null);
    setForm({ name: '', targetMuscle: '', equipment: '' });
    setIsDialogOpen(true);
  };

  return (
    <div className="px-4 pb-28 pt-3 max-w-lg mx-auto">
      {/* Search & Filter */}
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Pesquisar exercício..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Muscle filter chips */}
      <div className="flex gap-1.5 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-none">
        <button
          onClick={() => setFilterMuscle('')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors min-h-[36px] flex items-center ${
            !filterMuscle
              ? 'bg-emerald-600 text-white font-semibold'
              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
          }`}
        >
          Todos
        </button>
        {MUSCLE_GROUPS.map(muscle => (
          <button
            key={muscle}
            onClick={() => setFilterMuscle(filterMuscle === muscle ? '' : muscle)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors min-h-[36px] flex items-center ${
              filterMuscle === muscle
                ? 'bg-emerald-600 text-white font-semibold'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            {muscle}
          </button>
        ))}
      </div>

      {/* Exercise List */}
      <div className="space-y-2 mt-1">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
            <Dumbbell className="h-12 w-12 mb-3 opacity-40 text-emerald-500" />
            <p className="text-sm font-medium text-zinc-300">Nenhum exercício encontrado</p>
            <p className="text-xs text-zinc-500 mt-1">
              {search || filterMuscle
                ? 'Tenta mudar os filtros de pesquisa.'
                : 'Toca no botão "+" para adicionar o teu primeiro exercício!'}
            </p>
          </div>
        ) : (
          filtered.map(exercise => (
            <Card key={exercise.id} className="p-3 bg-zinc-900 border-zinc-800">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0 pr-2">
                  <p className="font-semibold text-zinc-100 truncate text-base">{exercise.name}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <Badge variant="secondary" className="bg-zinc-800 text-zinc-300">
                      {exercise.targetMuscle}
                    </Badge>
                    {exercise.equipment && (
                      <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                        {exercise.equipment}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(exercise)}
                    aria-label="Editar"
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 active:scale-95 transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(exercise.id)}
                    aria-label="Eliminar"
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-zinc-400 hover:text-red-400 hover:bg-red-500/10 active:scale-95 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* FAB */}
      <button
        onClick={openNewDialog}
        aria-label="Novo Exercício"
        className="fixed right-5 bottom-20 h-14 w-14 rounded-full bg-emerald-600 text-white shadow-xl shadow-emerald-600/30 flex items-center justify-center hover:bg-emerald-500 transition-transform active:scale-90 z-40"
      >
        <Plus className="h-7 w-7" />
      </button>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingExercise ? 'Editar Exercício' : 'Novo Exercício'}
            </DialogTitle>
            <DialogDescription>
              {editingExercise
                ? 'Atualiza os dados do exercício.'
                : 'Adiciona um exercício à tua biblioteca pessoal.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 block">
                Nome do Exercício
              </label>
              <Input
                placeholder="Ex: Supino Inclinado com Halteres"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 block">
                Grupo Muscular Principal
              </label>
              <Select
                value={form.targetMuscle}
                onChange={e => setForm(f => ({ ...f, targetMuscle: e.target.value }))}
                placeholder="Seleciona o músculo principal"
                options={MUSCLE_GROUPS.map(m => ({ value: m, label: m }))}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 block">
                Equipamento
              </label>
              <Select
                value={form.equipment}
                onChange={e => setForm(f => ({ ...f, equipment: e.target.value }))}
                placeholder="Tipo de equipamento"
                options={EQUIPMENT_TYPES.map(e => ({ value: e, label: e }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={!form.name.trim() || !form.targetMuscle}>
              {editingExercise ? 'Guardar Alterações' : 'Criar Exercício'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
