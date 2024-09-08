import { createWebHistory, createRouter } from "vue-router"
import Dashboard from "@/pages/dashboard/Dashboard.vue"
import PageNotFound from "@/pages/404/PageNotFound.vue"
import Test from "@/pages/test/Test.vue"

const routes = [
    { 
        path: "/",
        name: "stake",
        component: Dashboard
    },
    {
        path: "/test",
        name: "test",
        component: Test
    },
    { 
        path: "/:pathMatch(.*)*", 
        name: "404",
        component: PageNotFound 
    }
]


const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router