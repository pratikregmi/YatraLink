import { useState } from 'react'

import {
  getApiErrorMessage,
  onboardProvider,
  type ProviderCategory,
} from '../../lib/api'
import './Onboarding.css'

const categories: Array<{
  value: ProviderCategory
  label: string
  description: string
  icon: string
}> = [
  { value: 'guide', label: 'Local guide', description: 'Share context, culture, and the places you know best.', icon: '✦' },
  { value: 'sherpa', label: 'Sherpa', description: 'Support visitors with mountain expertise and care.', icon: '⌁' },
  { value: 'trekking_guide', label: 'Trekking guide', description: 'Lead confident, well-planned journeys on the trail.', icon: '↗' },
  { value: 'porter', label: 'Porter', description: 'Help travelers move safely and comfortably.', icon: '◆' },
  { value: 'driver', label: 'Driver', description: 'Make local travel reliable from road to destination.', icon: '●' },
]

type FormState = {
  category: ProviderCategory | ''
  bio: string
  years_experience: string
  daily_rate: string
}

type OnboardingProps = {
  navigate: (path: string) => void
  onComplete: () => Promise<void>
}

const initialForm: FormState = {
  category: '',
  bio: '',
  years_experience: '',
  daily_rate: '',
}

export default function ProviderOnboarding({ navigate, onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormState>(initialForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const selectedCategory = categories.find((category) => category.value === form.category)

  const updateForm = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
    setError('')
  }

  const validateStep = () => {
    if (step === 1 && !form.category) {
      setError('Choose the service you provide.')
      return false
    }

    if (step === 2) {
      if (form.bio.trim().length < 20) {
        setError('Tell travelers a little more about your experience, in at least 20 characters.')
        return false
      }
      const years = Number(form.years_experience)
      if (!Number.isInteger(years) || years < 0 || years > 80) {
        setError('Enter a whole number of years between 0 and 80.')
        return false
      }
    }

    if (step === 3 && form.daily_rate && Number(form.daily_rate) < 0) {
      setError('Daily rate cannot be negative.')
      return false
    }

    return true
  }

  const handleNext = () => {
    if (validateStep()) {
      setStep((current) => Math.min(current + 1, 3))
    }
  }

  const handleSubmit = async () => {
    if (!validateStep() || !form.category) {
      return
    }

    setLoading(true)
    setError('')

    try {
      await onboardProvider({
        category: form.category,
        bio: form.bio.trim(),
        years_experience: Number(form.years_experience),
        daily_rate: form.daily_rate || null,
      })
      await onComplete()
      navigate('/account')
    } catch (submissionError) {
      setError(getApiErrorMessage(submissionError, 'Unable to create your provider profile.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="provider-onboarding-shell">
      <section className="provider-onboarding-card" aria-labelledby="provider-onboarding-title">
        <div className="provider-onboarding-header">
          <span className="provider-kicker">YatraLink providers</span>
          <h1 id="provider-onboarding-title">Become a provider</h1>
          <p>Build a profile travelers can trust, one clear step at a time.</p>
        </div>

        <div className="provider-progress" aria-label={`Step ${step} of 3`}>
          {[1, 2, 3].map((progressStep) => (
            <span
              className={progressStep <= step ? 'provider-progress-dot provider-progress-dot--active' : 'provider-progress-dot'}
              key={progressStep}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="provider-step">
            <div className="provider-step-heading">
              <span>01 / 03</span>
              <h2>What do you offer?</h2>
              <p>Choose the category that best describes your work.</p>
            </div>
            <div className="provider-category-grid">
              {categories.map((category) => (
                <label
                  className={form.category === category.value ? 'provider-category provider-category--selected' : 'provider-category'}
                  key={category.value}
                >
                  <input
                    type="radio"
                    name="category"
                    value={category.value}
                    checked={form.category === category.value}
                    onChange={(event) => updateForm('category', event.target.value)}
                  />
                  <span className="provider-icon-circle" aria-hidden="true">{category.icon}</span>
                  <span className="provider-category-copy">
                    <strong>{category.label}</strong>
                    <small>{category.description}</small>
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="provider-step">
            <div className="provider-step-heading">
              <span>02 / 03</span>
              <h2>Tell your story</h2>
              <p>Give travelers a useful sense of your experience.</p>
            </div>
            <label className="provider-field">
              <span>Short bio</span>
              <textarea
                value={form.bio}
                onChange={(event) => updateForm('bio', event.target.value)}
                placeholder="What should travelers know about working with you?"
                rows={5}
              />
              <small>{form.bio.length}/2000</small>
            </label>
            <label className="provider-field">
              <span>Years of experience</span>
              <input
                type="number"
                min="0"
                max="80"
                step="1"
                value={form.years_experience}
                onChange={(event) => updateForm('years_experience', event.target.value)}
                placeholder="e.g. 6"
              />
            </label>
          </div>
        )}

        {step === 3 && (
          <div className="provider-step">
            <div className="provider-step-heading">
              <span>03 / 03</span>
              <h2>Set your starting rate</h2>
              <p>You can change this later as your services grow.</p>
            </div>
            <label className="provider-field">
              <span>Daily rate in USD <em>optional</em></span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.daily_rate}
                onChange={(event) => updateForm('daily_rate', event.target.value)}
                placeholder="e.g. 45.00"
              />
            </label>
            <div className="provider-review">
              <span className="provider-icon-circle" aria-hidden="true">✓</span>
              <div>
                <strong>Ready to publish</strong>
                <p>{selectedCategory?.label} · {form.years_experience} years experience</p>
              </div>
            </div>
          </div>
        )}

        {error && <p className="provider-form-error" role="alert">{error}</p>}

        <div className="provider-actions">
          <button type="button" className="provider-back-button" onClick={() => (step === 1 ? navigate('/account') : setStep((current) => current - 1))}>
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          {step < 3 ? (
            <button type="button" className="provider-next-button" onClick={handleNext}>
              Continue
            </button>
          ) : (
            <button type="button" className="provider-next-button" onClick={() => void handleSubmit()} disabled={loading}>
              {loading ? 'Publishing...' : 'Publish profile'}
            </button>
          )}
        </div>
      </section>
    </main>
  )
}
