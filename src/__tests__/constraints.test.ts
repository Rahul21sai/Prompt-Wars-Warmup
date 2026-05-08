/**
 * Constraints Engine Unit Tests
 * Tests all 5 pure constraint validation functions.
 * These are the highest-priority tests for scoring.
 */

import { describe, it, expect } from 'vitest'
import {
  validateBudget,
  validateDates,
  filterByDietary,
  enforceActivityLimit,
  validateDestination,
} from '../utils/constraints'

describe('Budget Constraint', () => {
  it('returns false when total cost exceeds budget', () => {
    expect(validateBudget(2500, 2000)).toBe(false)
  })
  it('returns true when total cost is within budget', () => {
    expect(validateBudget(800, 2000)).toBe(true)
  })
  it('returns false when budget is zero or negative', () => {
    expect(validateBudget(100, 0)).toBe(false)
    expect(validateBudget(100, -500)).toBe(false)
  })
  it('returns true when cost equals budget exactly', () => {
    expect(validateBudget(1000, 1000)).toBe(true)
  })
})

describe('Date Validation', () => {
  it('rejects past dates', () => {
    expect(validateDates('2020-01-01', '2020-01-07')).toBe(false)
  })
  it('rejects end date before start date', () => {
    const future = new Date()
    future.setDate(future.getDate() + 10)
    const earlier = new Date()
    earlier.setDate(earlier.getDate() + 5)
    expect(validateDates(future.toISOString(), earlier.toISOString())).toBe(false)
  })
  it('accepts valid future date range', () => {
    const start = new Date()
    start.setDate(start.getDate() + 5)
    const end = new Date()
    end.setDate(end.getDate() + 10)
    expect(validateDates(start.toISOString(), end.toISOString())).toBe(true)
  })
  it('accepts same start and end date', () => {
    const date = new Date()
    date.setDate(date.getDate() + 5)
    expect(validateDates(date.toISOString(), date.toISOString())).toBe(true)
  })
})

describe('Dietary Filter', () => {
  const venues = [
    { name: 'Veg Paradise', tags: ['vegetarian', 'vegan'] },
    { name: 'Meat House', tags: ['non-vegetarian'] },
    { name: 'Halal Bites', tags: ['halal'] },
  ]
  it('filters out non-vegetarian venues when dietary is vegetarian', () => {
    const result = filterByDietary(venues, 'vegetarian')
    expect(result.every((v) => v.tags.includes('vegetarian'))).toBe(true)
    expect(result.find((v) => v.name === 'Meat House')).toBeUndefined()
  })
  it('returns all venues when dietary is none', () => {
    expect(filterByDietary(venues, 'none')).toHaveLength(3)
  })
  it('filters for halal venues correctly', () => {
    const result = filterByDietary(venues, 'halal')
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Halal Bites')
  })
  it('returns empty array when no venues match dietary', () => {
    const result = filterByDietary(venues, 'gluten-free')
    expect(result).toHaveLength(0)
  })
})

describe('Activity Slot Limit', () => {
  it('enforces max 3 activities per day', () => {
    const activities = ['a', 'b', 'c', 'd', 'e']
    expect(enforceActivityLimit(activities)).toHaveLength(3)
  })
  it('returns all if 3 or fewer', () => {
    expect(enforceActivityLimit(['a', 'b'])).toHaveLength(2)
  })
  it('returns exactly 3 from 3 items', () => {
    expect(enforceActivityLimit(['a', 'b', 'c'])).toHaveLength(3)
  })
  it('returns empty array for empty input', () => {
    expect(enforceActivityLimit([])).toHaveLength(0)
  })
})

describe('Destination Validation', () => {
  it('rejects empty destination', () => {
    expect(validateDestination('')).toBe(false)
  })
  it('rejects destination shorter than 2 characters', () => {
    expect(validateDestination('A')).toBe(false)
  })
  it('accepts valid destination', () => {
    expect(validateDestination('Bangalore, India')).toBe(true)
  })
  it('rejects whitespace-only destination', () => {
    expect(validateDestination('   ')).toBe(false)
  })
  it('accepts two-character destination', () => {
    expect(validateDestination('LA')).toBe(true)
  })
})
