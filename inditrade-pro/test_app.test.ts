import { describe, it, expect } from 'vitest'

function add(a: number, b: number) {
  return a + b
}

describe('Unit Test - Add Function', () => {
  it('should return correct sum', () => {
    expect(add(2, 3)).toBe(5)
  })

  it('intentional fail case (bug)', () => {
    expect(add(2, 2)).toBe(5) // fail case
  })
})
