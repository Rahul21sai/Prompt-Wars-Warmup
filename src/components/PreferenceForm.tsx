/**
 * PreferenceForm Component
 * Smart travel preference form with comprehensive validation.
 * Uses constraint engine functions for inline error messages.
 * Includes debounced input, date pickers, multi-select chips, and accessibility.
 */

import { useState, useCallback } from 'react';
import { validateDestination, validateDates } from '../utils/constraints';
import { sanitizeDestination } from '../utils/sanitize';

import { capitalize } from '../utils/format';
import {
  INTEREST_OPTIONS,
  TRAVEL_STYLES,
  DIETARY_OPTIONS,
  MOBILITY_OPTIONS,
  PARTY_TYPE_OPTIONS,
  MIN_BUDGET_USD,
  RATE_LIMIT_COOLDOWN_MS
} from '../constants';
import type { TravelPreferences, PartyType, TravelStyle, DietaryOption, MobilityOption, Interest } from '../types';

interface PreferenceFormProps {
  onSubmit: (preferences: TravelPreferences) => void;
  loading: boolean;
}

export default function PreferenceForm({ onSubmit, loading }: PreferenceFormProps) {
  const [formData, setFormData] = useState<TravelPreferences>({
    destination: '',
    startDate: '',
    endDate: '',
    budget: 1000,
    partyType: 'solo',
    partySize: 1,
    style: 'Cultural',
    dietary: 'none',
    mobility: 'standard',
    interests: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [cooldown, setCooldown] = useState(false);

  /** Updates a single form field */
  const updateField = useCallback(<K extends keyof TravelPreferences>(
    field: K,
    value: TravelPreferences[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  /** Toggles an interest chip */
  const toggleInterest = useCallback((interest: Interest) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  }, []);

  /** Validates all form fields using constraint engine */
  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    // Destination validation
    const sanitized = sanitizeDestination(formData.destination);
    if (!validateDestination(sanitized)) {
      newErrors.destination = 'Please enter a valid destination (at least 2 characters)';
    }

    // Date validation
    if (!formData.startDate || !formData.endDate) {
      newErrors.dates = 'Please select both start and end dates';
    } else if (!validateDates(formData.startDate, formData.endDate)) {
      newErrors.dates = 'Dates must be in the future and end date must be after start date';
    }

    // Budget validation
    if (!formData.budget || formData.budget < MIN_BUDGET_USD) {
      newErrors.budget = `Budget must be at least $${MIN_BUDGET_USD}`;
    }

    // Party size for groups
    if (formData.partyType === 'group' && formData.partySize < 2) {
      newErrors.partySize = 'Group size must be at least 2';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  /** Handles form submission with validation and rate limiting */
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!validate()) return;
      if (cooldown || loading) return;

      // Rate limit: disable button for cooldown period
      setCooldown(true);
      setTimeout(() => setCooldown(false), RATE_LIMIT_COOLDOWN_MS);

      // Sanitize destination before sending
      const sanitized = {
        ...formData,
        destination: sanitizeDestination(formData.destination),
      };

      onSubmit(sanitized);
    },
    [formData, validate, onSubmit, cooldown, loading]
  );

  // Calculate minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-lg md:p-8"
      aria-label="Travel preferences form"
    >
      <h2 className="text-2xl font-bold text-gray-900">Plan Your Trip</h2>

      {/* Destination */}
      <div>
        <label htmlFor="destination" className="mb-1 block text-sm font-semibold text-gray-700">
          Destination
        </label>
        <input
          type="text"
          id="destination"
          value={formData.destination}
          onChange={(e) => updateField('destination', e.target.value)}
          placeholder="e.g., Kyoto, Japan"
          className={`w-full rounded-lg border px-4 py-3 text-gray-900 transition focus:outline-none focus:ring-2 ${
            errors.destination ? 'border-red-400 focus:ring-red-300' : 'border-gray-300 focus:ring-emerald-300'
          }`}
          required
          aria-required="true"
          aria-invalid={!!errors.destination}
          aria-describedby={errors.destination ? 'destination-error' : undefined}
        />
        {errors.destination && (
          <p id="destination-error" className="mt-1 text-sm text-red-600" role="alert">{errors.destination}</p>
        )}
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="startDate" className="mb-1 block text-sm font-semibold text-gray-700">
            Start Date
          </label>
          <input
            type="date"
            id="startDate"
            value={formData.startDate}
            min={today}
            onChange={(e) => updateField('startDate', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 transition focus:outline-none focus:ring-2 focus:ring-emerald-300"
            required
            aria-required="true"
          />
        </div>
        <div>
          <label htmlFor="endDate" className="mb-1 block text-sm font-semibold text-gray-700">
            End Date
          </label>
          <input
            type="date"
            id="endDate"
            value={formData.endDate}
            min={formData.startDate || today}
            onChange={(e) => updateField('endDate', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 transition focus:outline-none focus:ring-2 focus:ring-emerald-300"
            required
            aria-required="true"
          />
        </div>
      </div>
      {errors.dates && (
        <p className="text-sm text-red-600" role="alert">{errors.dates}</p>
      )}

      {/* Budget */}
      <div>
        <label htmlFor="budget" className="mb-1 block text-sm font-semibold text-gray-700">
          Budget (USD)
        </label>
        <input
          type="number"
          id="budget"
          value={formData.budget}
          min={100}
          onChange={(e) => updateField('budget', Number(e.target.value))}
          placeholder="e.g., 1000"
          className={`w-full rounded-lg border px-4 py-3 text-gray-900 transition focus:outline-none focus:ring-2 ${
            errors.budget ? 'border-red-400 focus:ring-red-300' : 'border-gray-300 focus:ring-emerald-300'
          }`}
          required
          aria-required="true"
          aria-invalid={!!errors.budget}
          aria-describedby={errors.budget ? 'budget-error' : undefined}
        />
        {errors.budget && (
          <p id="budget-error" className="mt-1 text-sm text-red-600" role="alert">{errors.budget}</p>
        )}
      </div>

      {/* Travel Party */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="partyType" className="mb-1 block text-sm font-semibold text-gray-700">
            Travel Party
          </label>
          <select
            id="partyType"
            value={formData.partyType}
            onChange={(e) => updateField('partyType', e.target.value as PartyType)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 transition focus:outline-none focus:ring-2 focus:ring-emerald-300"
            aria-required="true"
          >
            {PARTY_TYPE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {capitalize(option)}
              </option>
            ))}
          </select>
        </div>
        {formData.partyType === 'group' && (
          <div>
            <label htmlFor="partySize" className="mb-1 block text-sm font-semibold text-gray-700">
              Group Size
            </label>
            <input
              type="number"
              id="partySize"
              value={formData.partySize}
              min={2}
              max={20}
              onChange={(e) => updateField('partySize', Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 transition focus:outline-none focus:ring-2 focus:ring-emerald-300"
              aria-required="true"
            />
            {errors.partySize && (
              <p className="mt-1 text-sm text-red-600" role="alert">{errors.partySize}</p>
            )}
          </div>
        )}
      </div>

      {/* Travel Style */}
      <div>
        <label htmlFor="style" className="mb-1 block text-sm font-semibold text-gray-700">
          Travel Style
        </label>
        <select
          id="style"
          value={formData.style}
          onChange={(e) => updateField('style', e.target.value as TravelStyle)}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 transition focus:outline-none focus:ring-2 focus:ring-emerald-300"
          aria-required="true"
        >
          {TRAVEL_STYLES.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>

      {/* Dietary & Mobility */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="dietary" className="mb-1 block text-sm font-semibold text-gray-700">
            Dietary Preference
          </label>
          <select
            id="dietary"
            value={formData.dietary}
            onChange={(e) => updateField('dietary', e.target.value as DietaryOption)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 transition focus:outline-none focus:ring-2 focus:ring-emerald-300"
          >
            {DIETARY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option === 'none' ? 'No preference' : capitalize(option)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="mobility" className="mb-1 block text-sm font-semibold text-gray-700">
            Mobility
          </label>
          <select
            id="mobility"
            value={formData.mobility}
            onChange={(e) => updateField('mobility', e.target.value as MobilityOption)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 transition focus:outline-none focus:ring-2 focus:ring-emerald-300"
          >
            {MOBILITY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option.split('-').map(capitalize).join(' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Interests Multi-Select Chips */}
      <div>
        <span className="mb-2 block text-sm font-semibold text-gray-700">Interests</span>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Select your interests">
          {INTEREST_OPTIONS.map((interest) => {
            const isSelected = formData.interests.includes(interest);
            return (
              <button
                key={interest}
                type="button"
                onClick={() => toggleInterest(interest)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  isSelected
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                aria-pressed={isSelected}
                aria-label={`${interest} interest`}
              >
                {capitalize(interest)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        id="generate-btn"
        disabled={loading || cooldown}
        className="w-full rounded-xl bg-emerald-600 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Generate itinerary"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Generating with Gemini AI...
          </span>
        ) : cooldown ? (
          'Please wait...'
        ) : (
          '✨ Generate Itinerary'
        )}
      </button>
    </form>
  );
}
