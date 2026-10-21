<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import QRCode from 'qrcode'
import { usePosStore } from '../stores/usePosStore'
import {
  PAYMENT_METHODS,
  digitsOnly,
  formatBs,
  formatCardNumber,
  formatExpiry,
} from '../models/Sale'
import { getStockStatus, STOCK_STATUS } from '../models/BookMapper'
import { errorMessage } from '../services/saleService'
import { useToast } from '@/composables/useToast'
import ReceiptTicket from '../components/ReceiptTicket.vue'

const pos = usePosStore()
const notify = useToast()

const errors = ref({})
const receiptModal = ref(null)
const failedImages = reactive(new Set())

const MAX_VISIBLE = 60
const visibleBooks = computed(() => pos.filteredBooks.slice(0, MAX_VISIBLE))

const badgeClass = (book) => {
  const status = getStockStatus(book)
  if (status === STOCK_STATUS.OUT) return 'badge-error'
  if (status === STOCK_STATUS.LOW) return 'badge-warning'
  return 'badge-success'
}

onMounted(() => pos.loadCatalog())

function add(book) {
  const result = pos.addToCart(book)
  if (!result.ok) notify.warning(result.message)
}

function changeQuantity(line, delta) {
  const result = pos.setQuantity(line.book.id, line.quantity + delta)
  if (!result.ok && result.message) notify.warning(result.message)
}

async function confirmSale() {
  errors.value = pos.validate()
  if (Object.keys(errors.value).length) {
    notify.warning('Revisa los datos de la venta.')
    return
  }
  try {
    const sale = await pos.checkout()
    notify.success(`Venta ${sale.receipt_no} registrada.`)
    receiptModal.value?.showModal()
  } catch (e) {
    notify.error(errorMessage(e, 'No se pudo registrar la venta.'))
  }
}

const printReceipt = () => window.print()

const qrImage = ref('')

watch(
  () => [pos.paymentMethod, pos.total, pos.nextReceiptNo],
  async ([method, total, reference]) => {
    if (method !== 'QR' || total <= 0) {
      qrImage.value = ''
      return
    }
    const payload = `LIBRERIA-AUREA|REF:${reference}|MONTO:${total.toFixed(2)}|BOB`
    try {
      qrImage.value = await QRCode.toDataURL(payload, { width: 240, margin: 1 })
    } catch {
      qrImage.value = ''
    }
  },
  { immediate: true },
)

function onCardNumber(event) {
  const value = formatCardNumber(event.target.value)
  pos.card.number = value
  event.target.value = value
}

function onCardExpiry(event) {
  const value = formatExpiry(event.target.value)
  pos.card.expiry = value
  event.target.value = value
}

function onCardCvv(event) {
  const value = digitsOnly(event.target.value).slice(0, 4)
  pos.card.cvv = value
  event.target.value = value
}
</script>

