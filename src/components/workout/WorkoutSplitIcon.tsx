import React from 'react';
import { cn } from '@/lib/utils';

export type WorkoutCategory = 'push' | 'pull' | 'legs' | 'cardio' | 'dot';

/**
 * Chest / Peito Icon
 * Inspired directly by the user's reference image:
 * Front torso with clavicle V-notch, defined pectorals with center sternum dip,
 * serratus / oblique lines, and abdominal center line.
 */
export function ChestIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Neck lines */}
      <path d="M9.5 2.5 L8.5 4.5" />
      <path d="M14.5 2.5 L15.5 4.5" />

      {/* Shoulders / Traps */}
      <path d="M8.5 4.5 C6.5 5.5 4.5 6.5 2.5 8.5" />
      <path d="M15.5 4.5 C17.5 5.5 19.5 6.5 21.5 8.5" />

      {/* Clavicle / Collarbone V-bracket */}
      <path d="M7.5 6.5 L12 8.5 L16.5 6.5" />

      {/* Signature Pectoral chest curve with sternum peak */}
      <path d="M4.5 11.5 L5.5 13.5 C6.5 14.5 8 14.8 10 14.8 C11.2 14.8 11.7 14 12 11.5 C12.3 14 12.8 14.8 14 14.8 C16 14.8 17.5 14.5 18.5 13.5 L19.5 11.5" />

      {/* Obliques / Lats / Waist contours */}
      <path d="M4.8 14 C5.5 15.5 6.5 18 6.8 21.5" />
      <path d="M19.2 14 C18.5 15.5 17.5 18 17.2 21.5" />

      {/* Inner serratus muscle cuts */}
      <path d="M4.8 14.8 C6.2 15.8 6.2 18.5 5.5 19.8" />
      <path d="M19.2 14.8 C17.8 15.8 17.8 18.5 18.5 19.8" />

      {/* Abdominal center line & navel */}
      <path d="M12 17.5 V20" />
      <path d="M12 21.5 V21.8" />
    </svg>
  );
}

/**
 * Back / Costas Icon
 * Inspired directly by the user's reference image:
 * Upper back with neck, trapezius slope, deltoid accents, center spine line,
 * dual curved scapular arches, lat sweeps down to waistband.
 */
export function BackIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Neck lines */}
      <path d="M10 2.5 C9.8 4 9.2 5 8.5 5.5" />
      <path d="M14 2.5 C14.2 4 14.8 5 15.5 5.5" />

      {/* Traps slope & shoulders */}
      <path d="M8.5 5.5 C6 5.8 4 7 2.5 9" />
      <path d="M4.5 7 C5.5 6.5 6.8 6.2 8 6.2" />
      <path d="M15.5 5.5 C18 5.8 20 7 21.5 9" />
      <path d="M19.5 7 C18.5 6.5 17.2 6.2 16 6.2" />

      {/* Dual scapular / upper back arches */}
      <path d="M11 9 C9.5 11 8 13 6.8 15.5" />
      <path d="M13 9 C14.5 11 16 13 17.2 15.5" />

      {/* Latissimus sweeps down to waist */}
      <path d="M3.8 11.5 C3.8 13.5 4.5 16 6.5 18" />
      <path d="M2.5 15.5 L4.2 14" />
      <path d="M20.2 11.5 C20.2 13.5 19.5 16 17.5 18" />
      <path d="M21.5 15.5 L19.8 14" />

      {/* Center spine */}
      <path d="M12 12 V18" />
      <path d="M12 19.8 V21.2" />

      {/* Lower back waistband */}
      <path d="M6.5 18 V21.5 H17.5 V18" />
      <path d="M9.5 19 L11 17.5" />
      <path d="M14.5 19 L13 17.5" />
    </svg>
  );
}

/**
 * Legs / Pernas Icon
 * Inspired directly by the user's reference image:
 * Muscular legs outline with underwear/groin waistband, massive quad sweep,
 * knees, calf curve, ankles, flat feet pointing outward, and quad/calf muscle lines.
 */
export function LegsIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Top waistband curve */}
      <path d="M7 3.5 C9 4 10.5 4.5 12 4.5 C13.5 4.5 15 4 17 3.5" />
      {/* Groin underwear V-line */}
      <path d="M9.8 3.8 C10.8 5.8 13.2 5.8 14.2 3.8" />

      {/* Left leg complete outline: hip -> quad -> knee -> calf -> ankle -> flat foot -> inner leg */}
      <path d="M7 3.5 C4.8 6.5 4.2 9.5 4.8 12.5 C5.2 14 5.8 15 5.8 16.5 C5.8 18 5.2 19 4.8 19.8 C4.5 20.3 4 20.5 3 20.5 H8.5 C8.5 18 8.8 15.5 9 13.5 C9.5 11 10.5 8 11 5.8" />

      {/* Right leg complete outline: hip -> quad -> knee -> calf -> ankle -> flat foot -> inner leg */}
      <path d="M17 3.5 C19.2 6.5 19.8 9.5 19.2 12.5 C18.8 14 18.2 15 18.2 16.5 C18.2 18 18.8 19 19.2 19.8 C19.5 20.3 20 20.5 21 20.5 H15.5 C15.5 18 15.2 15.5 15 13.5 C14.5 11 13.5 8 13 5.8" />

      {/* Left quad definition slashes */}
      <path d="M6.8 8 C7.5 9.5 8.2 11 8.2 12" />
      <path d="M9 8.5 C8.8 10 8.5 11.5 8.5 12" />

      {/* Right quad definition slashes */}
      <path d="M17.2 8 C16.5 9.5 15.8 11 15.8 12" />
      <path d="M15 8.5 C15.2 10 15.5 11.5 15.5 12" />

      {/* Left & right calf definition lines */}
      <path d="M6.8 16 V18" />
      <path d="M17.2 16 V18" />
    </svg>
  );
}

/**
 * Cardio Icon
 * Heart with ECG pulse wave line
 */
export function CardioIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      <path d="M3.22 12H9.5l1.5-3 2 6.5 1.5-3.5h6.28" />
    </svg>
  );
}

/**
 * Default Dot Icon (Bolinha)
 */
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
  const text = nameOrRoutine.toLowerCase().trim();

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
