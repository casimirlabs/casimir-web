import { createApp } from "vue"
import "./style.css"
import "./styles/Base.css"
import App from "./App.vue"
import { useDark, useToggle, useStorage } from "@vueuse/core"

import router from "@/composables/services/router"

const newlyLoadedAppStorage = useStorage("newlyLoadedApp", true)
newlyLoadedAppStorage.value = true

createApp(App).use(router).mount("#app")
