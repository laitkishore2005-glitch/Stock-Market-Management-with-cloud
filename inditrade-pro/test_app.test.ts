import { describe, it, expect } from 'vitest'

// Mock functions (simulate your system logic)
function buyStock(balance: number, qty: number, price: number) {
  if (qty <= 0) throw new Error("Invalid quantity")
  const total = qty * price
  if (balance < total) throw new Error("Insufficient balance")
  return balance - total
}

function sellStock(balance: number, qty: number, price: number) {
  return balance + (qty * price)
}

function updatePortfolio(portfolio: any[], stock: string, qty: number) {
  portfolio.push({ stock, qty })
  return portfolio
}

describe('Stock Market Management Tests', () => {

  it('TC1: Buy stock reduces balance', () => {
    expect(buyStock(10000, 5, 1000)).toBe(5000)
  })

  it('TC2: Sell stock increases balance', () => {
    expect(sellStock(5000, 5, 1000)).toBe(10000)
  })

  it('TC3: Negative quantity should fail', () => {
    expect(() => buyStock(10000, -5, 1000)).toThrow()
  })

  it('TC4: Insufficient balance should fail', () => {
    expect(() => buyStock(1000, 5, 1000)).toThrow()
  })

  it('TC5: Portfolio update works', () => {
    const result = updatePortfolio([], 'AAPL', 5)
    expect(result.length).toBe(1)
  })

})
