import { useEffect, useState } from 'react'

import { AuthModal } from './components/auth/AuthModal'
import { getCurrentUser, type UserResponse } from './lib/api'
import './App.css'

function Logo() {
  return (
    <a href="/" className="logo">
      <div className="logo-icon">
        <span className="logo-y">Y</span>
        <span className="logo-pin">●</span>
      </div>

      <span className="logo-text">
        Yatra<span>Link</span>
      </span>
    </a>
  )
}

const services = [
  {
    icon: '◉',
    title: 'Local Guides',
    description:
      'Meet trusted local people who know Nepal and can make your journey easier.',
  },
  {
    icon: '⌁',
    title: 'Trekking',
    description:
      'Find guides, Sherpas, porters and trekking professionals for your adventure.',
  },
  {
    icon: '↗',
    title: 'Transport',
    description:
      'Connect with reliable local drivers and transportation services.',
  },
  {
    icon: '✦',
    title: 'Experiences',
    description:
      'Discover authentic experiences and places beyond the usual tourist routes.',
  },
]

function App() {
  const [user, setUser] = useState<UserResponse | null>(null)
  const [authOpen, setAuthOpen] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('yatra-link-token')
    if (!token) {
      return
    }

    getCurrentUser(token)
      .then((profile) => setUser(profile))
      .catch(() => {
        localStorage.removeItem('yatra-link-token')
      })
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('yatra-link-token')
    setUser(null)
  }

  return (
    <div className="landing-page">
      <header className="navbar">
        <Logo />

        <nav className="navigation">
          <a href="#home">Home</a>
          <a href="#explore">Explore</a>
          <a href="#services">Services</a>
          <a href="#about">About</a>
        </nav>

        <button className="get-started" onClick={() => setAuthOpen(true)}>
          {user ? 'My Account' : 'Get Started'}
        </button>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-background" />
          <div className="hero-overlay" />

          <div className="hero-content">
            <h1>
              Discover Nepal
              <br />
              with trusted people
              <br />
              and local services.
            </h1>

            <p className="hero-subtitle">One app. One journey. One trusted network.</p>

            <div className="search-container">
              <input type="text" placeholder="What are you looking for?" />

              <button className="search-button" aria-label="Search">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-4-4" />
                </svg>
              </button>
            </div>
          </div>
        </section>

        <section className="intro-section" id="explore">
          <div className="intro-left">
            <span className="section-label">YOUR JOURNEY STARTS HERE</span>
            <h2>
              Nepal is more than
              <br />
              <span>a destination.</span>
            </h2>
          </div>

          <div className="intro-right">
            <p>
              YatraLink connects travelers with trusted local people and services across Nepal.
              From finding a guide in Kathmandu to discovering the trails of the Himalayas,
              everything you need for your journey is in one place.
            </p>

            <a href="#services" className="text-link">
              Explore what we offer
              <span>→</span>
            </a>
          </div>
        </section>

        <section className="services-section" id="services">
          <div className="section-heading">
            <div>
              <span className="section-label">ONE JOURNEY. MANY POSSIBILITIES.</span>
              <h2>
                Everything you need
                <br />
                <span>to experience Nepal.</span>
              </h2>
            </div>

            <p>
              From your first step in Kathmandu to the trails of the Himalayas, YatraLink helps
              you find the people and services that make your journey better.
            </p>
          </div>

          <div className="services-grid">
            {services.map((service) => (
              <article className="service-card" key={service.title}>
                <div className="service-top">
                  <div className="service-icon">{service.icon}</div>
                  <span className="service-number">0{services.indexOf(service) + 1}</span>
                </div>

                <h3>{service.title}</h3>
                <p>{service.description}</p>

                <div className="service-bottom">
                  <span>Explore</span>
                  <span className="service-arrow">→</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="how-section" id="how-it-works">
          <div className="how-content">
            <span className="section-label">SIMPLE BY DESIGN</span>

            <h2>
              Your journey starts
              <br />
              <span>with one connection.</span>
            </h2>

            <p className="how-description">
              Discover trusted local people, compare your options, connect with the right service
              and enjoy Nepal with confidence.
            </p>

            <div className="steps">
              <div className="step">
                <span className="step-number">01</span>
                <div>
                  <h3>Discover</h3>
                  <p>Find guides, services and experiences around your destination.</p>
                </div>
              </div>

              <div className="step">
                <span className="step-number">02</span>
                <div>
                  <h3>Connect</h3>
                  <p>Compare profiles, languages, ratings and services before choosing.</p>
                </div>
              </div>

              <div className="step">
                <span className="step-number">03</span>
                <div>
                  <h3>Experience</h3>
                  <p>Book confidently and enjoy your journey with trusted local connections.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="how-visual">
            <div className="visual-card">
              <div className="visual-header">
                <span>YOUR JOURNEY</span>
                <span>Nepal</span>
              </div>

              <div className="journey-map">
                <div className="map-line" />
                <div className="map-point point-one">
                  <span />
                </div>
                <div className="map-point point-two">
                  <span />
                </div>
                <div className="map-point point-three">
                  <span />
                </div>

                <div className="map-label map-label-one">Kathmandu</div>
                <div className="map-label map-label-two">Pokhara</div>
                <div className="map-label map-label-three">Himalayas</div>
              </div>

              <div className="nearby-card">
                <div className="guide-avatar">S</div>
                <div className="guide-info">
                  <strong>Local guide</strong>
                  <span>English · 4.9 ★</span>
                </div>
                <div className="available">Available</div>
              </div>
            </div>
          </div>
        </section>

        <section className="trust-section">
          <div className="trust-inner">
            <div className="trust-icon">✓</div>

            <div>
              <span className="trust-label">BUILT AROUND TRUST</span>
              <h2>
                Meet the people
                <br />
                <span>behind your journey.</span>
              </h2>
            </div>

            <p>
              YatraLink is designed to make discovering local services simpler, safer and more
              personal. Every connection starts with people.
            </p>
          </div>
        </section>

        <section className="final-section" id="about">
          <div className="final-background" />
          <div className="final-overlay" />

          <div className="final-content">
            <span className="section-label light">THE JOURNEY IS YOURS</span>

            <h2>
              Nepal is waiting.
              <br />
              <span>Let's make it unforgettable.</span>
            </h2>

            <p>One app. One journey. One trusted network.</p>

            <button className="final-button">
              Start exploring
              <span>→</span>
            </button>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-main">
          <div className="footer-brand">
            <Logo />
            <p>Connecting travelers with trusted local people and services in Nepal.</p>
          </div>

          <div className="footer-column">
            <strong>Explore</strong>
            <a href="#home">Home</a>
            <a href="#explore">Explore</a>
            <a href="#services">Services</a>
          </div>

          <div className="footer-column">
            <strong>YatraLink</strong>
            <a href="#about">About</a>
            <a href="/">Become a provider</a>
            <a href="/">Contact</a>
          </div>

          <div className="footer-column">
            <strong>Follow</strong>
            <a href="/">Instagram</a>
            <a href="/">Facebook</a>
            <a href="/">LinkedIn</a>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 YatraLink. All rights reserved.</span>
          <span>Nepal · Built for the world</span>
        </div>
      </footer>
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuthenticated={(profile) => {
          setUser(profile)
          setAuthOpen(false)
        }}
        onLogout={() => {
          handleLogout()
          setAuthOpen(false)
        }}
        user={user}
      />
    </div>
  )
}

export default App