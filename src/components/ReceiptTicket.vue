<script setup>
import { formatBs, formatDateTime } from '../models/Sale'

defineProps({
  sale: { type: Object, required: true },
})
</script>

<template>
  <div class="ticket font-mono text-xs leading-snug">
    <div class="text-center">
      <h3 class="text-base font-bold">Librería y Papelería</h3>
      <p>Comprobante de venta</p>
      <p class="font-bold">{{ sale.receipt_no }}</p>
      <p>{{ formatDateTime(sale.date) }}</p>
    </div>

    <div class="my-2 border-t border-dashed border-current pt-2">
      <p><span class="font-bold">Cliente:</span> {{ sale.customer_name }}</p>
      <p><span class="font-bold">CI/NIT:</span> {{ sale.customer_nit }}</p>
      <p>
        <span class="font-bold">Pago:</span> {{ sale.payment_method }}
        <span v-if="sale.card_last4">**** {{ sale.card_last4 }}</span>
      </p>
    </div>

    <table class="w-full border-t border-dashed border-current text-left">
      <thead>
        <tr>
          <th class="py-1 pr-2">Cant.</th>
          <th class="py-1 pr-2">Detalle</th>
          <th class="py-1 text-right">Importe</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in sale.items" :key="item.book_id" class="align-top">
          <td class="py-0.5 pr-2">{{ item.quantity }}</td>
          <td class="py-0.5 pr-2">
            {{ item.title }}
            <span class="block opacity-70">{{ formatBs(item.unit_price) }} c/u</span>
          </td>
          <td class="py-0.5 text-right">{{ formatBs(item.subtotal) }}</td>
        </tr>
      </tbody>
    </table>

    <div class="mt-2 flex justify-between border-t border-dashed border-current pt-2 text-base font-bold">
      <span>TOTAL</span>
      <span>{{ formatBs(sale.total) }}</span>
    </div>

    <p class="mt-3 text-center">¡Gracias por su compra!</p>
  </div>
</template>
