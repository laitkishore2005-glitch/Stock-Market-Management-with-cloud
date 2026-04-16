import { describe, it, expect } from 'vitest'

describe('Functional Test - App Load', () => {
  it('should return 200 status', async () => {
    const res = await fetch('http://localhost:3000')
    expect(res.status).toBe(200)
  })
})
