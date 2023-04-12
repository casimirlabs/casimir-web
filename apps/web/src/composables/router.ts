import { createWebHistory, createRouter } from 'vue-router'
import useWallet from '@/composables/wallet'
import useUsers from '@/composables/users'

/* eslint-disable @typescript-eslint/ban-ts-comment */
import Dashboard from '@/pages/dashboard/Dashboard.vue'
import Test from '@/pages/test/Test.vue'
import Auth from '@/pages/auth/Auth.vue'

const routes = [
    { 
        path: '/', 
        name: Dashboard, 
        component: Dashboard,
    },
    { 
        path: '/auth', 
        name: Auth, 
        component: Auth,
    },
    { 
        path: '/test', 
        name: Test, 
        component: Test,
    },
]


const router = createRouter({
    history: createWebHistory(),
    routes
})

// TO DO: Add a routing beforeEach that 
// dynamically fixes rerouting to auth page

router.beforeEach(async (to, from, next) => {
    if (import.meta.env.DEV) {
        const appLaunched = sessionStorage.getItem('appLaunch')
        if (!appLaunched) {
            const { logout } = useWallet()
            await logout()
            sessionStorage.setItem('appLaunch', 'true')
        }
    }

    const { checkUserSessionExists } = useUsers()
    const loggedIn = await checkUserSessionExists()
    if (to.fullPath === '/auth' && !loggedIn) {
        next()
    } else if (to.fullPath === '/auth' && loggedIn) {
        next('/')
    } else if (!loggedIn) {
        next('/auth')
    } else {
        next()
    }
})

export default router