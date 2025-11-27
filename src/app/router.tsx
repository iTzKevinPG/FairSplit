import { createBrowserRouter, Navigate } from 'react-router-dom'
import EventDetailPage from '../ui/pages/EventDetailPage'
import EventListPage from '../ui/pages/EventListPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <EventListPage />,
  },
  {
    path: '/events/:eventId',
    element: <EventDetailPage />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])

export default router
