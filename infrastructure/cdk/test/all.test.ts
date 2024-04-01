import * as cdk from "aws-cdk-lib"
import * as assertions from "aws-cdk-lib/assertions"
import { Config } from "../src/providers/config"
import { DnsStack } from "../src/providers/dns"
import { DocsStack } from "../src/providers/docs"
import { NetworkStack } from "../src/providers/network"
import { UsersStack } from "../src/providers/users"
import { WebStack } from "../src/providers/web"

test("All stacks created", () => {
    const config = new Config()
    const { env } = config
    const app = new cdk.App()

    const { hostedZone, certificate } = new DnsStack(app, config.getFullStackName("dns"), { env })
    const { vpc } = new NetworkStack(app, config.getFullStackName("network"), { env })

    const docsStack = new DocsStack(app, config.getFullStackName("docs"), { env, certificate, hostedZone })
    const usersStack = new UsersStack(app, config.getFullStackName("users"), { env, certificate, hostedZone, vpc })
    const webStack = new WebStack(app, config.getFullStackName("web"), { env, certificate, hostedZone })

    const docsTemplate = assertions.Template.fromStack(docsStack)
    Object.keys(docsTemplate.findOutputs("*")).forEach(output => {
        expect(output).toBeDefined()
    })

    const usersTemplate = assertions.Template.fromStack(usersStack)
    Object.keys(usersTemplate.findOutputs("*")).forEach(output => {
        expect(output).toBeDefined()
    })

    const webTemplate = assertions.Template.fromStack(webStack)
    Object.keys(webTemplate.findOutputs("*")).forEach(output => {
        expect(output).toBeDefined()
    })
})
