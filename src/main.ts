import { createApp } from "vue"
import { useStorage } from "@vueuse/core"
import "./style.css"
import "./styles/Base.css"
import App from "@/App.vue"
import router from "@/composables/router"

const newlyLoadedAppStorage = useStorage("newlyLoadedApp", true)
newlyLoadedAppStorage.value = true

createApp(App).use(router).mount("#app")
