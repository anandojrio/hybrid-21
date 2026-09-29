import { MotionConfig } from 'motion/react'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { routes } from './app/routes'
import { StorageProvider } from './app/storage-provider'

const router = createBrowserRouter(routes)

export default function App() {
  return (
    // "user" honours prefers-reduced-motion for every motion animation.
    <MotionConfig reducedMotion="user">
      <StorageProvider>
        <RouterProvider router={router} />
      </StorageProvider>
    </MotionConfig>
  )
}
