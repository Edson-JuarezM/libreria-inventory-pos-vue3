<script setup>
import { computed, ref, watch } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import AppIcon from './AppIcon.vue'
import ToastContainer from './ToastContainer.vue'
import { useAuthStore } from '@/stores/useAuthStore'
import { useLayoutStore } from '@/stores/useLayoutStore'
import { useToast } from '@/composables/useToast'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const layout = useLayoutStore()
const toast = useToast()

const drawerOpen = ref(false)
const avatarError = ref(false)

const pageTitle = computed(() => route.meta.title || 'Librería Áurea')
const pageSubtitle = computed(() => route.meta.subtitle || '')
const showSearch = computed(() => Boolean(route.meta.search))
const action = computed(() => route.meta.action || null)
const searchValue = computed({
  get: () => layout.searchQuery,
  set: (value) => layout.setSearch(value),
})
const alertsCount = computed(() => layout.badges.reportes)
const avatarUrl = computed(() => auth.user?.avatar || '')

watch(
  () => route.fullPath,
  () => {
    drawerOpen.value = false
    layout.clearSearch()
  },
)

watch(
  () => auth.user?.avatar,
  () => {
    avatarError.value = false
  },
)

function logout() {
  auth.logout()
  drawerOpen.value = false
  router.push({ name: 'login' })
}

function notifyAlerts() {
  if (alertsCount.value) {
    toast.warning(`Tienes ${alertsCount.value} alertas de stock crítico.`)
  } else {
    toast.info('No hay alertas de stock por ahora.')
  }
}
</script>

