<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppIcon from '@/components/AppIcon.vue'
import { useAuthStore } from '@/stores/useAuthStore'
import { useToast } from '@/composables/useToast'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const toast = useToast()

const isDev = import.meta.env.DEV
const email = ref(isDev ? 'john@mail.com' : '')
const password = ref(isDev ? 'changeme' : '')
const remember = ref(true)
const showPassword = ref(false)
const localError = ref('')

const errorMessage = computed(() => localError.value || auth.error || '')

function clearErrors() {
  localError.value = ''
  auth.error = null
}

function validate() {
  if (!email.value.trim()) return 'Ingresa tu correo electrónico.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
    return 'Ingresa un correo electrónico válido.'
  }
  if (!password.value) return 'Ingresa tu contraseña.'
  return ''
}

function canAccessRedirect(path) {
  try {
    const resolved = router.resolve(path)
    if (resolved.name === 'login') return false
    const roles = resolved.meta.roles
    return !roles || roles.includes(auth.user?.role)
  } catch {
    return false
  }
}

async function onSubmit() {
  clearErrors()

  const validationError = validate()
  if (validationError) {
    localError.value = validationError
    return
  }

  const success = await auth.login(email.value.trim(), password.value, remember.value)
  if (!success) return

  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : ''

  if (redirect && canAccessRedirect(redirect)) {
    await router.replace(redirect)
  } else {
    await router.replace(auth.isAdmin ? { name: 'libros' } : { name: 'pos' })
  }

  toast.success(`Bienvenido/a, ${auth.displayName} · turno abierto a las ${auth.turnStartedAt}`)
}
</script>

