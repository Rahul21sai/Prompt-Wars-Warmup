/**
 * Gemini Service Unit Tests
 * Tests prompt building and response parsing for the Gemini AI integration.
 */

import { describe, it, expect } from 'vitest'
import { buildGeminiPrompt, parseItineraryResponse } from '../services/geminiService'

describe('Gemini Prompt Builder', () => {
  const defaultParams = {
    destination: 'Paris',
    budget: 1000,
    duration: 3,
    style: 'Cultural',
  }

  it('includes destination in prompt', () => {
    const prompt = buildGeminiPrompt(defaultParams)
    expect(prompt).toContain('Paris')
  })

  it('includes budget in prompt', () => {
    const prompt = buildGeminiPrompt(defaultParams)
    expect(prompt).toContain('1000')
  })

  it('includes duration in prompt', () => {
    const prompt = buildGeminiPrompt(defaultParams)
    expect(prompt).toContain('3')
  })

  it('requests JSON format in prompt', () => {
    const prompt = buildGeminiPrompt(defaultParams)
    expect(prompt.toLowerCase()).toContain('json')
  })

  it('includes travel style in prompt', () => {
    const prompt = buildGeminiPrompt(defaultParams)
    expect(prompt).toContain('Cultural')
  })

  it('includes dietary preference when provided', () => {
    const prompt = buildGeminiPrompt({ ...defaultParams, dietary: 'vegetarian' })
    expect(prompt).toContain('vegetarian')
  })

  it('includes mobility preference when provided', () => {
    const prompt = buildGeminiPrompt({ ...defaultParams, mobility: 'wheelchair-accessible' })
    expect(prompt).toContain('wheelchair-accessible')
  })

  it('includes interests when provided', () => {
    const prompt = buildGeminiPrompt({ ...defaultParams, interests: ['museums', 'food'] })
    expect(prompt).toContain('museums')
    expect(prompt).toContain('food')
  })
})

describe('Itinerary Response Parser', () => {
  it('parses valid JSON itinerary', () => {
    const mock = JSON.stringify({
      days: [{ day: 1, activities: ['Visit Eiffel Tower'] }],
    })
    const result = parseItineraryResponse(mock)
    expect(result.days).toHaveLength(1)
  })

  it('throws on invalid JSON', () => {
    expect(() => parseItineraryResponse('not json')).toThrow()
  })

  it('strips markdown code fences from response', () => {
    const mock = '```json\n' + JSON.stringify({ days: [{ day: 1, activities: [] }] }) + '\n```'
    const result = parseItineraryResponse(mock)
    expect(result.days).toHaveLength(1)
  })

  it('throws when days array is missing', () => {
    const mock = JSON.stringify({ itinerary: 'no days key' })
    expect(() => parseItineraryResponse(mock)).toThrow('missing "days" array')
  })

  it('parses itinerary with multiple days', () => {
    const mock = JSON.stringify({
      days: [
        { day: 1, theme: 'Arrival', activities: [] },
        { day: 2, theme: 'Exploration', activities: [] },
        { day: 3, theme: 'Departure', activities: [] },
      ],
      totalEstimatedCost: 800,
    })
    const result = parseItineraryResponse(mock)
    expect(result.days).toHaveLength(3)
    expect(result.totalEstimatedCost).toBe(800)
  })
})
