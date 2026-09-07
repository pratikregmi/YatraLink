# YatraLink

YatraOne is a Nepal-based tourism marketplace connecting travelers with local guides, drivers, and service providers. This repository currently contains the foundation branch for the platform architecture and shared development setup.

## Repository structure

- `frontend/` – React + TypeScript + Vite application
- `backend/` – FastAPI + SQLAlchemy + Pydantic service foundation
- `docs/` – project documentation and engineering instructions
- `.github/` – CI workflow configuration
- `README.md` – project overview and setup notes

## Current branch scope

This branch focuses only on the project foundation:

- frontend scaffolding and configuration
- backend app structure and configuration
- PostgreSQL-ready architecture
- health endpoint at `/api/v1/health`
- environment examples
- CORS setup and API service layer
- linting, formatting, and basic tests
- initial documentation

The following are intentionally not implemented in this branch:

- authentication
- guide search
- maps
- bookings
- payments
- messaging
- reviews
- dashboards
- AI features

## Local development

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Health check

```http
GET /api/v1/health
```

```json
{
  "status": "ok",
  "service": "yatraone-api"
}
```

## Verification

- Frontend lint/build: `npm run lint` and `npm run build`
- Backend tests/lint: `pytest -q` and `ruff check .`

This repository is intentionally focused on foundation work only, as requested for the feature/project-setup branch.

🚘 Private Cars
🚙 SUVs
🚐 Vans
🛻 Jeeps / 4x4
👨‍✈️ Drivers
🗺️ Multi-day Vehicle Hire

Travelers should be able to view:

Vehicle information
Provider information
Pricing
Availability
Capacity
Ratings
Verification information

and book directly through the platform.

🛡️ Trust & Verification

Trust is a core part of the YatraOne product.

The platform is designed around structured provider verification rather than simply displaying a generic "verified" label.

Potential verification layers include:

Identity Verification

Confirming the identity of the provider.

Certificate Verification

Checking relevant certificates or qualifications where applicable.

Phone Verification

Confirming provider contact information.

Profile Verification

Checking profile information.

Experience Verification

Reviewing experience-related information.

Customer Reviews

Building reputation through completed bookings and customer feedback.

Safety & Dispute Management

Supporting complaint resolution and safety policies.

Provider trust indicators may include:

✓ Identity Verified
✓ Certificate Verified
✓ Experienced Provider
★ Highly Rated

Important: Verification badges represent only information that has actually been checked. YatraOne should never imply that every provider or every claim is fully verified.

🔐 Privacy by Design

YatraOne does not position itself as a continuous tourist-tracking platform.

Location-based services operate with user consent.

For example:

Location Permission
        ↓
Find Nearby Services
        ↓
User Selects Provider
        ↓
Booking
        ↓
Optional Relevant Location Sharing

Users should control whether location access is granted.

During an active booking, relevant trip or location information may optionally be shared with the booked provider when required for coordination or safety.

Privacy, security, and data protection are foundational product principles.

📱 Product Ecosystem

YatraOne is designed as a multi-sided platform.

1. Tourist App

Travelers can:

Search
Discover
Compare
Book
Pay
Message providers
Manage trips
Review services
Request support
2. Service Provider App

Providers can:

Register
Complete verification
Build profiles
Manage availability
Receive booking requests
Communicate with customers
Navigate to customers
Manage earnings
View reviews
3. Partner Portal

Designed for:

Hotels
Transport companies
Trekking companies
Tourism businesses
Other tourism partners

Partners can potentially:

Manage services
Manage bookings
Manage staff
Manage availability
View analytics
Track earnings
4. Admin Platform

The YatraOne operations platform can support:

Provider verification
User management
Booking management
Payments
Refunds
Disputes
Customer support
Fraud monitoring
Analytics
Platform operations
🔄 How YatraOne Works
        DISCOVER
            ↓
     Compare Providers
            ↓
          BOOK
            ↓
      PAY & CONFIRM
            ↓
        CONNECT
            ↓
       EXPERIENCE
            ↓
         REVIEW
01 — Discover

Find relevant guides, trekking professionals, transportation, or experiences.

02 — Compare

Compare based on language, price, experience, rating, distance, and availability.

03 — Book

Select the service and preferred schedule.

04 — Connect

Communicate with the provider through the platform.

05 — Experience

Complete the journey.

06 — Review

Share feedback and help build the provider reputation system.

🤖 AI Travel Assistant — Future

AI is planned as a future intelligence layer rather than an existing core feature.

A traveler could eventually say:

"I have three days in Kathmandu. I like culture and photography. Tomorrow I want to visit Bhaktapur and need an English-speaking guide and private vehicle."

The future YatraOne AI assistant could generate:

