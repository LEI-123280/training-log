import React from 'react';
import { Check, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WorkoutSet } from '@/types';

interface SetRowProps {
  set: WorkoutSet;
  previousSet?: WorkoutSet;
  setIndex: number;
  onComplete: (weight: number, reps: number) => void;
  onUncomplete: () => void;
  onUpdate: (updates: Partial<WorkoutSet>) => void;
  onRemove?: () => void;
}

export function SetRow({
  set,
  previousSet,
  setIndex,
  onComplete,
  onUncomplete,
  onUpdate,
  onRemove,
}: SetRowProps) {
  const ghostWeight = previousSet?.weightKg ?? 0;
  const ghostReps = previousSet?.reps ?? 0;

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const num = val === '' ? 0 : parseFloat(val);
    onUpdate({ weightKg: isNaN(num) ? 0 : num });
  };

  const handleRepsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const num = val === '' ? 0 : parseInt(val, 10);
    onUpdate({ reps: isNaN(num) ? 0 : num });
  };

  const handleToggleComplete = () => {
    if (set.isCompleted) {
      onUncomplete();
    } else {
      // If user left 0 or empty, fallback to ghost value if available
      const finalWeight = set.weightKg > 0 ? set.weightKg : ghostWeight;
      const finalReps = set.reps > 0 ? set.reps : (ghostReps > 0 ? ghostReps : 10);
      onComplete(finalWeight, finalReps);
    }
  };

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-2.5 py-2 rounded-xl transition-all border',
        set.isCompleted
          ? 'bg-emerald-950/20 border-emerald-500/30'
          : 'bg-zinc-900 border-zinc-800'
      )}
    >
      {/* Set Number */}
      <div className="w-7 text-center flex-shrink-0">
        <span
          className={cn(
            'text-xs font-black px-1.5 py-0.5 rounded-md',
            set.isCompleted
              ? 'bg-emerald-500 text-white'
              : 'bg-zinc-800 text-zinc-400'
          )}
        >
          {set.setNumber}
        </span>
      </div>

      {/* Previous Set Watermark Indicator */}
      <div className="w-14 text-center hidden sm:block flex-shrink-0">
        {previousSet ? (
          <span className="text-[11px] text-zinc-500 font-mono">
            {previousSet.weightKg}k×{previousSet.reps}
          </span>
        ) : (
          <span className="text-[11px] text-zinc-600">—</span>
        )}
      </div>

      {/* Weight Input (ALWAYS EDITABLE) */}
      <div className="flex-1 relative">
        <input
          type="number"
          inputMode="decimal"
          step="0.5"
          placeholder={ghostWeight > 0 ? String(ghostWeight) : '0'}
          value={set.weightKg > 0 ? set.weightKg : ''}
          onChange={handleWeightChange}
          className={cn(
            'w-full h-11 text-center text-base font-bold rounded-xl border bg-zinc-950/80 focus:ring-2 focus:ring-emerald-500/50 focus:outline-none transition-colors',
            set.isCompleted
              ? 'border-emerald-500/40 text-emerald-300'
              : 'border-zinc-700 text-zinc-50 placeholder:text-zinc-600'
          )}
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500 pointer-events-none font-medium">
          kg
        </span>
      </div>

      {/* Reps Input (ALWAYS EDITABLE) */}
      <div className="flex-1 relative">
        <input
          type="number"
          inputMode="numeric"
          step="1"
          placeholder={ghostReps > 0 ? String(ghostReps) : '0'}
          value={set.reps > 0 ? set.reps : ''}
          onChange={handleRepsChange}
          className={cn(
            'w-full h-11 text-center text-base font-bold rounded-xl border bg-zinc-950/80 focus:ring-2 focus:ring-emerald-500/50 focus:outline-none transition-colors',
            set.isCompleted
              ? 'border-emerald-500/40 text-emerald-300'
              : 'border-zinc-700 text-zinc-50 placeholder:text-zinc-600'
          )}
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500 pointer-events-none font-medium">
          reps
        </span>
      </div>

      {/* Complete Button (Checkmark) */}
      <button
        type="button"
        onClick={handleToggleComplete}
        aria-label={set.isCompleted ? 'Desmarcar série' : 'Concluir série'}
        className={cn(
          'flex items-center justify-center h-11 w-11 rounded-xl transition-all active:scale-90 flex-shrink-0',
          set.isCompleted
            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
        )}
      >
        <Check className={cn('h-5 w-5', set.isCompleted && 'stroke-[3]')} />
      </button>

      {/* Optional Delete Set Button */}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remover série"
          className="h-11 w-8 flex items-center justify-center text-zinc-600 hover:text-red-400 transition-colors flex-shrink-0"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
