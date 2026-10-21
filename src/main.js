import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/useAuthStore'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

// Inicia la restauración antes del primer guard; el router espera la misma promesa.
const auth = useAuthStore(pinia)
auth.restoreSession()

app.use(router)
app.mount('#app')
