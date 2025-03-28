import { createRouter, createWebHistory } from 'vue-router'

// Import your pages/components
import Home from '../Pages/Home.vue'
import MetaData from '../Pages/MetaData.vue'
import TimeLine from "../Pages/TimeLine.vue";

const routes = [
    { path: '/', name: 'Home', component: Home },
    { path: '/meta', name: 'MetaData', component: MetaData },
    { path: '/time-line', name: 'TimeLine', component: TimeLine }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router