import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router'

const DesignShowcase = import.meta.env.DEV
  ? lazy(() => import('./features/design/design-showcase'))
  : null

function Placeholder() {
  return (
    <main className="mx-auto min-h-dvh max-w-(--app-max-width) p-4">
      <h1 className="font-display text-2xl font-semibold">Hybrid 21</h1>
      <p className="text-ink-muted mt-2 text-base">The app shell arrives in Phase 5.</p>
    </main>
  )
}

const router = createBrowserRouter([
  { path: '/', element: <Placeholder /> },
  ...(DesignShowcase
    ? [
        {
          path: '/design',
          element: (
            <Suspense fallback={null}>
              <DesignShowcase />
            </Suspense>
          ),
        },
      ]
    : []),
])

export default function App() {
  return <RouterProvider router={router} />
}
