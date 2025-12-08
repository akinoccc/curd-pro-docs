import { createApp } from 'vue'
import { createNaiveUiApp } from './naive'
import App from './App.vue'

const app = createApp(App)

createNaiveUiApp(app)

app.mount('#app')
