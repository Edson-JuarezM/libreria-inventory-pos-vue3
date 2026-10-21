import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'

const STORAGE_KEY = 'libreria:sales'

function load() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY))
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

export const useSaleStore = defineStore('sales', () => {
  const sales = ref(load())

  watch(
    sales,
    (value) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
      } catch {
        return
      }
    },
    { deep: true },
  )

  const nextSequence = computed(
    () => sales.value.reduce((max, s) => Math.max(max, s.sequence ?? 0), 0) + 1,
  )

  function addSale(sale) {
    sales.value.unshift(sale)
  }

  return { sales, nextSequence, addSale }
})
