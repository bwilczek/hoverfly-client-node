import { describe, expect, test } from '@jest/globals'
import { isEqual } from 'lodash'

import { buildSimulation, buildSimulationFromFile, decodeResponseBody, mergeSimulations, RequestMatcher, ResponseData, subtractSimulations } from '../src/index'

describe('Simulation', () => {
  test('buildSimulationFromFile', () => {
    const sim = buildSimulationFromFile('./tests/res/npmjs.json')
    const response = sim.data.pairs.at(0)!.response;
    expect(response.body).toBe('Forged NPMJS')
    expect(decodeResponseBody(response)).toBe('Forged NPMJS')
  })

  test('decodeResponseBody(base64)', () => {
    const sim = buildSimulationFromFile('./tests/res/base64_body.json')
    const response = sim.data.pairs.at(0)!.response;
    expect(decodeResponseBody(response)).toBe('Hello from base64')
  })

  test('decodeResponseBody(base64+gzip)', () => {
    const sim = buildSimulationFromFile('./tests/res/gzip_base64_body.json')
    const response = sim.data.pairs.at(0)!.response;
    expect(decodeResponseBody(response)).toBe('Hello from base64+gzip')
  })

  test('decodeResponseBody(base64+brotli)', () => {
    const sim = buildSimulationFromFile('./tests/res/brotli_base64_body.json')
    const response = sim.data.pairs.at(0)!.response;
    expect(decodeResponseBody(response)).toBe('Hello from base64+brotli')
  })

  test('mergeSimulations', () => {
    const response1: ResponseData = { status: 200, body: 'Forged Wikipedia', encodedBody: false, templated: false }
    const response2: ResponseData = { status: 200, body: 'Forged StackOverflow', encodedBody: false, templated: false }
    const response2overwrite: ResponseData = { status: 200, body: 'Reforged StackOverflow', encodedBody: false, templated: false }
    const response3: ResponseData = { status: 200, body: 'Forged NodeJS.org', encodedBody: false, templated: false }
    const request1: RequestMatcher = {
      path: [{ matcher: 'exact', value: '/' }],
      destination: [{ matcher: 'exact', value: 'en.wikipedia.org' }],
    }
    const request2: RequestMatcher = {
      path: [{ matcher: 'exact', value: '/' }],
      destination: [{ matcher: 'exact', value: 'stackoverflow.com' }],
    }
    const request3: RequestMatcher = {
      path: [{ matcher: 'exact', value: '/' }],
      destination: [{ matcher: 'exact', value: 'nodejs.org' }],
    }
    const pair1 = { request: request1, response: response1 }
    const pair2 = { request: request2, response: response2 }
    const pair2overwrite = { request: request2, response: response2overwrite }
    const pair3 = { request: request3, response: response3 }

    const sim1 = buildSimulation([pair1, pair2])
    const sim2 = buildSimulation([pair2overwrite, pair3])

    const merged = mergeSimulations(sim1, sim2)
    expect(merged.data.pairs.length).toBe(3)
    expect(merged.data.pairs.find(p => isEqual(p.request, request2) && isEqual(p.response, response2overwrite))).toBeDefined()
  })

  test('subtractSimulations', () => {
    const response1: ResponseData = { status: 200, body: 'Forged Wikipedia', encodedBody: false, templated: false }
    const response2: ResponseData = { status: 200, body: 'Forged StackOverflow', encodedBody: false, templated: false }
    const response3: ResponseData = { status: 200, body: 'Forged NodeJS.org', encodedBody: false, templated: false }
    const request1: RequestMatcher = {
      path: [{ matcher: 'exact', value: '/' }],
      destination: [{ matcher: 'exact', value: 'en.wikipedia.org' }],
    }
    const request2: RequestMatcher = {
      path: [{ matcher: 'exact', value: '/' }],
      destination: [{ matcher: 'exact', value: 'stackoverflow.com' }],
    }
    const request3: RequestMatcher = {
      path: [{ matcher: 'exact', value: '/' }],
      destination: [{ matcher: 'exact', value: 'nodejs.org' }],
    }
    const pair1 = { request: request1, response: response1 }
    const pair2 = { request: request2, response: response2 }
    const pair3 = { request: request3, response: response3 }

    const sim1 = buildSimulation([pair1, pair2])
    const sim2 = buildSimulation([pair2, pair3])

    const subtracted = subtractSimulations(sim1, sim2)
    expect(subtracted.data.pairs.length).toBe(1)
    expect(subtracted.data.pairs.find(p => isEqual(p.request, request1) && isEqual(p.response, response1))).toBeDefined()
  })
})
