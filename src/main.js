import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import './assets/tailwind.css' // 👈 Add this line
import router from './router'
import Toast, { POSITION } from "vue-toastification";
import "vue-toastification/dist/index.css";

createApp(App).use(router).use(Toast, {
    // Setting the global default position
    position: POSITION.BOTTOM_RIGHT,
    timeout: 1000
}).mount('#app')
