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
  onRemoveExercise,
}: ExerciseCardProps) {
  const [collapsed, setCollapsed] = useState(false);
  const completedSets = sets.filter(s => s.isCompleted).length;

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer active:bg-zinc-800/50"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-zinc-50 truncate">{exercise.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary">{exercise.targetMuscle}</Badge>
            {exercise.equipment && (
              <Badge variant="outline">{exercise.equipment}</Badge>
            )}
            <span className="text-xs text-zinc-500 ml-auto">
              {completedSets}/{sets.length} séries
            </span>
          </div>
        </div>
        <div className="ml-3">
          {collapsed ? (
            <ChevronDown className="h-5 w-5 text-zinc-500" />
          ) : (
            <ChevronUp className="h-5 w-5 text-zinc-500" />
          )}
        </div>
      </div>

      {/* Sets */}
      {!collapsed && (
        <div className="px-3 pb-3 space-y-2">
          {/* Header row */}
          <div className="flex items-center gap-3 px-3 py-1">
            <div className="w-8 text-center text-xs text-zinc-600 font-medium">SET</div>
            {previousSets.length > 0 && (
              <div className="hidden xs:block text-xs text-zinc-600 w-16 text-center">ANT.</div>
            )}
            <div className="flex-1 text-center text-xs text-zinc-600 font-medium">KG</div>
            <div className="flex-1 text-center text-xs text-zinc-600 font-medium">REPS</div>
            <div className="w-11"></div>
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
            />
          ))}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => onAddSet(exerciseIndex)}
              className="flex items-center justify-center gap-1 flex-1 h-10 rounded-xl bg-zinc-800 text-zinc-400 text-sm hover:bg-zinc-700 hover:text-zinc-200 transition-colors active:scale-[0.97]"
            >
              <Plus className="h-4 w-4" />
              Adicionar Série
            </button>
            <button
              onClick={() => onRemoveExercise(exerciseIndex)}
              className="flex items-center justify-center h-10 w-10 rounded-xl bg-zinc-800 text-red-400 hover:bg-red-500/20 transition-colors active:scale-[0.97]"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}