✓ Suggested itinerary
✓ Guide recommendations
✓ Vehicle recommendations
✓ Estimated cost
✓ Schedule
✓ Route
✓ Booking options

The long-term goal is for YatraOne to evolve from a marketplace into an intelligent travel companion for Nepal.

🚀 Tourism Super-App Vision

YatraOne starts with local tourism services but is designed for a much larger ecosystem.

                 ┌───────────────┐
                 │    TOURIST    │
                 └───────┬───────┘
                         │
                         ▼
                  ┌─────────────┐
                  │   YatraOne  │
                  └──────┬──────┘
                         │
       ┌─────────┬───────┼───────┬─────────┐
       ▼         ▼       ▼       ▼         ▼
    Guides   Trekking  Transport Experiences Hotels
       │         │       │       │         │
       └─────────┴───────┼───────┴─────────┘
                         │
                         ▼
                  AI Travel Layer
                         │
                         ▼
                 Complete Journey

Long-term ecosystem components may include:

Guides
Sherpas
Porters
Trekking services
Transportation
Experiences
Hotels
Activities
Payments
Messaging
Reviews
Travel assistance
AI trip planning
💰 Proposed Business Model

These are proposed revenue streams, not current revenue.

1. Booking Commission

Commission on completed marketplace bookings.

2. Transport Commission

Commission from transport bookings.

3. Premium Tourist Membership

Optional premium features for travelers.

4. Provider Subscriptions

Optional subscription plans for providers.

5. Featured Provider Placement

Promotional placement subject to fairness and trust policies.

6. B2B Partnerships

Partnership opportunities with hotels, tourism companies, and other organizations.

7. Curated Tourism Packages

Commission or margin from curated experiences and packages.

8. Future Travel Services

Additional revenue streams as the platform expands.

📊 Market Opportunity

YatraOne is initially focused on Nepal's international tourism market.

The market strategy should be supported by verified data.

[Insert verified Nepal international tourist arrival data]

[Insert verified tourism spending data]

[Insert TAM / SAM / SOM research]

[Insert verified tourism-services market opportunity]

No market numbers should be invented.

🗺️ Launch Strategy

YatraOne plans to expand in phases.

Phase 1 — Kathmandu

Initial focus areas:

Thamel
Basantapur
Swayambhunath
Pashupatinath
Boudhanath
Patan
Bhaktapur

Focus:

Guides + multilingual matching + nearby discovery + initial transport

Phase 2 — Major Tourism Hubs

Expand into:

Pokhara
Chitwan
Lumbini
Trekking gateways
Phase 3 — Trekking Ecosystem

Expand into major trekking regions including:

Annapurna
Everest-related tourism ecosystem
Other major trekking regions
Phase 4 — Nationwide Tourism Network

Expand across Nepal.

Potential services:

Guides
Transport
Experiences
Trekking
Accommodation
Activities
Travel Support
Phase 5 — International Expansion

Explore other tourism-heavy markets where a similar trusted local-services marketplace model can be applied.

🧠 Product Principles

YatraOne follows several core principles.

Trust First

Customers should understand who they are booking.

Local First

Empower local tourism professionals.

Transparent

Pricing, availability, provider information, and platform policies should be clear.

Privacy by Design

Location and user information should be controlled by the traveler.

Human + Technology

Technology should make local human expertise easier to discover.

Global Experience

The product should feel accessible to international travelers.

Scalable Architecture

The platform should be designed to expand beyond the initial use case.

🏗️ Technology Stack

The exact stack may evolve during development.

Recommended architecture:

Frontend
Next.js
React
TypeScript
Tailwind CSS
UI
shadcn/ui
Lucide Icons
Backend
Next.js API / Node.js
REST or API-based architecture
Database
PostgreSQL
ORM
Prisma
Authentication
Secure authentication system
Email authentication
Google authentication
Future authentication providers
Maps

Potential integrations:

Mapbox
Google Maps
Infrastructure

Designed for future deployment on modern cloud infrastructure.

📁 Suggested Project Structure
yatraone/
│
├── app/
│   ├── page.tsx
│   ├── guides/
│   ├── trekking/
│   ├── transport/
│   ├── experiences/
│   ├── provider/
│   ├── dashboard/
│   └── admin/
│
├── components/
│   ├── ui/
│   ├── marketplace/
│   ├── guides/
│   ├── trekking/
│   ├── transport/
│   ├── booking/
│   ├── trust/
│   └── maps/
│
├── lib/
│   ├── auth/
│   ├── database/
│   ├── maps/
│   ├── search/
│   └── verification/
│
├── prisma/
│   └── schema.prisma
│
├── public/
│   ├── images/
│   └── icons/
│
├── tests/
│
├── .github/
│   └── copilot-instructions.md
│
└── README.md
🗃️ Core Data Model

The platform is designed around marketplace entities.

