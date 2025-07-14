import { createRouter, createWebHistory } from 'vue-router'

import HomePage from '../pages/HomePage.vue'
import TemplatePage from "../pages/TemplatePage.vue";


const routes: any[] = [
    { path: '/', component: HomePage },
    { path: '/template/:id?', component: TemplatePage },
]

export const router = createRouter({
    history: createWebHistory(),
    routes,
})
