<script setup>
import { onMounted, watch } from 'vue'
import { useReportStore } from '../stores/useReportStore'
import { PAYMENT_METHODS } from '../models/Sale'
import { useToast } from '@/composables/useToast'
import { useLayoutStore } from '@/stores/useLayoutStore'
import ReportSheet from '../components/ReportSheet.vue'

const report = useReportStore()
const notify = useToast()
const layout = useLayoutStore()

onMounted(() => report.loadCatalog())

function downloadCsv() {
  if (!report.filteredSales.length) {
    notify.warning('No hay ventas para exportar con estos filtros.')
    return
  }
  const blob = new Blob(['\uFEFF' + report.salesCsv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `ventas-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

const printReport = () => window.print()

watch(() => layout.actionTick, printReport)

watch(
  () => report.criticalStockTotal,
  (count) => {
    if (report.books.length) layout.setBadges({ reportes: count })
  },
  { immediate: true },
)
</script>

<template>
  <section class="space-y-4">
    <header class="flex flex-wrap items-center justify-end gap-2">
      <div class="flex flex-wrap gap-2">
        <button class="btn btn-sm" :disabled="report.loading" @click="report.loadCatalog()">Actualizar inventario</button>
        <button class="btn btn-sm" @click="downloadCsv">Exportar ventas (CSV)</button>
      </div>
    </header>

    <div v-if="report.error" role="alert" class="alert alert-error">
      <span>{{ report.error }}</span>
      <button class="btn btn-sm" @click="report.loadCatalog()">Reintentar</button>
    </div>

    <form class="flex flex-wrap items-end gap-3 rounded-box border border-base-300 bg-base-100 p-3" @submit.prevent>
      <label class="form-control">
        <span class="label-text mb-1">Categoría</span>
        <select v-model="report.filters.categoryId" class="select select-bordered select-sm">
          <option value="">Todas</option>
          <option v-for="c in report.availableCategories" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
      </label>
      <label class="form-control">
        <span class="label-text mb-1">Desde</span>
        <input v-model="report.filters.from" type="date" class="input input-bordered input-sm" />
      </label>
      <label class="form-control">
        <span class="label-text mb-1">Hasta</span>
        <input v-model="report.filters.to" type="date" class="input input-bordered input-sm" />
      </label>
      <label class="form-control">
        <span class="label-text mb-1">Método de pago</span>
        <select v-model="report.filters.payment" class="select select-bordered select-sm">
          <option value="">Todos</option>
          <option v-for="m in PAYMENT_METHODS" :key="m" :value="m">{{ m }}</option>
        </select>
      </label>
      <button type="button" class="btn btn-ghost btn-sm" @click="report.resetFilters()">Limpiar filtros</button>
    </form>

    <p class="text-xs opacity-70">
      El valor del inventario y el stock crítico muestran el estado actual y no cambian con el rango de fechas.
    </p>

    <div v-if="report.loading" class="flex justify-center py-16">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
    <ReportSheet v-else />

    <Teleport to="body">
      <div class="print-area print-only">
        <ReportSheet print-mode />
      </div>
    </Teleport>
  </section>
</template>
