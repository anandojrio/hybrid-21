import { createBrowserRouter, RouterProvider } from 'react-router'
import { routes } from './app/routes'
import { StorageProvider } from './app/storage-provider'

const router = createBrowserRouter(routes)

export default function App() {
  return (
    <StorageProvider>
      <RouterProvider router={router} />
    </StorageProvider>
  )
}