User
 │
 ├── Tourist
 │
 └── Provider
       │
       ├── Languages
       ├── Verification
       ├── Services
       ├── Vehicles
       └── Experiences

Tourist
   │
   └── Bookings
          │
          ├── Provider
          ├── Service
          ├── Payment
          └── Review

Core entities may include:

User
Provider
ProviderLanguage
Verification
Service
Booking
Review
Vehicle
Experience
Payment
Message
Availability
🔎 Marketplace Search

YatraOne should eventually support search and filtering by:

Category

Guide, Trekking, Transport, Experience, etc.

Location

City, destination, trekking region, or nearby location.

Distance

For location-based discovery.

Language

Search providers based on spoken language.

Price

Hourly, daily, or service price.

Rating

Provider reviews and ratings.

Experience

Years of relevant experience.

Availability

Available now, date-specific, or schedule-based.

Specialty

Cultural tourism, photography, trekking, food, history, etc.

🔐 Security & Privacy

Security should be considered from the beginning.

Important areas include:

Authentication
Authorization
Input validation
API security
Rate limiting
Secure sessions
Password hashing
Data protection
Payment security
Audit logs
Role-based access control
Admin permissions

Sensitive information must never be unnecessarily exposed.

🧪 Development Status

YatraOne is currently in the early product development / prototyping stage.

Current focus
Product concept
UX/UI design
Marketplace architecture
Guide discovery
Provider profiles
Verification architecture
Booking workflows
Transport marketplace
Future AI architecture
Planned development

Landing page

Tourist marketplace

Guide discovery

Provider profiles

Location-based search

Multilingual matching

Booking system

Messaging

Reviews & ratings

Provider dashboard

Transport marketplace

Trekking marketplace

Experiences marketplace

Admin dashboard

Payment integration

AI travel assistant

⚠️ Project Disclaimer

YatraOne is an evolving startup concept and product under development.

Some features described in this README represent:

Planned functionality
Product concepts
Future capabilities
Proposed business models

They should not be interpreted as currently available functionality unless implemented in the application.

Market data, user numbers, revenue figures, partnerships, and traction should only be added when supported by verified evidence.

🌱 Long-Term Vision

The long-term goal is larger than guide booking.

YatraOne aims to become the trusted digital layer connecting travelers with Nepal's tourism ecosystem.

From:

Finding a Guide

to:

Planning the Journey
        ↓
Finding People
        ↓
Booking Services
        ↓
Arranging Transport
        ↓
Discovering Experiences
        ↓
Managing the Trip
        ↓
Getting Travel Assistance

Ultimately:

One platform for the entire Nepal travel journey.

🤝 Contributing

YatraOne is currently under active development.

Contributions, product feedback, technical suggestions, and ideas around tourism technology are welcome.

For significant changes:

Fork the repository.
Create a feature branch.
Make your changes.
Add or update tests where appropriate.
Run linting and type checks.
Commit your changes.
Open a pull request.

Example:

git checkout -b feature/nearby-guide-discovery
💻 Getting Started

Clone the repository:

git clone https://github.com/YOUR_USERNAME/YatraOne.git

Navigate into the project:

cd YatraOne

Install dependencies:

npm install

Create your environment file:

cp .env.example .env

Configure the required environment variables.

Run the development server:

npm run dev

Open:

http://localhost:3000
🔑 Environment Variables

Example:

DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

MAPBOX_TOKEN=

PAYMENT_PROVIDER_KEY=

Never commit secrets or API keys to GitHub.

Use:

.env.local

and add secret files to .gitignore.

🧑‍💻 Development Principles

When contributing to YatraOne:

Build reusable components.
Keep business logic separate from UI.
Validate user input.
Avoid unnecessary client-side rendering.
Keep pages responsive.
Optimize images.
Write meaningful commit messages.
Test important user flows.
Never fabricate marketplace data.
Clearly distinguish demo data from real provider data.
Never expose private user information.
Never claim a provider is verified without actual verification.
📌 Roadmap
                 YATRAONE ROADMAP

          ┌───────────────────────────┐
          │       MVP FOUNDATION      │
          └─────────────┬─────────────┘
                        ↓
                Guide Marketplace
                        ↓
              Nearby Discovery
                        ↓
             Multilingual Matching
                        ↓
                   Booking
                        ↓
             Transport Marketplace
                        ↓
              Trekking Marketplace
                        ↓
              Experiences Marketplace
                        ↓
                 Provider Network
                        ↓
                Tourism Ecosystem
                        ↓
              AI Travel Assistant
                        ↓
                Nepal Super-App
                        ↓
              International Expansion
🌐 Vision
From local roots to a global footprint.

YatraOne believes Nepal's tourism industry can become easier to discover, easier to trust, and more digitally connected.

We are building technology that helps travelers connect with the people who make Nepal special.