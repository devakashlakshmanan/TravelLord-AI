# TravelLord AI — UI Data Lineage & Authenticity Audit

> **Single Source of Truth Principle:**  
> The deterministic safety engine (`src/lib/engine/actionResolutionEngine.ts` and `hazardStateAdapter.ts`) is the **sole mathematical authority** for hazard states, severity, confidence, candidate action evaluations, selected protective actions, rejected routes, and recoverability. The AI/LLM layer acts exclusively as an explanation layer and **never** invents or alters data.

---

## 1. Data Origin Taxonomy

| Taxonomy Level | Formal Definition | Examples in TravelLord AI | Verification Basis |
| :--- | :--- | :--- | :--- |
| **LIVE** | Genuinely current external/operational telemetry feed. | Active peer-verified user reports in `crowd_verifications` table. | Current timestamp delta $< 30$ minutes. |
| **FORECAST** | Future projection from a certified meteorological/geophysical model. | 3-hour monsoon cloudburst forecast models. | Model validity window explicitly stated. |
| **MODELLED** | Algorithmic, geospatial, or susceptibility index derived from database records. | GSI slope saturation records stored in Supabase `hazard_segments`. | Static susceptibility matrix combined with recency decay. |
| **HISTORICAL** | Archived incident records, past hazard frequencies, or baseline facility registries. | Safe shelter capacity rosters, emergency directory contacts in `emergencyContacts.ts`. | Database record last verified date. |
| **COMMUNITY_REPORTED** | Traveler/local observations submitted on the ground with peer verification state. | User submissions written directly to Supabase `crowd_verifications`. | Multi-user confirmation score ($\pm 0.05$ nudge, bounded $\pm 0.20$). |
| **SIMULATED** | Demonstrative multi-hazard scenarios, what-if test fixtures, or training presets. | Munnar–Valparai Multi-Hazard Conflict scenario (`SCENARIO_3_SIGNATURE_CONFLICT` in `scenarios.ts`). | Explicitly labeled `SIMULATED DEMO`. |

---

## 2. Comprehensive UI Value Lineage Table

| UI Component / Value | Upstream Source | Origin Taxonomy | Exact Calculation / Algorithm | Freshness Handling | Truly Live? |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Resolved Protective Action** (`🛑 STOP AT SAFE ZONE`) | Unified Action Engine (`actionResolutionEngine.ts`) | **MODELLED / SIMULATED** (derived from telemetry) | Scored against immediate hazard exposure, decision window, road accessibility, secondary risk, and recoverability. Candidate action matrix elimination. | Computed on-demand from current corridor/scenario state. | **Yes** (dynamically computed math) |
| **Data Confidence Index** (`e.g., 91%`) | `evaluateSegment()` in `hazardStateAdapter.ts` | **MODELLED** | `(source_agreement * 0.4) + (data_recency * 0.3) + (historical_reliability * 0.3) + crowd_adjustments` | Temporal recency decay: $1.0$ ($\le 30\text{m}$), decaying to $0.0$ ($> 210\text{m}$). | **No** (Derived from DB timestamps & formulas) |
| **Decision Window** (`~18 min`) | `calculateDecisionWindow()` in `decisionWindow.ts` | **MODELLED** | Evaluates primary hazard type, saturation trend, and safe-zone reachability time. Defaults to conservative reassessment cadence. | Recomputed dynamically on telemetry changes. | **No** (Rule-derived estimation) |
| **Landslide Susceptibility** | Supabase `hazard_segments` table | **MODELLED** | Seeded GSI susceptibility score weighted by segment recency decay factor. | `last_updated` timestamp in database. | **No** (Modelled database records) |
| **Monsoon Rainfall Radar** | Supabase `hazard_segments` or `WeatherAdapter` | **MODELLED / SIMULATED** | Precipitation intensity mapped to affected ghat curves. | Formatted via `formatTimestampFreshness()`. | **No** (Modelled / Simulated fixture) |
| **Wildlife Corridor Activity** | Supabase `hazard_segments` or `WildlifeAdapter` | **MODELLED / SIMULATED** | Forest reserve link sighting telemetry. | Formatted via `formatTimestampFreshness()`. | **No** (Modelled / Simulated fixture) |
| **Road Accessibility State** (`OPEN`, `RESTRICTED`, `BLOCKED`) | Supabase `hazard_segments` | **MODELLED** | Carriageway physical passability state. **Never defaults to OPEN without verified source.** | Database record `last_updated`. | **No** (Modelled database records) |
| **Safe Zone Directory** (`Shelters, Hospitals`) | `SafeZoneAdapter.getAllSafeZones()` | **HISTORICAL** | Geocoded distance and travel time from current segment to nearest verified bunker/hospital. | Directory verification date. | **No** (Historical Infrastructure Registry) |
| **Community Observation Nudge** | Supabase `crowd_verifications` table | **COMMUNITY_REPORTED** | Upvote ($+0.05$) / Downvote ($-0.05$) bounded between $[-0.20, +0.20]$ over last 2 hours. | User submission timestamp in Supabase. | **Yes** (Connected to real Supabase table) |
| **What-If Scenario Outputs** | Scenario Sandbox (`scenarios.ts` + `actionResolutionEngine.ts`) | **SIMULATED** | User-selected presets evaluated in real-time through the production deterministic action resolution engine. | Computed client-side on state change. | **No** (`SIMULATED DEMO`) |

---

## 3. Anti-Fabrication Guarantees

1. **No Fake GPS Movement**: If GPS permission is not granted, traveler coordinates are never fabricated. The system falls back to route-level checkpoint reasoning.
2. **No Arbitrary Safety Percentages**: No unexplained overall percentages are rendered. Hazard Severity, Confidence, Decision Window, and Recoverability are strictly maintained as independent variables.
3. **No Fabricated Road Openings**: Lack of closure reports does not equate to `OPEN`; unverified roads are explicitly classified as `UNKNOWN` or `RESTRICTED`.
4. **No LLM Decision Invention**: Groq/Llama models receive structured JSON output from `actionResolutionEngine.ts` and generate human-readable explanations only.
