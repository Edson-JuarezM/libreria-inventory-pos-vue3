import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import { useToast } from '@/composables/useToast'

function homeForRole(auth) {
  return auth.isAdmin ? { name: 'libros' } : { name: 'pos' }
}

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { guestOnly: true, title: 'Iniciar sesión' },
  },
  {
    path: '/',
    component: () => import('@/components/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: { name: 'login' },
      },
      {
        path: 'pos',
        name: 'pos',
        component: () => import('@/views/PlaceholderView.vue'),
        meta: {
          title: 'Punto de venta',
          subtitle: 'Cobra rápido y mantén el inventario al día',
          search: false,
          action: null,
          icon: 'grid',
          owner: 'Integrante 4',
        },
      },
      {
        path: 'libros',
        name: 'libros',
        alias: 'catalogo',
        component: () => import('@/views/BooksView.vue'),
        meta: {
          title: 'Libros',
          subtitle: 'Gestiona el catálogo y los niveles de stock',
          search: true,
          placeholder: 'Buscar por título, autor o ISBN…',
          action: { label: 'Nuevo libro', icon: 'plus' },
          roles: ['admin'],
          icon: 'book',
          owner: 'Integrante 3',
        },
      },
      {
        path: 'categorias',
        name: 'categorias',
        component: () => import('@/views/PlaceholderView.vue'),
        meta: {
          title: 'Categorías',
          subtitle: 'Organiza el catálogo por género y colección',
          search: true,
          placeholder: 'Buscar categoría…',
          action: { label: 'Nueva categoría', icon: 'plus' },
          roles: ['admin'],
          icon: 'tag',
          owner: 'Integrante 2',
        },
      },
      {
        path: 'reportes',
        name: 'reportes',
        component: () => import('@/views/PlaceholderView.vue'),
        meta: {
          title: 'Reportes',
          subtitle: 'Resumen de ventas, inventario y alertas',
          search: false,
          action: { label: 'Imprimir reporte', icon: 'printer' },
          roles: ['admin'],
          icon: 'chart',
          owner: 'Integrante 4',
        },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  // Espera a que restoreSession() valide el token guardado en el arranque.
  await auth.restoreSession()

  if (to.meta.guestOnly && auth.isAuthenticated) {
    return homeForRole(auth)
  }

  if (to.meta.requiresAuth) {
    if (!auth.isAuthenticated) {
      return { name: 'login', query: { redirect: to.fullPath } }
    }

    const roles = to.meta.roles
    if (roles && !roles.includes(auth.user?.role)) {
      useToast().error('No tienes permiso para acceder a esa sección.')
      return { name: 'pos' }
    }
  }

  return true
})

export default router
