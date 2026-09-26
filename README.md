# TravelLord AI 🛡️
### Multi-Hazard Awareness and Protective Action Resolution System for Geo-Technical, Wildlife and Social Threats

> **"When multiple geo-technical, wildlife, and social hazards evolve simultaneously, what is the safest feasible action the traveler can take RIGHT NOW?"**

TravelLord AI is **not** an alert aggregator, safe-route recommender, or AI chatbot. It is a deterministic, safety-critical **Protective Action Resolution System** designed for high-risk mountain corridors in the Western Ghats (such as NH-766 Wayanad and Munnar–Valparai). It evaluates interacting terrain, meteorological, wildlife, and infrastructure hazards to resolve **ONE clear, executable, and recoverable action** for the traveler (*CONTINUE, SLOW DOWN, STOP, WAIT, TURN BACK, DIVERT, SEEK SHELTER, CONTACT HELP*), backed by explicit causal reasons and rejected unsafe alternatives.

---

## 🏛️ Core Architecture & Design Laws

```
                       MULTI-SOURCE HAZARD & TELEMETRY
          (GSI Slope InSAR, IMD Radar, Police Directives, Crowd Reports)
                                       ↓
                           NORMALIZED HAZARD STATE
             (Location, Type, Severity, Base Confidence, Trend, Recency)
                                       ↓
                         TRAVELER & ROAD SITUATION STATE
               (GPS/Route Checkpoint, Mode, Speed, Road Accessibility)
                                       ↓
                         ACTION CANDIDATE GENERATOR
          (CONTINUE, SLOW_DOWN, STOP, WAIT, TURN_BACK, DIVERT, SEEK_SHELTER)
                                       ↓
                        CONSEQUENCE ENGINE & TRANSITIONS
               (State-Transition Modeling: "What situation happens next?")
                                       ↓
                         ACTION RECOVERABILITY ENGINE
          (Evaluates Escape Channels, Maneuverability & Distance to Shelter)
                                       ↓
                          DECISION WINDOW ESTIMATION
                  (Time-to-Danger vs Traveler Reach Trajectory)
                                       ↓
                          MULTI-HAZARD CONFLICT GATES
             (Rejects Unsafe Detours Intersecting Secondary Hazards)
                                       ↓
                        ONE EXECUTABLE PROTECTIVE ACTION
               (Deterministic Source of Truth — Zero AI Override)
                                       ↓
                          GROQ NATURAL LANGUAGE BRIEFING
             (Strictly Explains Already-Decided Math — Never Re-ranks)
```

### ⚖️ The Two Non-Negotiable Safety Laws:
1. **Deterministic Rule Math is the Source of Truth**: The safety action is 100% computed by pure mathematical constraint gates in `src/lib/engine/actionResolution/`. Groq LLMs only phrase a natural language explanation of the already-computed decision.
2. **Strict Data Honesty**: Zero fabricated or deceptive placeholder numbers. If telemetry confidence decays below safe operational thresholds (40%), the system explicitly outputs `INSUFFICIENT_DATA` with official toll-free emergency helplines.

---

## 🗺️ Monitored Corridors

1. **NH-766 Kozhikode–Wayanad Mountain Pass** (Primary Live Corridor):
   - 6 Monitored Checkpoints: *Adivaram (S1), Lakkidi Curve (S5), Vythiri Ghat (S3), Meppadi (S2), Kalpetta Bypass (S6), Muthanga Wildlife Sector (S4)*.
2. **Munnar–Valparai High Range Pass** (Signature Multi-Hazard Corridor):
   - Intersecting slope failures (*Lockhart Gap*), active elephant migration corridors (*Anamudi Shola Reserve*), and structural bypass closures (*Mattupetty Bridge*).

---

## 🚀 Quick Start & Setup

### 1. Prerequisites
- **Node.js**: v18.17+ or v20+
- **Supabase Project**: Free-tier cloud Supabase instance or local Docker Supabase.
- **Groq Cloud API Key** (optional for AI briefing; system automatically uses deterministic templates if absent).