<template>
  <section class="space-y-4">
    <div v-if="pos.lastSale" class="flex justify-end">
      <button class="btn btn-ghost btn-sm" @click="receiptModal?.showModal()">
        Ver último recibo ({{ pos.lastSale.receipt_no }})
      </button>
    </div>

    <div v-if="pos.error" role="alert" class="alert alert-error">
      <span>{{ pos.error }}</span>
      <button class="btn btn-sm" @click="pos.loadCatalog()">Reintentar</button>
    </div>

    <div class="grid gap-4 lg:grid-cols-[1fr_24rem]">

      <div class="space-y-3">
        <div class="flex flex-wrap gap-2">
          <input
            v-model="pos.search"
            type="search"
            class="input input-bordered min-w-56 flex-1"
            placeholder="Buscar por título, autor, ISBN o categoría"
            aria-label="Buscar libros"
          />
          <select v-model.number="pos.categoryId" class="select select-bordered" aria-label="Filtrar por categoría">
            <option value="">Todas las categorías</option>
            <option v-for="c in pos.availableCategories" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>

        <div v-if="pos.loading" class="flex justify-center py-16">
          <span class="loading loading-spinner loading-lg"></span>
        </div>

        <p v-else-if="!visibleBooks.length" class="py-16 text-center opacity-70">
          No se encontraron libros. Prueba con otro título, autor o código ISBN.
        </p>

        <div v-else class="grid grid-cols-2 gap-3 xl:grid-cols-3">
          <article
            v-for="book in visibleBooks"
            :key="book.id"
            class="card card-compact border border-base-300 bg-base-100"
          >
            <figure class="aspect-[3/4] bg-base-200">
              <img
                v-if="book.image && !failedImages.has(book.id)"
                :src="book.image"
                :alt="`Portada de ${book.title}`"
                loading="lazy"
                class="h-full w-full object-cover"
                @error="failedImages.add(book.id)"
              />
              <span v-else class="px-3 text-center text-sm opacity-60">Sin portada</span>
            </figure>
            <div class="card-body gap-1">
              <h2 class="line-clamp-2 text-sm font-semibold" :title="book.title">{{ book.title }}</h2>
              <p class="truncate text-xs opacity-70">{{ book.author || book.category }}</p>
              <p v-if="book.isbn" class="font-mono text-xs opacity-60">ISBN {{ book.isbn }}</p>
              <div class="flex items-center justify-between">
                <span class="font-bold">{{ formatBs(book.price) }}</span>
                <span class="badge badge-sm" :class="badgeClass(book)">
                  {{ book.stock > 0 ? `${book.stock} uds.` : 'Agotado' }}
                </span>
              </div>
              <button
                class="btn btn-primary btn-sm mt-1"
                :disabled="book.stock <= 0 || pos.quantityInCart(book.id) >= book.stock"
                @click="add(book)"
              >
                Agregar al carrito
              </button>
            </div>
          </article>
        </div>

        <p v-if="pos.filteredBooks.length > MAX_VISIBLE" class="text-center text-sm opacity-70">
          Mostrando {{ MAX_VISIBLE }} de {{ pos.filteredBooks.length }} libros. Afina la búsqueda para ver el resto.
        </p>
      </div>

      <aside class="card self-start border border-base-300 bg-base-100 lg:sticky lg:top-4">
        <div class="card-body gap-3">
          <h2 class="card-title">Carrito ({{ pos.itemCount }})</h2>

          <p v-if="!pos.cartLines.length" class="py-4 text-center text-sm opacity-70">
            Aún no agregaste libros. Búscalos a la izquierda y pulsa «Agregar al carrito».
          </p>
          <p v-if="errors.cart" class="text-sm text-error">{{ errors.cart }}</p>

          <ul v-if="pos.cartLines.length" class="max-h-72 divide-y divide-base-300 overflow-y-auto">
            <li v-for="line in pos.cartLines" :key="line.book.id" class="flex items-center gap-2 py-2">
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-medium" :title="line.book.title">{{ line.book.title }}</p>
                <p class="text-xs opacity-70">{{ formatBs(line.book.price) }} c/u</p>
              </div>
              <div class="join">
                <button class="btn btn-xs join-item" aria-label="Quitar una unidad" @click="changeQuantity(line, -1)">−</button>
                <span class="btn btn-xs join-item pointer-events-none">{{ line.quantity }}</span>
                <button class="btn btn-xs join-item" aria-label="Agregar una unidad" @click="changeQuantity(line, 1)">+</button>
              </div>
              <span class="w-20 text-right text-sm font-semibold">{{ formatBs(line.subtotal) }}</span>
              <button
                class="btn btn-ghost btn-xs"
                :aria-label="`Eliminar ${line.book.title} del carrito`"
                @click="pos.removeFromCart(line.book.id)"
              >
                ✕
              </button>
            </li>
          </ul>

          <div class="flex items-center justify-between border-t border-base-300 pt-3 text-lg font-bold">
            <span>Total</span>
            <span>{{ formatBs(pos.total) }}</span>
          </div>

          <label class="form-control">
            <span class="label-text mb-1">Nombre o razón social</span>
            <input
              v-model="pos.customer.name"
              type="text"
              class="input input-bordered input-sm"
              :class="{ 'input-error': errors.name }"
              autocomplete="off"
            />
            <span v-if="errors.name" class="mt-1 text-xs text-error">{{ errors.name }}</span>
          </label>

          <label class="form-control">
            <span class="label-text mb-1">CI / NIT</span>
            <input
              v-model="pos.customer.nit"
              type="text"
              class="input input-bordered input-sm"
              :class="{ 'input-error': errors.nit }"
              autocomplete="off"
            />
            <span v-if="errors.nit" class="mt-1 text-xs text-error">{{ errors.nit }}</span>
          </label>

          <fieldset>
            <legend class="label-text mb-1">Método de pago</legend>
            <div class="join w-full">
              <input
                v-for="method in PAYMENT_METHODS"
                :key="method"
                v-model="pos.paymentMethod"
                type="radio"
                name="payment"
                :value="method"
                :aria-label="method"
                class="btn btn-sm join-item flex-1"
              />
            </div>
          </fieldset>

          <div
            v-if="pos.paymentMethod === 'QR'"
            class="flex flex-col items-center gap-2 rounded-box border border-base-300 p-3"
          >
            <img v-if="qrImage" :src="qrImage" alt="Código QR para pagar" class="h-48 w-48" />
            <p v-else class="py-6 text-center text-sm opacity-70">
              Agrega libros al carrito para generar el QR de pago.
            </p>
            <p v-if="qrImage" class="text-center text-xs opacity-70">
              Pide al cliente que escanee el código y confirma la venta cuando recibas el pago de
              {{ formatBs(pos.total) }}.
            </p>
          </div>

          <div v-if="pos.paymentMethod === 'Tarjeta'" class="space-y-2 rounded-box border border-base-300 p-3">
            <label class="form-control">
              <span class="label-text mb-1">Titular de la tarjeta</span>
              <input
                v-model="pos.card.holder"
                type="text"
                class="input input-bordered input-sm"
                :class="{ 'input-error': errors.cardHolder }"
                autocomplete="cc-name"
              />
              <span v-if="errors.cardHolder" class="mt-1 text-xs text-error">{{ errors.cardHolder }}</span>
            </label>

            <label class="form-control">
              <span class="label-text mb-1">Número de tarjeta</span>
              <input
                :value="pos.card.number"
                type="text"
                inputmode="numeric"
                placeholder="0000 0000 0000 0000"
                class="input input-bordered input-sm font-mono"
                :class="{ 'input-error': errors.cardNumber }"
                autocomplete="cc-number"
                @input="onCardNumber"
              />
              <span v-if="errors.cardNumber" class="mt-1 text-xs text-error">{{ errors.cardNumber }}</span>
            </label>

            <div class="grid grid-cols-2 gap-2">
              <label class="form-control">
                <span class="label-text mb-1">Vencimiento</span>
                <input
                  :value="pos.card.expiry"
                  type="text"
                  inputmode="numeric"
                  placeholder="MM/AA"
                  class="input input-bordered input-sm font-mono"
                  :class="{ 'input-error': errors.cardExpiry }"
                  autocomplete="cc-exp"
                  @input="onCardExpiry"
                />
                <span v-if="errors.cardExpiry" class="mt-1 text-xs text-error">{{ errors.cardExpiry }}</span>
              </label>

              <label class="form-control">
                <span class="label-text mb-1">CVV</span>
                <input
                  :value="pos.card.cvv"
                  type="password"
                  inputmode="numeric"
                  placeholder="123"
                  class="input input-bordered input-sm font-mono"
                  :class="{ 'input-error': errors.cardCvv }"
                  autocomplete="cc-csc"
                  @input="onCardCvv"
                />
                <span v-if="errors.cardCvv" class="mt-1 text-xs text-error">{{ errors.cardCvv }}</span>
              </label>
            </div>

            <p class="text-xs opacity-70">
              Los datos de la tarjeta no se guardan. En el recibo solo quedan los últimos 4 dígitos.
            </p>
          </div>

          <div class="card-actions mt-1 flex-col gap-2">
            <button class="btn btn-success w-full" :disabled="pos.processing" @click="confirmSale">
              <span v-if="pos.processing" class="loading loading-spinner loading-sm"></span>
              Confirmar venta
            </button>
            <button
              class="btn btn-ghost btn-sm w-full"
              :disabled="!pos.cartLines.length || pos.processing"
              @click="pos.clearCart()"
            >
              Vaciar carrito
            </button>
          </div>
        </div>
      </aside>
    </div>

    <dialog ref="receiptModal" class="modal">
      <div class="modal-box max-w-sm">
        <h3 class="mb-3 text-lg font-bold">Venta registrada</h3>
        <ReceiptTicket v-if="pos.lastSale" :sale="pos.lastSale" />
        <div class="modal-action">
          <button class="btn btn-primary" @click="printReceipt">Imprimir recibo</button>
          <form method="dialog">
            <button class="btn">Cerrar</button>
          </form>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop"><button>Cerrar</button></form>
    </dialog>

    <Teleport to="body">
      <div v-if="pos.lastSale" class="print-area print-only receipt">
        <ReceiptTicket :sale="pos.lastSale" />
      </div>
    </Teleport>
  </section>
</template>
