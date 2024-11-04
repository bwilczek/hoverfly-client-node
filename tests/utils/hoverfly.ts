import { Client } from "../../src"

export const HOVERFLY_PROXY_URL = process.env.http_proxy ?? 'http://127.0.0.1:8500'
export const HOVERFLY_ADMIN_URL = process.env.HOVERFLY_ADMIN_URL ?? 'http://127.0.0.1:8888'

export const client = new Client(HOVERFLY_ADMIN_URL)

export const resetState = async () => {
  await client.purgeSimulation()
  await client.setMode({mode: 'simulate'})
  await client.purgeMiddleware()
  await client.purgeJournal()
}
