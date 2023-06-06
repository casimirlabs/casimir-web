import { config } from './providers/config'
import { getEventEmitter } from './providers/events'
import { 
    initiateDepositHandler, 
    initiatePoolExitHandler, 
    initiatePoolReshareHandler, 
    reportCompletedExitsHandler 
} from './providers/handlers'

const handlers = {
    DepositRequested: initiateDepositHandler,
    ReshareRequested: initiatePoolReshareHandler,
    ExitRequested: initiatePoolExitHandler,
    // ForcedExitReportsRequested: reportForcedExitssHandler,
    CompletedExitReportsRequested: reportCompletedExitsHandler
}

const { provider, signer, manager, cliPath, messengerUrl } = config()

;(async function () {
    const eventEmitter = getEventEmitter({ manager, events: Object.keys(handlers) })    
    for await (const event of eventEmitter) {
        const details = event[event.length - 1]
        const { args } = details
        const handler = handlers[details.event as keyof typeof handlers]
        if (!handler) throw new Error(`No handler found for event ${details.event}`)
        await handler({ 
            provider,
            signer,
            manager,
            cliPath,
            messengerUrl,
            args 
        })
    }
})()

