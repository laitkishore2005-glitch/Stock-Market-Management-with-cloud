import { describe, it, expect } from 'vitest'

function add(a: number, b: number) {
  return a + b
}

describe('Unit Test - Add Function', () => {

  it('Test 1: should return correct sum', () => {
    expect(add(2, 2)).toBe(4)
  })

  it('Test 2: should handle negative numbers', () => {
    expect(add(-2, -3)).toBe(-5)
  })

  it('Test 3: should handle zero', () => {
    expect(add(0, 5)).toBe(5)
  })

  it('Test 4: should handle large numbers', () => {
    expect(add(1000, 2000)).toBe(3000)
  })

  it('Test 5: intentional fail case (bug tracking)', () => {
    expect(add(2, 2)).toBe(5) //  intentional fail
  })

})
