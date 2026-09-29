import { lazy, Suspense, type ReactNode } from 'react'
import { Navigate, type RouteObject } from 'react-router'
import TodayScreen from '@/features/today/today-screen'
import { AppShell } from './app-shell'

const PlanScreen = lazy(() => import('@/features/plan/plan-screen'))
const HistoryScreen = lazy(() => import('@/features/history/history-screen'))
const StatsScreen = lazy(() => import('@/features/stats/stats-screen'))
const LibraryScreen = lazy(() => import('@/features/library/library-screen'))
const SettingsScreen = lazy(() => import('@/features/settings/settings-screen'))
const SessionDetailScreen = lazy(() => import('@/features/sessions/session-detail-screen'))
const ExerciseDetailScreen = lazy(() => import('@/features/library/exercise-detail-screen'))
const DesignShowcase = import.meta.env.DEV
  ? lazy(() => import('@/features/design/design-showcase'))
  : null

const suspend = (node: ReactNode) => <Suspense fallback={null}>{node}</Suspense>

export const routes: RouteObject[] = [
  {
    element: <AppShell />,
    children: [
      { index: true, element: <TodayScreen /> },
      { path: 'plan', element: suspend(<PlanScreen />) },
      { path: 'history', element: suspend(<HistoryScreen />) },
      { path: 'stats', element: suspend(<StatsScreen />) },
      { path: 'library', element: suspend(<LibraryScreen />) },
      { path: 'library/:exerciseId', element: suspend(<ExerciseDetailScreen />) },
      { path: 'settings', element: suspend(<SettingsScreen />) },
      { path: 'session/:sessionId', element: suspend(<SessionDetailScreen />) },
    ],
  },
  ...(DesignShowcase ? [{ path: 'design', element: suspend(<DesignShowcase />) }] : []),
  { path: '*', element: <Navigate to="/" replace /> },
]