### 2. Environment Configuration
Copy `.env.local.example` to `.env.local`:
```bash
cp .env.local.example .env.local
```
Fill in your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
GROQ_API_KEY=gsk_your_groq_api_key
```

### 3. Database Migration & Seeding
Execute the complete schema in the Supabase SQL Editor:
- Open [`supabase/schema.sql`](supabase/schema.sql)
- Run the SQL script to create tables (`hazard_segments`, `crowd_verifications`, `trips`, `safe_locations`, `decision_history`), configure Row-Level Security (RLS), and seed the 6 corridor checkpoints.

### 4. Install Dependencies & Run
```bash
# Install dependencies
npm install

# Run automated tests
npm test

# Start development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Automated Testing

Run the deterministic assertion suite verifying multi-hazard conflict resolution, recoverability, decision window estimation, and confidence decay:
```bash
npm test
```
**Test Coverage Includes:**
- Low confidence degradation ($<40\%$) $\rightarrow$ `INSUFFICIENT_DATA` + `STOP`
- High confidence nominal transit $\rightarrow$ `CONTINUE`
- Rainfall escalation $\rightarrow$ `SLOW_DOWN`
- Signature Multi-Hazard Conflict (Landslide + Wildlife + Road Blockage) $\rightarrow$ `STOP AT SAFE ZONE`
- Dynamic State Transition & Recovery (Detour Clears) $\rightarrow$ `DIVERT VIA ALTERNATE A`
- Real trip route parity verification

---

## 📦 Project Structure

```
src/
├── app/
│   ├── (app)/
│   │   ├── dashboard/page.tsx      # Traveler trip planner & live corridor telemetry
│   │   ├── result/page.tsx         # Decision-first directive, Action Tree & Leaflet Map
│   │   ├── map/page.tsx            # Pre-trip corridor situational awareness map
│   │   ├── history/page.tsx        # Past trip records & decision timeline evolution
│   │   ├── chat/page.tsx           # Plan Assist AI educational guide
│   │   └── learn/*/                # Hazards, Safety Tips, Emergency Helplines & System Concepts
│   ├── api/
│   │   ├── resolve-action/         # Deterministic Action Resolution API
│   │   ├── generate-explanation/   # Groq natural language briefing API
│   │   └── chat-assist/            # Plan Assist chat guide API
├── components/
│   ├── SafetyCard.tsx              # Primary decision-first protective action card
│   ├── ActionResolutionTree.tsx    # Signature candidate-filtering visual decision tree
│   ├── CorridorMap.tsx             # Interactive Leaflet map with safe shelters & detour geometry
│   ├── ScenarioSimulator.tsx       # Scenario playback & dynamic hazard timeline re-evaluation
│   ├── EmergencyPanel.tsx          # 24/7 Toll-free directory (112, 1077) & GPS broadcaster
│   ├── CrowdVerification.tsx       # Real-time peer road verification with confidence nudge
│   ├── ProvenanceBadge.tsx         # Transparent Authoritative/Modeled/Crowd/Simulated tags
│   └── OfflineBanner.tsx           # Dead-zone detection & confidence decay indicator
└── lib/
    ├── engine/
    │   ├── actionResolution/       # Master Protective Action Resolution Engine
    │   │   ├── actionTypes.ts      # Normalized state & action interfaces
    │   │   ├── actionResolutionEngine.ts # Master deterministic orchestrator
    │   │   ├── actionCandidates.ts # Candidate generator
    │   │   ├── consequenceEngine.ts# State transition consequence analyzer
    │   │   ├── recoverability.ts   # Action reversibility & shelter accessibility
    │   │   ├── decisionWindow.ts   # Time-to-danger window estimation
    │   │   ├── conflictResolver.ts # Multi-hazard cross-route conflict gates
    │   │   ├── corridorGraph.ts    # NH-766 and Munnar–Valparai road graph topology
    │   │   └── scenarios.ts        # Evolving hazard demonstration catalog
    │   └── hazardStateAdapter.ts   # Supabase DB to normalized telemetry adapter
    └── supabase/                   # Supabase client & admin client configuration
```

---

## 🔒 Security & Data Provenance

- **Secrets Safety**: No API keys or service role secrets are exposed in client bundles.
- **RLS Enforced**: User trips and decision logs are strictly isolated via Supabase Row-Level Security (`auth.uid() = user_id`).
- **Data Provenance**: Every metric displays its explicit provenance category (`AUTHORITATIVE`, `MODELED`, `CROWD`, or `SIMULATED`). See [`docs/ui-data-audit.md`](docs/ui-data-audit.md) for the full provenance audit matrix.
