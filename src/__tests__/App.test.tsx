/**
 * App Component Integration Tests
 * Verifies that the main App renders correctly with key UI elements.
 */

import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from '../App'

describe('App Component', () => {
  it('renders without crashing', () => {
    render(<App />)
    expect(document.body).toBeTruthy()
  })

  it('shows destination input field', () => {
    render(<App />)
    expect(screen.getByLabelText(/destination/i)).toBeInTheDocument()
  })

  it('shows generate itinerary button', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: /generate/i })).toBeInTheDocument()
  })

  it('shows the WanderlustAI header', () => {
    render(<App />)
    expect(screen.getByText(/WanderlustAI/i) || screen.getByText(/Wanderlust/i)).toBeTruthy()
  })

  it('shows budget input field', () => {
    render(<App />)
    expect(screen.getByLabelText(/budget/i)).toBeInTheDocument()
  })

  it('shows travel style selector', () => {
    render(<App />)
    expect(screen.getByLabelText(/travel style/i)).toBeInTheDocument()
  })
})
