import React, { useState, useEffect } from 'react';
import { Check, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WorkoutSet } from '@/types';

interface SetRowProps {
  set: WorkoutSet;
  previousSet?: WorkoutSet;
  setIndex: number;
  onComplete: (weight: number, reps: number) => void;
  onUncomplete: () => void;
  onUpdate: (updates: Partial<WorkoutSet>) => void;
}

export function SetRow({ set, previousSet, setIndex, onComplete, onUncomplete, onUpdate }: SetRowProps) {
  const [weight, setWeight] = useState<string>(set.weightKg > 0 ? String(set.weightKg) : '');
  const [reps, setReps] = useState<string>(set.reps > 0 ? String(set.reps) : '');

  useEffect(() => {
    if (set.isCompleted) {
      setWeight(String(set.weightKg));
      setReps(String(set.reps));
    }
  }, [set.isCompleted, set.weightKg, set.reps]);

  const handleComplete = () => {
    if (set.isCompleted) {
      onUncomplete();
      return;
    }

    // Use previous values as defaults if current fields are empty
    const finalWeight = weight !== '' ? parseFloat(weight) : (previousSet?.weightKg || 0);
    const finalReps = reps !== '' ? parseInt(reps) : (previousSet?.reps || 0);

    if (finalWeight >= 0 && finalReps > 0) {
      setWeight(String(finalWeight));
      setReps(String(finalReps));
      onComplete(finalWeight, finalReps);
    }
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-xl transition-colors',
        set.isCompleted ? 'bg-emerald-500/10' : 'bg-zinc-800/50'
      )}
    >
      {/* Set Number */}
      <div className="w-8 text-center">
        <span className={cn(
          'text-sm font-bold',
          set.isCompleted ? 'text-emerald-400' : 'text-zinc-500'
        )}>
          {set.setNumber}
        </span>
      </div>

      {/* Previous values indicator */}
      {previousSet && !set.isCompleted && (
        <div className="hidden xs:flex text-xs text-zinc-600 w-16 text-center">
          {previousSet.weightKg}×{previousSet.reps}
        </div>
      )}

      {/* Weight Input */}
      <div className="flex-1">
        <input
          type="number"
          inputMode="decimal"
          step="0.5"
          placeholder={previousSet ? String(previousSet.weightKg) : '0'}
          value={weight}
          onChange={e => setWeight(e.target.value)}
          disabled={set.isCompleted}
          className={cn(
            'w-full h-11 text-center text-base font-medium rounded-xl border-0 bg-zinc-900 focus:ring-2 focus:ring-emerald-500/50 focus:outline-none transition-colors',
            set.isCompleted 
              ? 'text-emerald-400 opacity-80' 
              : 'text-zinc-50 placeholder:text-zinc-600'
          )}
        />
        <div className="text-[10px] text-zinc-600 text-center mt-0.5">kg</div>
      </div>

      {/* Reps Input */}
      <div className="flex-1">
        <input
          type="number"
          inputMode="numeric"
          placeholder={previousSet ? String(previousSet.reps) : '0'}
          value={reps}
          onChange={e => setReps(e.target.value)}
          disabled={set.isCompleted}
          className={cn(
            'w-full h-11 text-center text-base font-medium rounded-xl border-0 bg-zinc-900 focus:ring-2 focus:ring-emerald-500/50 focus:outline-none transition-colors',
            set.isCompleted 
              ? 'text-emerald-400 opacity-80' 
              : 'text-zinc-50 placeholder:text-zinc-600'
          )}
        />
        <div className="text-[10px] text-zinc-600 text-center mt-0.5">reps</div>
      </div>

      {/* Complete Button */}
      <button
        onClick={handleComplete}
        className={cn(
          'flex items-center justify-center h-11 w-11 rounded-xl transition-all active:scale-95',
          set.isCompleted
            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
        )}
      >
        {set.isCompleted ? <Check className="h-5 w-5" /> : <Check className="h-5 w-5" />}
      </button>
    </div>
  );
}
