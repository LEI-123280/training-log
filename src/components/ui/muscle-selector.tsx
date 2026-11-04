import React from 'react';
import { Check } from 'lucide-react';
import { MUSCLE_GROUPS } from '@/types';
import { cn } from '@/lib/utils';

interface MuscleSelectorProps {
  selectedMuscles: string[];
  onChange: (muscles: string[]) => void;
  className?: string;
  label?: string;
  helperText?: string;
}

export function MuscleSelector({
  selectedMuscles,
  onChange,
  className,
  label = 'Grupos Musculares',
  helperText = 'Podes escolher múltiplos (ex.: Agachamento = Quadríceps + Glúteos)',
}: MuscleSelectorProps) {
  const toggleMuscle = (muscle: string) => {
    if (selectedMuscles.includes(muscle)) {
      // Don't allow removing if it's the only one left, or allow it and validate
      onChange(selectedMuscles.filter(m => m !== muscle));
    } else {
      onChange([...selectedMuscles, muscle]);
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
          {label}
        </label>
        <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
          {selectedMuscles.length} selecionado{selectedMuscles.length === 1 ? '' : 's'}
        </span>
      </div>

      {helperText && (
        <p className="text-[11px] text-zinc-500 italic">
          {helperText}
        </p>
      )}

      <div className="flex flex-wrap gap-1.5 pt-1">
        {MUSCLE_GROUPS.map(muscle => {
          const isSelected = selectedMuscles.includes(muscle);
          return (
            <button
              key={muscle}
              type="button"
              onClick={() => toggleMuscle(muscle)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all min-h-[38px] active:scale-95 border',
                isSelected
                  ? 'bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-950/40'
                  : 'bg-zinc-850 bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:text-zinc-100'
              )}
            >
              {isSelected ? (
                <Check className="h-3.5 w-3.5 text-white stroke-[3]" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
              )}
              <span>{muscle}</span>
            </button>
          );
        })}
      </div>

      {selectedMuscles.length === 0 && (
        <p className="text-[11px] text-amber-400/90 pt-1">
          ⚠️ Seleciona pelo menos um grupo muscular.
        </p>
      )}
    </div>
  );
}
