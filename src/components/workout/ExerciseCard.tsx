import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SetRow } from './SetRow';
import type { WorkoutSet, Exercise } from '@/types';

interface ExerciseCardProps {
  exercise: Exercise;
  sets: WorkoutSet[];
  previousSets: WorkoutSet[];
  exerciseIndex: number;
  onCompleteSet: (exerciseIndex: number, setIndex: number, weight: number, reps: number) => void;
  onUncompleteSet: (exerciseIndex: number, setIndex: number) => void;
  onUpdateSet: (exerciseIndex: number, setIndex: number, updates: Partial<WorkoutSet>) => void;
  onAddSet: (exerciseIndex: number) => void;
  onRemoveSet?: (exerciseIndex: number, setIndex: number) => void;
  onRemoveExercise: (exerciseIndex: number) => void;
}

export function ExerciseCard({
  exercise,
  sets,
  previousSets,
  exerciseIndex,
  onCompleteSet,
  onUncompleteSet,
  onUpdateSet,
  onAddSet,
  onRemoveSet,
  onRemoveExercise,
}: ExerciseCardProps) {
  const [collapsed, setCollapsed] = useState(false);
  const completedSets = sets.filter(s => s.isCompleted).length;

  return (
    <Card className="overflow-hidden bg-zinc-900 border-zinc-800 shadow-md">
      {/* Header */}
      <div
        className="flex items-center justify-between p-3.5 cursor-pointer active:bg-zinc-800/40 select-none"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex-1 min-w-0 pr-2">
          <h3 className="text-base font-bold text-zinc-100 truncate">{exercise.name}</h3>
          <div className="flex items-center gap-1.5 mt-1">
            <Badge variant="secondary" className="bg-zinc-800 text-zinc-300 text-[11px]">
              {exercise.targetMuscle}
            </Badge>
            {exercise.equipment && (
              <Badge variant="outline" className="border-zinc-700 text-zinc-400 text-[11px]">
                {exercise.equipment}
              </Badge>
            )}
            <span className="text-xs font-semibold text-emerald-400 ml-auto">
              {completedSets}/{sets.length} séries
            </span>
          </div>
        </div>
        <div className="h-8 w-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-200">
          {collapsed ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
        </div>
      </div>

      {/* Sets */}
      {!collapsed && (
        <div className="px-3 pb-3 space-y-2 border-t border-zinc-800/60 pt-2.5">
          {/* Header row */}
          <div className="flex items-center gap-2 px-2.5 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
            <div className="w-7 text-center">Set</div>
            <div className="w-14 text-center hidden sm:block">Anterior</div>
            <div className="flex-1 text-center">Peso (kg)</div>
            <div className="flex-1 text-center">Reps</div>
            <div className="w-11 text-center">Status</div>
            {onRemoveSet && sets.length > 1 && <div className="w-8"></div>}
          </div>

          {sets.map((set, idx) => (
            <SetRow
              key={set.id}
              set={set}
              previousSet={previousSets[idx]}
              setIndex={idx}
              onComplete={(w, r) => onCompleteSet(exerciseIndex, idx, w, r)}
              onUncomplete={() => onUncompleteSet(exerciseIndex, idx)}
              onUpdate={(updates) => onUpdateSet(exerciseIndex, idx, updates)}
              onRemove={
                onRemoveSet && sets.length > 1
                  ? () => onRemoveSet(exerciseIndex, idx)
                  : undefined
              }
            />
          ))}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => onAddSet(exerciseIndex)}
              className="flex items-center justify-center gap-1.5 flex-1 h-11 rounded-xl bg-zinc-800 text-zinc-200 text-xs font-bold hover:bg-zinc-700 active:scale-[0.98] transition-all"
            >
              <Plus className="h-4 w-4 text-emerald-400" />
              Adicionar Série
            </button>
            <button
              type="button"
              onClick={() => onRemoveExercise(exerciseIndex)}
              aria-label="Remover exercício do treino"
              className="flex items-center justify-center h-11 w-11 rounded-xl bg-zinc-800/60 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 active:scale-95 transition-all"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}
