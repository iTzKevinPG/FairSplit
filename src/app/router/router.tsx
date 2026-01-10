import { createBrowserRouter } from 'react-router-dom'

const router = createBrowserRouter([
  {
    path: '/',
    lazy: async () => {
      const { default: EventListPage } = await import('../../ui/pages/EventListPage')
      return { Component: EventListPage }
    },
  },
  {
    path: '/events/:eventId',
    lazy: async () => {
      const { default: EventDetailPage } = await import('../../ui/pages/EventDetailPage')
      return { Component: EventDetailPage }
    },
  },
  {
    path: '/events/:eventId/overview',
    lazy: async () => {
      const { default: EventOverviewPage } = await import('../../ui/pages/EventOverviewPage')
      return { Component: EventOverviewPage }
    },
  },
  {
    path: '*',
    lazy: async () => {
      const { default: NotFoundPage } = await import('../../ui/pages/NotFoundPage')
      return { Component: NotFoundPage }
    },
  },
])

export default router
