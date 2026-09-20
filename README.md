# TravelLord AI — NH-766 Wayanad Corridor Safety Assistant

TravelLord AI is an intelligent life-safety travel assistant engineered specifically for the treacherous **NH-766 Kozhikode–Wayanad mountain corridor (Kerala, India)**.

The system computes single, unambiguous safety directives (**Continue**, **Slow Down**, **Wait**, **Turn Back / Divert**, **ELEVATED_CAUTION**, or **INSUFFICIENT_DATA**) based strictly on **deterministic mathematical formulas** — never probabilistic guesswork. A Groq-powered Large Language Model (`llama-3.3-70b-versatile` / `qwen/qwen3.8-27b`) is strictly confined to generating plain-language, calm traveler explanations from backend-computed numbers.

---

## Key Features

- **Pure Deterministic Safety Engine**: Calculates segment risk scores and action directives using weighted source agreement, temporal decay, and historical reliability. Zero hallucination risk.
- **Standalone Live Corridor Map**: Interactive Leaflet.js map with OpenStreetMap tiles displaying all 6 NH-766 corridor segments color-coded by live risk score.
- **Trip Safety Planner**: Multi-checkpoint corridor path slicing, travel mode selection (Car, Bike, Bus, On Foot), and departure planning.
- **Live Crowd Verification**: Real-time crowd calibration allowing stranded or traversing drivers to report road clearance or ongoing blockages.
- **Offline Resilience & Decay**: Local caching with persistent offline warning banner and automatic 10% confidence decay per 30 minutes offline, safely falling back to Kerala SDMA helpline if data is stale.
- **Awareness & Educational Hub (`/learn/*`)**:
  - Mountain hazard guide (monsoon landslides, hairpin curves, ghat fog, Muthanga night ban 9 PM – 6 AM).
  - Safety tips & vehicle control (low-gear descending on Thamarassery ghats).
  - Emergency directory with one-tap dialing for Kerala SDMA, Wayanad Collectorate, Police, Fire & Rescue, and Forest Dept.
  - Transparent architecture and data source provenance.
- **Groq Chat Assistant ("Plan Assist")**: Conversational assistant strictly grounded in the NH-766 corridor domain with suggested inquiry chips and multi-turn context.
- **Trip History**: Journey log showing past assessed trips with one-click re-assessment.

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Lucide Icons
- **Database & Auth**: Supabase (PostgreSQL with Row Level Security)
- **AI / LLM**: Groq SDK (`llama-3.3-70b-versatile` / `qwen/qwen3.8-27b`)
- **Mapping**: Leaflet.js with OpenStreetMap (zero proprietary API keys required)

---

## Getting Started

### 1. Prerequisites
- Node.js 18+ installed
- A free Supabase project
- A free Groq Cloud API key

### 2. Environment Setup
Copy `.env.local.example` to `.env.local` and configure your credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GROQ_API_KEY=your_groq_api_key
```

### 3. Database Initialization
Run `supabase/schema.sql` in your Supabase SQL Editor. This sets up:
- `hazard_segments` with seed data for all 6 NH-766 corridor checkpoints
- `crowd_verifications` table with Row Level Security
- `trips` table with isolated user policies

### 4. Install Dependencies & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Corridor Segments (NH-766)

| Segment ID | Name | Hazard Type | Base Risk |
|:---:|:---|:---:|:---:|
| **S1** | Adivaram to Chooralmala | Landslide | High |
| **S5** | Lakkidi Viewpoint Curve | Sharp Hairpins & Mist | Moderate |
| **S3** | Vythiri Ghat Section | Rockfall & Heavy Fog | High |
| **S2** | Meppadi Junction | Flash Flood & Waterlogging | Moderate |
| **S6** | Kalpetta Bypass | Urban Congestion & Slippery Tarmac | Low |
| **S4** | Muthanga Wildlife Corridor | Elephant Crossing & Night Ban (9PM–6AM) | Strict Regulated |

---

## License

MIT
