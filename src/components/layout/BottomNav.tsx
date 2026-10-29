import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Dumbbell, ListChecks, Library, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', label: 'Treino', icon: Dumbbell },
  { path: '/routines', label: 'Rotinas', icon: ListChecks },
  { path: '/exercises', label: 'Exercícios', icon: Library },
  { path: '/analytics', label: 'Progresso', icon: BarChart3 },
];

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/95 backdrop-blur-lg border-t border-zinc-800 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors min-w-[64px] active:scale-95',
                isActive ? 'text-emerald-400' : 'text-zinc-500'
              )}
            >
              <item.icon className={cn('h-5 w-5', isActive && 'stroke-[2.5px]')} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
