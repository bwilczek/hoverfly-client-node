import { describe, expect, test } from '@jest/globals'

import { client, resetState } from './utils/hoverfly'

describe('Client', () => {
  beforeEach(async () => {
    await resetState()
  })

  test('fetches current simulation', async () => {
    const sim = await client.getSimulation()
    expect(sim.meta.hoverflyVersion).toBeDefined()
  })
});
