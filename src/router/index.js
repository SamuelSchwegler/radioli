import { createRouter, createWebHistory } from 'vue-router'

// Import your pages/components
import Home from '../Pages/Home.vue'
import MetaData from '../Pages/MetaData.vue'
import TimeLine from "../Pages/TimeLine.vue";

const routes = [
    { path: '/', name: 'TimeLine', component: TimeLine },
    { path: '/meta', name: 'MetaData', component: MetaData },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router