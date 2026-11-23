import React, { useState, useMemo } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  subMonths,
  addMonths,
} from 'date-fns';
import { pt } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Dumbbell, Trash2, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { WorkoutSession } from '@/types';

export interface DetailedWorkoutSession extends WorkoutSession {
  routineName?: string;
  totalSets: number;
  tonnage: number;
  exerciseNames?: string[];
}

interface WorkoutCalendarProps {
  sessions: DetailedWorkoutSession[];
  onSelectSession: (session: DetailedWorkoutSession) => void;
  onDeleteSession: (sessionId: string, e?: React.MouseEvent) => void;
}

export function WorkoutCalendar({
  sessions,
  onSelectSession,
  onDeleteSession,
}: WorkoutCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Map sessions by date string YYYY-MM-DD
  const sessionsByDate = useMemo(() => {
    const map = new Map<string, DetailedWorkoutSession[]>();
    for (const session of sessions) {
      const dateKey = format(new Date(session.startTime), 'yyyy-MM-dd');
      const list = map.get(dateKey) || [];
      list.push(session);
      map.set(dateKey, list);
    }
    return map;
  }, [sessions]);

  // Generate calendar days for the current month view (Monday to Sunday)
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentMonth]);

  // Month statistics
  const currentMonthStats = useMemo(() => {
    let count = 0;
    let totalKg = 0;
    for (const s of sessions) {
      if (isSameMonth(new Date(s.startTime), currentMonth)) {
        count += 1;
        totalKg += s.tonnage || 0;
      }
    }
    return { count, totalKg };
  }, [sessions, currentMonth]);

  // Sessions for the currently selected date
  const selectedDayKey = format(selectedDate, 'yyyy-MM-dd');
  const selectedDaySessions = sessionsByDate.get(selectedDayKey) || [];

  const handlePrevMonth = () => setCurrentMonth(prev => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));
  const handleToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
  };

  const weekDayLabels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  return (
    <Card className="bg-zinc-900 border-zinc-800 shadow-xl overflow-hidden">
      {/* Month Navigation Header */}
      <div className="p-4 border-b border-zinc-800/80">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-zinc-100 capitalize">
              {format(currentMonth, 'MMMM yyyy', { locale: pt })}
            </h3>
            {!isSameMonth(currentMonth, new Date()) && (
              <button
                type="button"
                onClick={handleToday}
                className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-0.5 rounded-md transition-colors"
              >
                Voltar a Hoje
              </button>
            )}
          </div>

          {/* Previous / Next Month Arrows */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              aria-label="Mês Anterior"
              className="h-9 w-9 flex items-center justify-center rounded-xl bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 active:scale-95 transition-all"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              aria-label="Mês Seguinte"
              className="h-9 w-9 flex items-center justify-center rounded-xl bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 active:scale-95 transition-all"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Monthly Summary pill */}
        <div className="flex items-center gap-3 text-xs text-zinc-400">
          <span>
            <strong className="text-emerald-400 font-bold">{currentMonthStats.count}</strong> treinos neste mês
          </span>
          {currentMonthStats.totalKg > 0 && (
            <>
              <span>·</span>
              <span>
                <strong className="text-zinc-200 font-mono">
                  {currentMonthStats.totalKg >= 1000
                    ? `${(currentMonthStats.totalKg / 1000).toFixed(1)}t`
                    : `${Math.round(currentMonthStats.totalKg)}kg`}
                </strong> tonelagem
              </span>
            </>
          )}
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 px-3 pt-3 pb-1 text-center">
        {weekDayLabels.map(label => (
          <div key={label} className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
            {label}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 p-3">
        {calendarDays.map(day => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const daySessions = sessionsByDate.get(dateKey) || [];
          const hasWorkout = daySessions.length > 0;
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentDay = isToday(day);
          const isMonthDay = isSameMonth(day, currentMonth);

          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => {
                setSelectedDate(day);
                if (!isSameMonth(day, currentMonth)) {
                  setCurrentMonth(day);
                }
              }}
              className={cn(
                'relative flex flex-col items-center justify-center h-12 rounded-xl transition-all select-none',
                // Month dimming
                !isMonthDay && 'text-zinc-600 opacity-40',
                isMonthDay && !isSelected && 'text-zinc-200 hover:bg-zinc-800/60',
                // Today indicator
                isCurrentDay && !isSelected && 'border border-emerald-500/40 bg-emerald-500/5 font-bold',
                // Selected state
                isSelected && 'bg-zinc-800 border-2 border-emerald-500 text-white font-extrabold shadow-md shadow-black/40',
                hasWorkout && isSelected && 'border-emerald-400'
              )}
            >
              <span className="text-xs leading-none">
                {format(day, 'd')}
              </span>

              {/* Green Dot Indicator for Days with Workout */}
              <div className="h-3 flex items-center justify-center mt-1">
                {hasWorkout ? (
                  <span
                    className={cn(
                      'w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)] transition-transform',
                      isSelected && 'scale-125'
                    )}
                    title={`${daySessions.length} treino(s)`}
                  />
                ) : (
                  <span className="w-1.5 h-1.5 opacity-0" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Day Workout Details Panel */}
      <div className="border-t border-zinc-800/80 bg-zinc-950/40 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-emerald-400" />
            <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider capitalize">
              {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: pt })}
            </h4>
          </div>
          {selectedDaySessions.length > 0 && (
            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
              {selectedDaySessions.length} treino{selectedDaySessions.length > 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        {selectedDaySessions.length === 0 ? (
          <div className="py-5 text-center text-zinc-500">
            <Dumbbell className="h-6 w-6 mx-auto mb-1.5 opacity-30 text-emerald-400" />
            <p className="text-xs text-zinc-400 font-medium">Sem treinos registados neste dia</p>
            <p className="text-[11px] text-zinc-600 mt-0.5">Toca num dia com a bolinha verde para veres o que treinaste.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {selectedDaySessions.map(session => (
              <div
                key={session.id}
                onClick={() => onSelectSession(session)}
                className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 cursor-pointer active:scale-[0.99] transition-all flex items-center justify-between shadow-sm"
              >
                <div className="min-w-0 flex-1 pr-3">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-zinc-100 truncate">
                      {session.name || session.routineName || 'Treino Livre'}
                    </p>
                    <span className="text-[11px] text-zinc-500 font-mono">
                      {format(new Date(session.startTime), 'HH:mm')}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1.5 flex-wrap">
                    <span className="text-zinc-200 font-semibold">{session.totalSets} séries</span>
                    {session.tonnage > 0 && (
                      <>
                        <span>·</span>
                        <span className="text-emerald-400 font-mono font-semibold">
                          {Math.round(session.tonnage).toLocaleString('pt-PT')} kg
                        </span>
                      </>
                    )}
                  </p>

                  {session.notes && (
                    <p className="text-xs text-zinc-500 italic mt-1 line-clamp-1">
                      "{session.notes}"
                    </p>
                  )}
                </div>

                <div className="h-9 w-9 flex items-center justify-center text-zinc-400 flex-shrink-0">
                  <ArrowRight className="h-4 w-4 text-emerald-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
