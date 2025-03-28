import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import './assets/tailwind.css' // 👈 Add this line
import router from './router'
createApp(App).use(router).mount('#app')
