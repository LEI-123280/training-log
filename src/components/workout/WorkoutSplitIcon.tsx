import React from 'react';
import { cn } from '@/lib/utils';

export type WorkoutCategory = 'push' | 'pull' | 'legs' | 'cardio' | 'dot';

export function ChestIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Pectoral silhouette */}
      <path d="M4 7c2.5-2 5.5-2 8 0 2.5-2 5.5-2 8 0 0 4-1.5 7-8 10-6.5-3-8-6-8-10z" />
      {/* Sternum / center division */}
      <path d="M12 7.5v9.5" />
      {/* Lower chest shelf curves */}
      <path d="M6 12.5c1.8.8 3.8.8 6 0" />
      <path d="M12 12.5c2.2.8 4.2.8 6 0" />
    </svg>
  );
}

export function BackIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* V-Taper latissimus & trapezius silhouette */}
      <path d="M6 5h12l3 6c-2.5 4-5.5 7-9 10-3.5-3-6.5-6-9-10l3-6z" />
      {/* Spine / vertebrae column */}
      <path d="M12 5v16" />
      {/* Lat muscle wing definitions */}
      <path d="M12 9.5l4.5 3.5" />
      <path d="M12 9.5l-4.5 3.5" />
    </svg>
  );
}

export function LegsIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Gym shorts waist and leg openings */}
      <path d="M6 4h12l-1 6h-3.5l-1.5-2.5-1.5 2.5H7L6 4z" />
      {/* Left leg (quad, knee, calf, shoe) */}
      <path d="M8 10v5.5l-1 4.5h2.8l1-4.5V10" />
      {/* Right leg (quad, knee, calf, shoe) */}
      <path d="M16 10v5.5l1 4.5h-2.8l-1-4.5V10" />
    </svg>
  );
}

export function CardioIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      <path d="M3.22 12H9.5l1.5-3 2 6.5 1.5-3.5h6.28" />
    </svg>
  );
}

export function DotIcon({ className = "w-2 h-2" }: { className?: string }) {
  return (
    <span
      className={cn(
        "rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)] inline-block flex-shrink-0",
        className
      )}
    />
  );
}

export function getWorkoutCategory(nameOrRoutine?: string): WorkoutCategory {
  if (!nameOrRoutine) return 'dot';
  const text = nameOrRoutine.toLowerCase();

  // If user explicitly chose "Treino Livre" or "Sem Split" -> show dot
  if (text === 'treino livre' || text.includes('sem split') || text.includes('bolinha')) {
    return 'dot';
  }

  if (
    text.includes('leg') ||
    text.includes('perna') ||
    text.includes('squat') ||
    text.includes('quad') ||
    text.includes('isquio') ||
    text.includes('glúteo')
  ) {
    return 'legs';
  }
  if (
    text.includes('push') ||
    text.includes('peito') ||
    text.includes('chest') ||
    text.includes('supino') ||
    text.includes('ombro') ||
    text.includes('tríceps')
  ) {
    return 'push';
  }
  if (
    text.includes('pull') ||
    text.includes('costa') ||
    text.includes('back') ||
    text.includes('dorsal') ||
    text.includes('bíceps') ||
    text.includes('remada') ||
    text.includes('puxada')
  ) {
    return 'pull';
  }
  if (
    text.includes('cardio') ||
    text.includes('corrida') ||
    text.includes('hiit') ||
    text.includes('bike') ||
    text.includes('passadeira')
  ) {
    return 'cardio';
  }

  return 'dot';
}

export function getCategoryLabel(category: WorkoutCategory): string {
  switch (category) {
    case 'push':
      return 'Peito / Push';
    case 'pull':
      return 'Costas / Pull';
    case 'legs':
      return 'Pernas / Leg';
    case 'cardio':
      return 'Cardio';
    case 'dot':
    default:
      return 'Treino Livre (Bolinha)';
  }
}

export function WorkoutSplitIcon({
  category,
  className = "w-3.5 h-3.5",
  dotClassName = "w-2 h-2"
}: {
  category: WorkoutCategory;
  className?: string;
  dotClassName?: string;
}) {
  switch (category) {
    case 'legs':
      return <LegsIcon className={cn("text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.8)]", className)} />;
    case 'push':
      return <ChestIcon className={cn("text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.8)]", className)} />;
    case 'pull':
      return <BackIcon className={cn("text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.8)]", className)} />;
    case 'cardio':
      return <CardioIcon className={cn("text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.8)]", className)} />;
    case 'dot':
    default:
      return <DotIcon className={dotClassName} />;
  }
}