<template>
  <a
    href="#mainContent"
    class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-slate-900"
  >
    Saltar al contenido
  </a>

  <div class="drawer lg:drawer-open">
    <input id="app-drawer" v-model="drawerOpen" type="checkbox" class="drawer-toggle" />

    <div class="drawer-content flex min-h-screen flex-col">
      <header
        class="app-header no-print sticky top-0 z-30 flex h-[72px] items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:px-6"
      >
        <label
          for="app-drawer"
          class="btn btn-ghost btn-sm btn-square lg:hidden"
          role="button"
          tabindex="0"
          aria-label="Abrir menú"
          @keydown.enter.prevent="drawerOpen = !drawerOpen"
          @keydown.space.prevent="drawerOpen = !drawerOpen"
        >
          <AppIcon name="menu" class="h-5 w-5" />
        </label>

        <div class="min-w-0">
          <h1 class="truncate text-base font-semibold text-slate-900 sm:text-lg">
            {{ pageTitle }}
          </h1>
          <p class="hidden truncate text-xs text-slate-500 sm:block">{{ pageSubtitle }}</p>
        </div>

        <div class="ml-auto flex items-center gap-2">
          <div v-if="showSearch" class="relative hidden md:block">
            <AppIcon
              name="search"
              class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            />
            <input
              v-model="searchValue"
              type="search"
              class="input input-bordered input-sm w-64 bg-white pl-9"
              :placeholder="route.meta.placeholder || 'Buscar…'"
              aria-label="Buscar en el catálogo"
            />
          </div>

          <button
            type="button"
            class="btn btn-ghost btn-sm btn-circle indicator"
            :aria-label="
              alertsCount
                ? `Notificaciones: ${alertsCount} alertas de stock`
                : 'Notificaciones: sin alertas'
            "
            @click="notifyAlerts"
          >
            <AppIcon name="bell" class="h-5 w-5" />
            <span class="indicator-item badge badge-error badge-xs"></span>
          </button>

          <button
            v-if="action"
            type="button"
            class="btn btn-primary btn-sm gap-2"
            @click="layout.triggerTopAction()"
          >
            <AppIcon :name="action.icon" class="h-4 w-4" />
            <span>{{ action.label }}</span>
          </button>
        </div>
      </header>

      <main id="mainContent" class="flex-1 p-4 lg:p-6 xl:p-8">
        <div class="mx-auto w-full max-w-[1440px]">
          <RouterView v-slot="{ Component }">
            <Transition name="view" mode="out-in">
              <component :is="Component" />
            </Transition>
          </RouterView>
        </div>
      </main>
    </div>

    <div class="drawer-side z-40">
      <label for="app-drawer" class="drawer-overlay" aria-label="Cerrar menú"></label>

      <aside class="no-print flex min-h-screen w-72 flex-col bg-neutral text-neutral-content">
        <div class="flex items-center gap-3 px-5 pb-5 pt-6">
          <span
            class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-teal-950/40"
          >
            <AppIcon name="book-open" class="h-5 w-5" />
          </span>
          <div>
            <p class="font-display text-lg leading-none text-white">Librería Áurea</p>
            <p class="mt-1 text-[10px] uppercase tracking-[0.18em] text-slate-400">
              POS e inventario
            </p>
          </div>
        </div>

        <nav class="flex-1 space-y-6 overflow-y-auto px-3 pb-4" aria-label="Navegación principal">
          <ul class="menu w-full gap-1 p-0">
            <li class="menu-title px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Operación
            </li>
            <li>
              <RouterLink to="/pos" class="nav-link" active-class="active">
                <AppIcon name="grid" />
                Punto de venta
              </RouterLink>
            </li>
          </ul>

          <ul v-if="auth.isAdmin" class="menu w-full gap-1 p-0">
            <li class="menu-title px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Catálogo
            </li>
            <li>
              <RouterLink to="/libros" class="nav-link" active-class="active">
                <AppIcon name="book" />
                Libros
                <span
                  v-if="layout.badges.libros != null"
                  class="badge badge-sm ml-auto border-0 bg-white/5 text-[10px] font-medium text-slate-400"
                >
                  {{ layout.badges.libros }}
                </span>
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/categorias" class="nav-link" active-class="active">
                <AppIcon name="tag" />
                Categorías
                <span
                  v-if="layout.badges.categorias != null"
                  class="badge badge-sm ml-auto border-0 bg-white/5 text-[10px] font-medium text-slate-400"
                >
                  {{ layout.badges.categorias }}
                </span>
              </RouterLink>
            </li>
          </ul>

          <ul v-if="auth.isAdmin" class="menu w-full gap-1 p-0">
            <li class="menu-title px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Análisis
            </li>
            <li>
              <RouterLink to="/reportes" class="nav-link" active-class="active">
                <AppIcon name="chart" />
                Reportes
                <span
                  v-if="layout.badges.reportes != null"
                  class="badge badge-sm ml-auto border-0 bg-red-500/15 text-[10px] font-semibold text-red-300"
                >
                  {{ layout.badges.reportes }}
                </span>
              </RouterLink>
            </li>
          </ul>
        </nav>

        <div class="mx-3 mb-3 rounded-xl border border-white/10 bg-white/5 p-3">
          <div class="flex items-center gap-2 text-xs font-medium text-slate-200">
            <span class="badge badge-success badge-xs h-2 w-2 border-0 p-0"></span>
            Turno abierto
          </div>
          <p class="mt-1 flex items-center gap-1.5 text-[11px] text-slate-400">
            <AppIcon name="clock" class="h-3 w-3" />
            Caja 01 · desde {{ auth.turnStartedAt || '—' }}
          </p>
        </div>

        <div class="flex items-center gap-3 border-t border-white/10 px-4 py-4">
          <div v-if="avatarUrl && !avatarError" class="avatar">
            <div class="w-9 rounded-full">
              <img
                :src="avatarUrl"
                :alt="auth.displayName"
                @error="avatarError = true"
              />
            </div>
          </div>
          <div v-else class="avatar placeholder">
            <span
              class="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white"
            >
              {{ auth.initials }}
            </span>
          </div>

          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-white">{{ auth.displayName }}</p>
            <p class="text-[11px] text-slate-400">{{ auth.roleLabel }}</p>
          </div>

          <button
            type="button"
            class="btn btn-ghost btn-sm btn-circle text-slate-400 hover:text-white"
            aria-label="Cerrar sesión"
            @click="logout"
          >
            <AppIcon name="log-out" class="h-4 w-4" />
          </button>
        </div>
      </aside>
    </div>
  </div>

  <ToastContainer />
</template>
