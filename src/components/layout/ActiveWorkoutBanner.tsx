import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useWorkout } from '@/hooks/useWorkout';
import { Dumbbell, ArrowRight } from 'lucide-react';

export function ActiveWorkoutBanner() {
  const { isActive, elapsedTime, exercises } = useWorkout();
  const navigate = useNavigate();
  const location = useLocation();

  if (!isActive || location.pathname === '/') {
    return null;
  }

  const formatElapsed = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const completedSets = exercises.reduce(
    (sum, ex) => sum + ex.sets.filter(s => s.isCompleted).length,
    0
  );

  return (
    <div className="fixed bottom-16 left-0 right-0 z-40 px-3 pb-1 pointer-events-none">
      <div className="max-w-lg mx-auto pointer-events-auto">
        <button
          onClick={() => navigate('/')}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white p-3 rounded-2xl shadow-2xl flex items-center justify-between active:scale-[0.98] transition-all border border-emerald-400/30 backdrop-blur-md"
        >
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
            <div className="text-left">
              <p className="text-xs font-bold leading-tight">Treino em Curso ({formatElapsed(elapsedTime)})</p>
              <p className="text-[10px] text-emerald-100 font-medium">
                {exercises.length} exercícios · {completedSets} séries feitas
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold bg-white/20 px-2.5 py-1.5 rounded-xl">
            <span>Voltar ao Treino</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </button>
      </div>
    </div>
  );
}
