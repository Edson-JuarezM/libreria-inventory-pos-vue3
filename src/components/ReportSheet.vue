<script setup>
import { computed } from 'vue'
import { useReportStore } from '../stores/useReportStore'
import { formatBs, formatDateTime } from '../models/Sale'

defineProps({
  printMode: { type: Boolean, default: false },
})

const report = useReportStore()

const filterSummary = computed(() => {
  const cat = report.availableCategories.find((c) => c.id === Number(report.filters.categoryId))
  return [
    `Categoría: ${cat?.name ?? 'Todas'}`,
    `Desde: ${report.filters.from || 'el inicio'}`,
    `Hasta: ${report.filters.to || 'hoy'}`,
    `Pago: ${report.filters.payment || 'Todos'}`,
  ].join('; ')
})

const kpiCards = computed(() => [
  {
    label: 'Ingresos por ventas',
    value: formatBs(report.kpis.revenue),
    hint: `${report.kpis.booksSold} libros vendidos`,
  },
  { label: 'Ventas registradas', value: report.kpis.salesCount, hint: 'Comprobantes emitidos' },
  { label: 'Valor del inventario', value: formatBs(report.kpis.inventoryValue), hint: 'Precio por stock actual' },
  { label: 'Libros con stock crítico', value: report.kpis.lowStockCount, hint: 'Incluye agotados' },
])
</script>

<template>
  <div class="space-y-6">
    <header v-if="printMode">
      <h1 class="text-2xl font-bold">Reporte gerencial de librería</h1>
      <p class="text-sm">Generado el {{ formatDateTime(new Date().toISOString()) }}</p>
      <p class="text-sm">{{ filterSummary }}</p>
    </header>

    <section class="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Indicadores">
      <div v-for="card in kpiCards" :key="card.label" class="rounded-box border border-base-300 bg-base-100 p-4">
        <p class="text-sm opacity-70">{{ card.label }}</p>
        <p class="text-2xl font-bold">{{ card.value }}</p>
        <p class="text-xs opacity-60">{{ card.hint }}</p>
      </div>
    </section>

    <section>
      <h2 class="mb-2 text-lg font-semibold">Ventas</h2>
      <div class="overflow-x-auto rounded-box border border-base-300">
        <table class="table table-sm">
          <thead>
            <tr>
              <th>Recibo</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Pago</th>
              <th class="text-right">Libros</th>
              <th class="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="sale in report.filteredSales" :key="sale.receipt_no">
              <td class="font-mono">{{ sale.receipt_no }}</td>
              <td>{{ formatDateTime(sale.date) }}</td>
              <td>{{ sale.customer_name }} <span class="opacity-60">({{ sale.customer_nit }})</span></td>
              <td>{{ sale.payment_method }}</td>
              <td class="text-right">{{ sale.items.reduce((n, i) => n + i.quantity, 0) }}</td>
              <td class="text-right">{{ formatBs(sale.total) }}</td>
            </tr>
            <tr v-if="!report.filteredSales.length">
              <td colspan="6" class="py-6 text-center opacity-70">
                No hay ventas con estos filtros. Registra una venta en caja o amplía el rango de fechas.
              </td>
            </tr>
          </tbody>
          <tfoot v-if="report.filteredSales.length">
            <tr class="font-bold">
              <td colspan="5" class="text-right">Total</td>
              <td class="text-right">{{ formatBs(report.kpis.revenue) }}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>

    <div class="grid gap-6 lg:grid-cols-2">
      <section>
        <h2 class="mb-2 text-lg font-semibold">Ingresos por método de pago</h2>
        <div class="overflow-x-auto rounded-box border border-base-300">
          <table class="table table-sm">
            <thead>
              <tr>
                <th>Método</th>
                <th class="text-right">Ventas</th>
                <th class="text-right">Monto</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in report.paymentBreakdown" :key="row.method">
                <td>{{ row.method }}</td>
                <td class="text-right">{{ row.count }}</td>
                <td class="text-right">{{ formatBs(row.amount) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 class="mb-2 text-lg font-semibold">Inventario valorizado por categoría</h2>
        <div class="overflow-x-auto rounded-box border border-base-300">
          <table class="table table-sm">
            <thead>
              <tr>
                <th>Categoría</th>
                <th class="text-right">Títulos</th>
                <th class="text-right">Unidades</th>
                <th class="text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in report.inventoryByCategory" :key="row.category">
                <td>{{ row.category }}</td>
                <td class="text-right">{{ row.titles }}</td>
                <td class="text-right">{{ row.units }}</td>
                <td class="text-right">{{ formatBs(row.value) }}</td>
              </tr>
              <tr v-if="!report.inventoryByCategory.length">
                <td colspan="4" class="py-6 text-center opacity-70">No hay libros para esta categoría.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <section>
      <h2 class="mb-2 text-lg font-semibold">Libros para reposición</h2>
      <div class="overflow-x-auto rounded-box border border-base-300">
        <table class="table table-sm">
          <thead>
            <tr>
              <th>Título</th>
              <th>ISBN</th>
              <th>Categoría</th>
              <th class="text-right">Stock</th>
              <th class="text-right">Mínimo</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="book in report.lowStockBooks" :key="book.id">
              <td>{{ book.title }}</td>
              <td class="font-mono">{{ book.isbn || '—' }}</td>
              <td>{{ book.category }}</td>
              <td class="text-right font-bold">{{ book.stock }}</td>
              <td class="text-right">{{ book.minStock }}</td>
            </tr>
            <tr v-if="!report.lowStockBooks.length">
              <td colspan="5" class="py-6 text-center opacity-70">Ningún libro está por debajo de su stock mínimo.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
