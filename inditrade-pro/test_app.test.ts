import { describe, it, expect } from 'vitest'

function add(a: number, b: number) {
  return a + b
}

describe('Unit Test - Add Function', () => {
  it('should return correct sum', () => {
    expect(add(2, 2)).toBe(4) // correct
  })

  it('intentional fail case (bug tracking)', () => {
    expect(add(2, 2)).toBe(4) // correct
  })
})
