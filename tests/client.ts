import * as axios from "axios";
import { describe, expect, test } from '@jest/globals'

import { client, resetState, HOVERFLY_PROXY_URL } from './utils/hoverfly'
import { buildSimulationFromFile } from '../src'

describe('Client', () => {
  beforeEach(async () => {
    await resetState()
  })

  test('getSimulation', async () => {
    const sim = await client.getSimulation()
    expect(sim.meta.hoverflyVersion).toBeDefined()
  })

  test('uploadSimulation', async () => {
    const nodeJsSim = buildSimulationFromFile('./tests/res/npmjs.json')
    await client.uploadSimulation(nodeJsSim)
    const sim = await client.getSimulation()
    expect(sim.data.pairs.at(0)?.response.body).toBe('Forged NPMJS')
  })

  test('serve simulated response', async () => {
    const nodeJsSim = buildSimulationFromFile('./tests/res/npmjs.json')
    await client.uploadSimulation(nodeJsSim)

    const httpProxyUrl = new URL(HOVERFLY_PROXY_URL)

    const http = axios.create({
      baseURL: 'https://www.npmjs.com/',
      proxy: {
        protocol: httpProxyUrl.protocol,
        host: httpProxyUrl.hostname,
        port: parseInt(httpProxyUrl.port)
      }
    })
    const nodeResponse = await http.get('/')
    expect(nodeResponse.data).toContain('Forged NPMJS')

    const journal = await client.getJournal()
    expect(journal.journal.length).toBe(1)

    const filteredJournal = await client.searchJournal({request: {destination: [{matcher: "exact", value: "www.npmjs.com"}]}})
    expect(filteredJournal.journal.length).toBe(1)

    const emptyJournal = await client.searchJournal({request: {destination: [{matcher: "exact", value: "www.nosuchhost.com"}]}})
    expect(emptyJournal.journal.length).toBe(0)
  })
});
