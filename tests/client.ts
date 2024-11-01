import { describe, expect, test } from '@jest/globals'

import { Client } from '../src/index'

// PRE-REQUISITE: hoverfly is running

describe('Client', () => {
  test('fetches current simulation', async () => {
    const client = new Client(process.env.HOVERFLY_ADMIN_URL ?? 'http://127.0.0.1:8888')
    const sim = await client.getSimulation()
    expect(sim.meta.hoverflyVersion).toBeDefined()
  })
})
