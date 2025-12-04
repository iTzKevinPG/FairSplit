import { createBrowserRouter } from 'react-router-dom'
import EventDetailPage from '../../ui/pages/EventDetailPage'
import EventListPage from '../../ui/pages/EventListPage'
import NotFoundPage from '../../ui/pages/NotFoundPage'

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
    element: <NotFoundPage />,
  },
])

export default router
