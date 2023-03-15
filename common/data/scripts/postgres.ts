import minimist from 'minimist'
import fs from 'fs'
import { run } from '@casimir/helpers'
import { JsonSchema, Schema, accountSchema, nonceSchema, userSchema } from '@casimir/data'

/** Resource path from package caller */
const resourcePath = './scripts'

/** All table schemas */
const tableSchemas = {
    accounts: accountSchema,
    nonces: nonceSchema,
    users: userSchema
}

/**
 * Run a local postgres database with the given tables.
 * 
 * Arguments:
 *     --tables: tables to deploy (optional, i.e., --tables=accounts,users)
 */
void async function () {

    /** Parse command line arguments */
    const argv = minimist(process.argv.slice(2))

    /** Default to all tables */
    const tables = argv.tables ? argv.tables.split(',') : ['accounts', 'nonces', 'users']
    let sqlSchema = '-- Generated by @casimir/data/scripts/postgres.ts\n\n'
    for (const table of tables) {
        const tableSchema = tableSchemas[table] as JsonSchema
        const schema = new Schema(tableSchema)
        const postgresTable = schema.getPostgresTable()
        console.log(`${schema.getTitle()} JSON schema parsed to SQL`)
        sqlSchema += `DROP TABLE IF EXISTS ${table};\n`
        sqlSchema += `${postgresTable}\n\n`
    }

    /** Write to sql file in ${resourcePath}/sql */
    const sqlDir = `${resourcePath}/.out/sql`
    if (!fs.existsSync(sqlDir)) fs.mkdirSync(sqlDir, { recursive: true })
    fs.writeFileSync(`${sqlDir}/schema.sql`, sqlSchema)

    /** Start or sync database with latest schema */
    const stackName = 'casimir-data'
    const containerName = `${stackName}-postgres-1`
    const container = await run(`docker ps -q --filter name=${containerName}`)
    if (!container) {
        /** Start local database */
        await run(`docker compose -p ${stackName} -f ${resourcePath}/docker-compose.yaml up -d`)
        console.log('🐘 Database started')
    } else {   
        await run(`docker exec ${containerName} psql -U postgres -d postgres -f /docker-entrypoint-initdb.d/schema.sql`)
        console.log('🐘 Database synced')
    }
}()