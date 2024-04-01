import * as cdk from "aws-cdk-lib"
import { Config } from "./providers/config"
import { DocsStack } from "./providers/docs"
import { DnsStack } from "./providers/dns"
import { NetworkStack } from "./providers/network"
import { UsersStack } from "./providers/users"
import { WebStack } from "./providers/web"

const config = new Config()
const { env, stage } = config
const app = new cdk.App()

const { hostedZone, certificate } = new DnsStack(app, config.getFullStackName("dns"), { env })
const { vpc } = new NetworkStack(app, config.getFullStackName("network"), { env })

if (stage !== "prod") {
    new DocsStack(app, config.getFullStackName("docs"), { env, certificate, hostedZone })
    new UsersStack(app, config.getFullStackName("users"), { env, certificate, hostedZone, vpc })
    new WebStack(app, config.getFullStackName("web"), { env, certificate, hostedZone })
}
