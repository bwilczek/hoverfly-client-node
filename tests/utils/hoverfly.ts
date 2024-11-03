import { Client } from "../../src"

export const client = new Client(process.env.HOVERFLY_ADMIN_URL ?? 'http://127.0.0.1:8888')

export const resetState = async () => {

}
