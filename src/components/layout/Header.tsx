import React from 'react';
import { Wifi, WifiOff, Cloud, CloudOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title: string;
  isOnline: boolean;
  isSyncing: boolean;
  isSyncEnabled: boolean;
}

export function Header({ title, isOnline, isSyncing, isSyncEnabled }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur-lg border-b border-zinc-800">
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        <h1 className="text-lg font-bold text-zinc-50">{title}</h1>
        <div className="flex items-center gap-2">
          {isSyncEnabled && (
            <div className="flex items-center gap-1.5">
              {isSyncing ? (
                <Loader2 className="h-4 w-4 text-amber-400 animate-spin" />
              ) : isOnline ? (
                <Cloud className="h-4 w-4 text-emerald-400" />
              ) : (
                <CloudOff className="h-4 w-4 text-zinc-500" />
              )}
            </div>
          )}
          <div className={cn(
            'flex items-center gap-1 text-xs px-2 py-1 rounded-full',
            isOnline 
              ? 'text-emerald-400 bg-emerald-500/10' 
              : 'text-zinc-500 bg-zinc-800'
          )}>
            {isOnline ? (
              <><Wifi className="h-3 w-3" /> Online</>
            ) : (
              <><WifiOff className="h-3 w-3" /> Offline</>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
