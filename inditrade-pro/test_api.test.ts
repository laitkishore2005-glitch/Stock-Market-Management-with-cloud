import { describe, it, expect } from 'vitest'

describe('Functional Test - App Load', () => {
  it('should load homepage', async () => {
    const response = await fetch('http://localhost:3000')
    expect(response.status).toBe(200)
  })
})
