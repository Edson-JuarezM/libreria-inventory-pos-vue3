import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import { useToast } from '@/composables/useToast'
<<<<<<< HEAD
 
function homeForRole(auth) {
  return auth.isAdmin ? { name: 'libros' } : { name: 'pos' }
}
 
=======

function homeForRole(auth) {
  return auth.isAdmin ? { name: 'libros' } : { name: 'pos' }
}

>>>>>>> 155a69c27c397abf69a034aa0bb1131f4b4488ea
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
<<<<<<< HEAD
        component: () => import('@/views/PosView.vue'),
=======
        component: () => import('@/views/PlaceholderView.vue'),
>>>>>>> 155a69c27c397abf69a034aa0bb1131f4b4488ea
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
        component: () => import('@/views/PlaceholderView.vue'),
        meta: {
          title: 'Libros',
          subtitle: 'Gestiona el catálogo y los niveles de stock',
          search: true,
<<<<<<< HEAD
          placeholder: 'Buscar por título, autor o ISBN...',
=======
          placeholder: 'Buscar por título, autor o ISBN…',
>>>>>>> 155a69c27c397abf69a034aa0bb1131f4b4488ea
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
<<<<<<< HEAD
          placeholder: 'Buscar categoría...',
=======
          placeholder: 'Buscar categoría…',
>>>>>>> 155a69c27c397abf69a034aa0bb1131f4b4488ea
          action: { label: 'Nueva categoría', icon: 'plus' },
          roles: ['admin'],
          icon: 'tag',
          owner: 'Integrante 2',
        },
      },
      {
        path: 'reportes',
        name: 'reportes',
<<<<<<< HEAD
        component: () => import('@/views/ReportsView.vue'),
=======
        component: () => import('@/views/PlaceholderView.vue'),
>>>>>>> 155a69c27c397abf69a034aa0bb1131f4b4488ea
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
<<<<<<< HEAD
 
=======

>>>>>>> 155a69c27c397abf69a034aa0bb1131f4b4488ea
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})
<<<<<<< HEAD
 
router.beforeEach(async (to) => {
  const auth = useAuthStore()
 
  // Espera a que restoreSession() valide el token guardado en el arranque.
  await auth.restoreSession()
 
  if (to.meta.guestOnly && auth.isAuthenticated) {
    return homeForRole(auth)
  }
 
=======

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  // Espera a que restoreSession() valide el token guardado en el arranque.
  await auth.restoreSession()

  if (to.meta.guestOnly && auth.isAuthenticated) {
    return homeForRole(auth)
  }

>>>>>>> 155a69c27c397abf69a034aa0bb1131f4b4488ea
  if (to.meta.requiresAuth) {
    if (!auth.isAuthenticated) {
      return { name: 'login', query: { redirect: to.fullPath } }
    }
<<<<<<< HEAD
 
=======

>>>>>>> 155a69c27c397abf69a034aa0bb1131f4b4488ea
    const roles = to.meta.roles
    if (roles && !roles.includes(auth.user?.role)) {
      useToast().error('No tienes permiso para acceder a esa sección.')
      return { name: 'pos' }
    }
  }
<<<<<<< HEAD
 
  return true
})
 
export default router
 

=======

  return true
})

export default router
>>>>>>> 155a69c27c397abf69a034aa0bb1131f4b4488ea
