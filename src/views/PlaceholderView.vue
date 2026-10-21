<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppIcon from '@/components/AppIcon.vue'

const route = useRoute()

const icon = computed(() => route.meta.icon || 'package')
const owner = computed(() => route.meta.owner || 'el equipo')
</script>

<template>
  <section class="view">
    <div class="card mx-auto max-w-xl border border-slate-200 bg-base-100 shadow-sm">
      <div class="card-body items-center py-14 text-center">
        <span class="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <AppIcon :name="icon" class="h-8 w-8" />
        </span>
        <h2 class="mt-4 font-display text-2xl text-slate-900">{{ route.meta.title }}</h2>
        <p class="text-sm text-slate-500">En construcción</p>
        <p class="mt-1 max-w-sm text-sm text-slate-500">
          Esta sección está siendo desarrollada por {{ owner }}. El layout, la sesión y el
          buscador global ya están disponibles.
        </p>
        <span class="badge badge-warning badge-outline mt-4">Próximamente</span>
      </div>
    </div>
  </section>
</template>
