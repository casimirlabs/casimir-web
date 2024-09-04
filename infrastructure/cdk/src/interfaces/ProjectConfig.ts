export interface ProjectConfig {
    env: {
        account: string
        region: string
    } 
    project: string
    stage: string
    rootDomain: string
    subdomains: {
        users: string
        web: string
        wildcard: string
    }
}