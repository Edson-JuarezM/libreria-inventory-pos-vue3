import { ref } from 'vue'
import { defineStore } from 'pinia'

/**
 * CONTRATO PARA LOS INTEGRANTES 2, 3 Y 4
 * ---------------------------------------
 * `searchQuery` es el texto del buscador global del header. Suscríbanse con
 * `watch(() => layout.searchQuery, (q) => ...)` para filtrar sus tablas.
 *
 * `actionTick` se incrementa cada vez que se pulsa el botón principal del header
 * ("Nuevo libro", "Nueva categoría", "Imprimir reporte"). Suscríbanse con
 * `watch(() => layout.actionTick, () => openCreateModal())`.
 *
 * `badges` alimenta los contadores del sidebar. Es `null` por defecto (no se
 * muestra nada). Actualícenlo desde sus stores con:
 *   layout.setBadges({ libros: 2431, categorias: 18, reportes: 12 })
 */
export const useLayoutStore = defineStore('layout', () => {
  const searchQuery = ref('')
  const badges = ref({ libros: null, categorias: null, reportes: null })
  const actionTick = ref(0)

  function setSearch(query) {
    searchQuery.value = query
  }

  function clearSearch() {
    searchQuery.value = ''
  }

  function triggerTopAction() {
    actionTick.value += 1
  }

  function setBadges(partial) {
    badges.value = { ...badges.value, ...partial }
  }

  return {
    searchQuery,
    badges,
    actionTick,
    setSearch,
    clearSearch,
    triggerTopAction,
    setBadges,
  }
})
