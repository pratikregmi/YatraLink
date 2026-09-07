import { useEffect, useState } from 'react'
import './App.css'
import { getHealthStatus } from './lib/api'

function App() {
  const [status, setStatus] = useState<{ status: string; service: string } | null>(
    null,
  )
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchHealth() {
      try {
        const health = await getHealthStatus()
        setStatus(health)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Unable to reach YatraOne API.',
        )
      }
    }

    void fetchHealth()
  }, [])

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <p className="eyebrow">YatraOne</p>
        <h1>Project foundation is live.</h1>
        <p className="subtitle">
          React frontend connected to the FastAPI backend foundation for the
          YatraOne platform.
        </p>

        <div className="status-card">
          <h2>API health</h2>
          {error ? (
            <p className="status-error">{error}</p>
          ) : status ? (
            <div className="status-readout" data-testid="health-status">
              <span>Status: {status.status}</span>
              <span>Service: {status.service}</span>
            </div>
          ) : (
            <p className="status-loading">Checking backend connectivity…</p>
          )}
        </div>
      </section>
    </main>
  )
}

export default App
