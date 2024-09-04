import Session from "supertokens-web-js/recipe/session"
import useEnvironment from "@/composables/services/environment"

const { apiUrl } = useEnvironment()

export const SuperTokensWebJSConfig = {
    appInfo: {
        apiDomain: apiUrl,
        appName: "Casimir",
        // apiBasePath: "/"
    },
    recipeList: [Session.init()],
}