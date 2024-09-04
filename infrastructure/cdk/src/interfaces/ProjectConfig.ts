export interface ProjectConfig {
    env: {
        account: string
        region: string
    } 
    project: string
    stage: string
    rootDomain: string
    subdomains: {
        api: string
        web: string
        wildcard: string
    }
}