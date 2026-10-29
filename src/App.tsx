import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { ActiveWorkoutPage } from '@/pages/ActiveWorkout';
import { RoutinesPage } from '@/pages/Routines';
import { ExercisesPage } from '@/pages/Exercises';
import { AnalyticsPage } from '@/pages/Analytics';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { db } from '@/db';
import { v4 as uuidv4 } from 'uuid';

function getTitleForRoute(pathname: string): string {
  switch (pathname) {
    case '/':
      return 'GymLog';
    case '/routines':
      return 'Rotinas';
    case '/exercises':
      return 'Exercícios';
    case '/analytics':
      return 'Progresso';
    default:
      return 'GymLog';
  }
}

// Optional quick seed helper if user wants sample templates
async function seedDefaultIfEmpty() {
  const count = await db.exercises.count();
  if (count === 0) {
    const starterExercises = [
      { id: uuidv4(), name: 'Supino Reto com Barra', targetMuscle: 'Peito', equipment: 'Barra', createdAt: new Date() },
      { id: uuidv4(), name: 'Supino Inclinado com Halteres', targetMuscle: 'Peito', equipment: 'Haltere', createdAt: new Date() },
      { id: uuidv4(), name: 'Puxada na Polia Alta', targetMuscle: 'Costas', equipment: 'Cabo', createdAt: new Date() },
      { id: uuidv4(), name: 'Remada Curvada com Barra', targetMuscle: 'Costas', equipment: 'Barra', createdAt: new Date() },
      { id: uuidv4(), name: 'Desenvolvimento com Halteres', targetMuscle: 'Ombros', equipment: 'Haltere', createdAt: new Date() },
      { id: uuidv4(), name: 'Elevações Laterais', targetMuscle: 'Ombros', equipment: 'Haltere', createdAt: new Date() },
      { id: uuidv4(), name: 'Agachamento com Barra', targetMuscle: 'Quadríceps', equipment: 'Barra', createdAt: new Date() },
      { id: uuidv4(), name: 'Leg Press 45º', targetMuscle: 'Quadríceps', equipment: 'Máquina', createdAt: new Date() },
      { id: uuidv4(), name: 'Cadeira Flexora', targetMuscle: 'Isquiotibiais', equipment: 'Máquina', createdAt: new Date() },
      { id: uuidv4(), name: 'Curl de Bíceps com Halteres', targetMuscle: 'Bíceps', equipment: 'Haltere', createdAt: new Date() },
      { id: uuidv4(), name: 'Tríceps na Polia (Corda)', targetMuscle: 'Tríceps', equipment: 'Cabo', createdAt: new Date() },
      { id: uuidv4(), name: 'Elevação de Gémeos em Pé', targetMuscle: 'Gémeos', equipment: 'Máquina', createdAt: new Date() },
    ];
    await db.exercises.bulkAdd(starterExercises);

    // Also seed sample Push routine
    const pushRoutineId = uuidv4();
    await db.routines.add({
      id: pushRoutineId,
      name: 'Push A - Peito, Ombro e Tríceps',
      description: 'Treino de empurrar focado em peitoral e deltoide',
      createdAt: new Date(),
    });

    const pushExercises = [
      { id: uuidv4(), routineId: pushRoutineId, exerciseId: starterExercises[1].id, orderIndex: 0, targetSets: 4 },
      { id: uuidv4(), routineId: pushRoutineId, exerciseId: starterExercises[0].id, orderIndex: 1, targetSets: 3 },
      { id: uuidv4(), routineId: pushRoutineId, exerciseId: starterExercises[4].id, orderIndex: 2, targetSets: 3 },
      { id: uuidv4(), routineId: pushRoutineId, exerciseId: starterExercises[5].id, orderIndex: 3, targetSets: 4 },
      { id: uuidv4(), routineId: pushRoutineId, exerciseId: starterExercises[10].id, orderIndex: 4, targetSets: 3 },
    ];
    await db.routineExercises.bulkAdd(pushExercises);
  }
}

function MainLayout() {
  const location = useLocation();
  const { isOnline, isSyncing, isSyncEnabled } = useOnlineStatus();
  const title = getTitleForRoute(location.pathname);

  useEffect(() => {
    seedDefaultIfEmpty();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col antialiased selection:bg-emerald-500/30 selection:text-emerald-300">
      <Header
        title={title}
        isOnline={isOnline}
        isSyncing={isSyncing}
        isSyncEnabled={isSyncEnabled}
      />

      <main className="flex-1 w-full max-w-lg mx-auto">
        <Routes>
          <Route path="/" element={<ActiveWorkoutPage />} />
          <Route path="/routines" element={<RoutinesPage />} />
          <Route path="/exercises" element={<ExercisesPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
        </Routes>
      </main>

      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <MainLayout />
    </BrowserRouter>
  );
}
