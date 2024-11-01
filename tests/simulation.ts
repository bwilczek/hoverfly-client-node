import { describe, expect, test } from '@jest/globals'

import { buildSimulationFromFile, Simulation } from '../src/index'

describe('Simulation', () => {
  test('loads from file', () => {
    const sim = buildSimulationFromFile('./tests/res/npmjs.json')
    expect(sim.data.pairs.at(0)?.response.body).toBe('Tampered body.')
  })
})
