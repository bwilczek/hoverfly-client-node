import { describe, expect, test } from '@jest/globals'

import { add } from '../src/index'

describe('jest integration', () => {
  test('executes properly', () => {
    expect(add(1, 2)).toBe(3)
  })
})