<template>
  <main class="grid min-h-screen bg-base-200 lg:grid-cols-2">
    <section
      class="on-dark relative hidden overflow-hidden bg-primary p-10 text-white lg:flex lg:flex-col lg:justify-between lg:p-14"
    >
      <div
        class="pointer-events-none absolute inset-0 opacity-[0.12]"
        style="
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.7) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.7) 1px, transparent 1px);
          background-size: 56px 56px;
        "
      ></div>
      <div
        class="pointer-events-none absolute -right-28 -top-28 h-96 w-96 rounded-full bg-amber-300/20 blur-3xl"
      ></div>
      <div
        class="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-teal-300/20 blur-3xl"
      ></div>

      <div class="relative flex items-center gap-3">
        <span
          class="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20"
        >
          <AppIcon name="book-open" class="h-6 w-6" />
        </span>
        <div>
          <p class="font-display text-xl leading-none">Librería Áurea</p>
          <p class="mt-1 text-[11px] uppercase tracking-[0.18em] text-teal-100/80">
            POS e inventario
          </p>
        </div>
      </div>

      <div class="relative max-w-xl py-14">
        <p
          class="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-medium tracking-wide text-teal-50"
        >
          <span class="h-1.5 w-1.5 rounded-full bg-amber-300"></span>
          Turno de la mañana · Caja 01
        </p>
        <h1 class="font-display text-4xl leading-[1.08] lg:text-5xl">
          El catálogo en orden.<br />
          <span class="italic text-amber-200">La caja, al día.</span>
        </h1>
        <p class="mt-5 max-w-md text-[15px] leading-relaxed text-teal-50/80">
          Inventario, ventas y reportes en un solo lugar. Pensado para librerías que viven entre
          estanterías y mostrador.
        </p>

        <ul class="mt-8 space-y-3 text-sm text-teal-50/90">
          <li class="flex items-center gap-3">
            <span class="flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
              <AppIcon name="check" class="h-3.5 w-3.5" />
            </span>
            Stock actualizado en cada venta
          </li>
          <li class="flex items-center gap-3">
            <span class="flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
              <AppIcon name="check" class="h-3.5 w-3.5" />
            </span>
            Cobro rápido en efectivo, QR o tarjeta
          </li>
          <li class="flex items-center gap-3">
            <span class="flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
              <AppIcon name="check" class="h-3.5 w-3.5" />
            </span>
            Alertas antes de quedarte sin títulos
          </li>
        </ul>
      </div>

      <div class="relative">
        <blockquote
          class="max-w-md border-l-2 border-amber-300/60 pl-4 text-sm italic leading-relaxed text-teal-50/75"
        >
          «Siempre imaginé que el Paraíso sería algún tipo de biblioteca.»
          <footer
            class="mt-2 text-[11px] not-italic uppercase tracking-[0.16em] text-teal-100/50"
          >
            Jorge Luis Borges
          </footer>
        </blockquote>
        <svg viewBox="0 0 420 210" class="mt-6 w-full max-w-md opacity-40" aria-hidden="true">
          <g stroke="rgba(255,255,255,0.4)" stroke-width="2">
            <path d="M6 70h408" />
            <path d="M6 132h408" />
            <path d="M6 194h408" />
          </g>
          <g fill="rgba(255,255,255,0.22)">
            <rect x="20" y="22" width="16" height="48" rx="2" />
            <rect x="40" y="30" width="13" height="40" rx="2" />
            <rect x="57" y="16" width="20" height="54" rx="2" />
            <rect x="81" y="28" width="14" height="42" rx="2" />
            <rect x="99" y="34" width="18" height="36" rx="2" />
            <rect x="121" y="20" width="12" height="50" rx="2" />
            <rect x="137" y="32" width="22" height="38" rx="2" />
            <rect x="163" y="24" width="15" height="46" rx="2" />
            <rect x="182" y="36" width="12" height="34" rx="2" />
            <rect x="198" y="18" width="19" height="52" rx="2" />
            <rect x="221" y="30" width="14" height="40" rx="2" />
            <rect x="239" y="22" width="22" height="48" rx="2" />
            <rect x="265" y="34" width="13" height="36" rx="2" />
            <rect x="282" y="26" width="18" height="44" rx="2" />
            <rect x="304" y="18" width="14" height="52" rx="2" />
            <rect x="322" y="32" width="20" height="38" rx="2" />
            <rect x="346" y="24" width="13" height="46" rx="2" />
            <rect x="363" y="34" width="17" height="36" rx="2" />
            <rect x="384" y="27" width="12" height="43" rx="2" />
          </g>
          <g fill="rgba(252,211,77,0.55)">
            <rect x="124" y="86" width="18" height="46" rx="2" />
            <rect x="206" y="94" width="14" height="38" rx="2" />
            <rect x="286" y="84" width="20" height="48" rx="2" />
            <rect x="64" y="146" width="15" height="48" rx="2" />
            <rect x="188" y="152" width="18" height="42" rx="2" />
            <rect x="330" y="142" width="14" height="52" rx="2" />
          </g>
          <g fill="rgba(255,255,255,0.22)">
            <rect x="20" y="84" width="14" height="48" rx="2" />
            <rect x="38" y="96" width="20" height="36" rx="2" />
            <rect x="62" y="88" width="13" height="44" rx="2" />
            <rect x="79" y="100" width="17" height="32" rx="2" />
            <rect x="100" y="86" width="18" height="46" rx="2" />
            <rect x="146" y="92" width="14" height="40" rx="2" />
            <rect x="164" y="84" width="20" height="48" rx="2" />
            <rect x="224" y="98" width="16" height="34" rx="2" />
            <rect x="244" y="86" width="14" height="46" rx="2" />
            <rect x="262" y="96" width="18" height="36" rx="2" />
            <rect x="310" y="88" width="16" height="44" rx="2" />
            <rect x="352" y="98" width="14" height="34" rx="2" />
            <rect x="370" y="84" width="19" height="48" rx="2" />
            <rect x="24" y="146" width="18" height="48" rx="2" />
            <rect x="46" y="152" width="14" height="42" rx="2" />
            <rect x="84" y="140" width="21" height="54" rx="2" />
            <rect x="110" y="154" width="13" height="40" rx="2" />
            <rect x="128" y="144" width="18" height="50" rx="2" />
            <rect x="152" y="158" width="14" height="36" rx="2" />
            <rect x="170" y="148" width="12" height="46" rx="2" />
            <rect x="212" y="150" width="20" height="44" rx="2" />
            <rect x="236" y="158" width="14" height="36" rx="2" />
            <rect x="254" y="142" width="17" height="52" rx="2" />
            <rect x="276" y="154" width="21" height="40" rx="2" />
            <rect x="302" y="146" width="14" height="48" rx="2" />
            <rect x="350" y="150" width="18" height="44" rx="2" />
            <rect x="372" y="158" width="13" height="36" rx="2" />
            <rect x="390" y="144" width="18" height="50" rx="2" />
          </g>
        </svg>
      </div>
    </section>

    <section class="flex min-h-screen items-center justify-center p-5 sm:p-8">
      <div class="w-full max-w-md">
        <div class="mb-8 flex items-center gap-3 lg:hidden">
          <span class="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white">
            <AppIcon name="book-open" class="h-6 w-6" />
          </span>
          <div>
            <p class="font-display text-xl leading-none text-slate-900">Librería Áurea</p>
            <p class="mt-1 text-[11px] uppercase tracking-[0.18em] text-slate-500">
              POS e inventario
            </p>
          </div>
        </div>

        <div class="card border border-slate-200 bg-base-100 shadow-xl shadow-slate-900/5">
          <form class="card-body gap-5 p-7 sm:p-8" novalidate @submit.prevent="onSubmit">
            <div>
              <h1 class="font-display text-3xl text-slate-900">Bienvenida de nuevo</h1>
              <p class="mt-1.5 text-sm text-slate-500">Ingresa para abrir el turno de hoy.</p>
            </div>

            <div class="form-control">
              <label for="loginEmail" class="mb-1.5 block text-sm font-medium text-slate-700">
                Correo electrónico
              </label>
              <input
                id="loginEmail"
                v-model="email"
                type="email"
                autocomplete="username"
                required
                class="input input-bordered w-full bg-white"
                placeholder="tu@libreria.bo"
                @input="clearErrors"
              />
            </div>

            <div class="form-control">
              <label for="loginPassword" class="mb-1.5 block text-sm font-medium text-slate-700">
                Contraseña
              </label>
              <div class="relative">
                <input
                  id="loginPassword"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="current-password"
                  required
                  class="input input-bordered w-full bg-white pr-12"
                  placeholder="••••••••"
                  @input="clearErrors"
                />
                <button
                  type="button"
                  :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                  :aria-pressed="showPassword"
                  class="btn btn-ghost btn-sm btn-circle absolute right-1.5 top-1/2 -translate-y-1/2"
                  @click="showPassword = !showPassword"
                >
                  <AppIcon :name="showPassword ? 'eye-off' : 'eye'" class="h-4 w-4" />
                </button>
              </div>
              <p v-if="errorMessage" class="mt-2 text-sm font-medium text-red-600" role="alert">
                {{ errorMessage }}
              </p>
            </div>

            <div class="flex flex-wrap items-center justify-between gap-2">
              <label class="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                <input
                  v-model="remember"
                  type="checkbox"
                  class="checkbox checkbox-sm checkbox-primary"
                />
                Recordarme
              </label>
              <a
                href="#"
                class="link link-hover text-sm font-medium text-primary"
                @click.prevent
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <button type="submit" class="btn btn-primary w-full gap-2" :disabled="auth.loading">
              <span v-if="auth.loading" class="loading loading-spinner loading-sm"></span>
              <span>Iniciar sesión</span>
              <AppIcon v-if="!auth.loading" name="arrow-right" class="h-4 w-4" />
            </button>

            <div
              class="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500"
            >
              <AppIcon name="key" class="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
              <span>
                Acceso de demostración:<br />
                Cajero:
                <span class="font-medium text-slate-700">john@mail.com</span> ·
                <span class="font-medium text-slate-700">changeme</span><br />
                Admin:
                <span class="font-medium text-slate-700">admin@mail.com</span> ·
                <span class="font-medium text-slate-700">admin123</span>
              </span>
            </div>
          </form>
        </div>

        <p class="mt-6 text-center text-xs text-slate-500">
          © 2026 Librería Áurea · Sistema POS e Inventario v1.0
        </p>
      </div>
    </section>
  </main>
</template>
