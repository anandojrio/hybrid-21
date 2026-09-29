import { lazy, Suspense, type ReactNode } from 'react'
import { Navigate, type RouteObject } from 'react-router'
import TodayScreen from '@/features/today/today-screen'
import { AppShell } from './app-shell'

const screens = {
  plan: () => import('@/features/plan/plan-screen'),
  history: () => import('@/features/history/history-screen'),
  stats: () => import('@/features/stats/stats-screen'),
  library: () => import('@/features/library/library-screen'),
  settings: () => import('@/features/settings/settings-screen'),
  session: () => import('@/features/sessions/session-detail-screen'),
  exercise: () => import('@/features/library/exercise-detail-screen'),
}

/** Loads every screen in the background so switching tabs never waits on a chunk. */
export function preloadScreens() {
  // A failed preload is harmless: the screen loads again when opened.
  for (const load of Object.values(screens)) load().catch(() => undefined)
}

const PlanScreen = lazy(screens.plan)
const HistoryScreen = lazy(screens.history)
const StatsScreen = lazy(screens.stats)
const LibraryScreen = lazy(screens.library)
const SettingsScreen = lazy(screens.settings)
const SessionDetailScreen = lazy(screens.session)
const ExerciseDetailScreen = lazy(screens.exercise)
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
