/**
 * TravelLord AI - Normalized Data Source Adapter Architecture
 * Normalizes external/telemetry data into common internal structures
 * without tightly coupling the deterministic decision engine to raw APIs.
 *
 * HONEST PROVENANCE TAXONOMY:
 * - LIVE: Genuinely current external/operational feed (e.g. active verified user report, live connected API)
 * - FORECAST: Certified future projection model
 * - MODELLED: Algorithm/susceptibility layer derived from geospatial baselines (e.g. GSI slope models)
 * - HISTORICAL: Baseline facility registries and historical incident archives
 * - COMMUNITY_REPORTED: On-ground user reports with peer verification
 * - SIMULATED: Demo fixtures, test scenarios, and sandbox mocks
 */

import { HazardSegment } from '@/lib/engine/types';
import { calculateSegmentRecency } from '@/lib/engine/hazardStateAdapter';

export type DataOrigin = 
  | 'LIVE' 
  | 'FORECAST' 
  | 'MODELLED' 
  | 'HISTORICAL' 
  | 'COMMUNITY_REPORTED' 
  | 'SIMULATED'
  | 'SIMULATED_REPLAY';

export type ProvenanceType = DataOrigin | 'AUTHORITATIVE' | 'CROWD' | 'MODELED';

export { SyntheticReplayAdapter } from './syntheticReplayAdapter';
export type { NormalizedCorridorTelemetry } from './syntheticReplayAdapter';

export type HazardCategory = 'GEOTECHNICAL' | 'WILDLIFE' | 'SOCIAL_ROAD' | 'METEOROLOGICAL';

export interface NormalizedHazardEvent {
  id: string;
  type: string;
  category: HazardCategory;
  title: string;
  locationName: string;
  segmentId: string;
  lat: number;
  lng: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  severityScore: number;
  timestamp: string;
  source: string;
  sourceType: ProvenanceType;
  origin: DataOrigin;
  confidence: number;
  freshness: string;
  ageMinutes: number;
  trend: 'RISING' | 'STABLE' | 'FALLING';
  verificationStatus: 'OFFICIAL' | 'VERIFIED' | 'COMMUNITY_PENDING' | 'MODELED' | 'SIMULATED';
  affectedRoads: string[];
  description: string;
  recommendedResponse: string;
}

export interface NormalizedSafeZone {
  id: string;
  name: string;
  type: 'SHELTER' | 'HOSPITAL' | 'POLICE_STATION' | 'SAFE_ZONE' | 'REST_AREA';
  lat: number;
  lng: number;
  distanceKm: number;
  estimatedReachMinutes: number;
  capacityStatus: 'AVAILABLE' | 'LIMITED' | 'FULL';
  roadAccessibility: 'OPEN' | 'RESTRICTED' | 'BLOCKED' | 'UNKNOWN';
  facilities: string[];
  contactNumber?: string;
  lastUpdated: string;
  origin: DataOrigin;
}

export interface NormalizedRoadStatus {
  segmentId: string;
  roadName: string;
  state: 'OPEN' | 'RESTRICTED' | 'PARTIALLY_ACCESSIBLE' | 'BLOCKED' | 'UNKNOWN';
  surfaceCondition: 'DRY' | 'WET' | 'DEGRADED' | 'MUDDY' | 'BLOCKED' | 'UNKNOWN';
  source: string;
  sourceType: ProvenanceType;
  origin: DataOrigin;
  confidence: number;
  lastUpdated: string;
  freshness: string;
}

/**
 * Calculates human-readable freshness from actual timestamp without hardcoding
 */
export function formatTimestampFreshness(timestampIso: string): { freshness: string; ageMinutes: number } {
  try {
    const timestamp = new Date(timestampIso).getTime();
    const now = Date.now();
    const ageMinutes = Math.max(0, Math.floor((now - timestamp) / (1000 * 60)));
    
    if (isNaN(ageMinutes)) {
      return { freshness: 'Timestamp unavailable', ageMinutes: 999 };
    }
    if (ageMinutes < 1) {
      return { freshness: 'Under 1 min ago', ageMinutes: 0 };
    }
    if (ageMinutes < 60) {
      return { freshness: `${ageMinutes} min ago`, ageMinutes };
    }
    const ageHours = Math.floor(ageMinutes / 60);
    if (ageHours < 24) {
      return { freshness: `${ageHours}h ago`, ageMinutes };
    }
    const ageDays = Math.floor(ageHours / 24);
    return { freshness: `${ageDays}d ago`, ageMinutes };
  } catch {
    return { freshness: 'Unknown', ageMinutes: 999 };
  }
}

// 1. Weather Adapter — Transforms real HazardSegment or uses honestly-labeled SIMULATED fixture
export class WeatherAdapter {
  static normalize(raw?: HazardSegment | HazardSegment[] | any): NormalizedHazardEvent[] {
    if (raw && !Array.isArray(raw) && raw.segment_id) {
      const seg = raw as HazardSegment;
      const { freshness, ageMinutes } = formatTimestampFreshness(seg.last_updated);
      const recencyFactor = calculateSegmentRecency(seg.last_updated);
      const isDbRecord = Boolean(seg.last_updated);

      return [{
        id: `WEATHER_${seg.segment_id}`,
        type: 'HEAVY_RAIN',
        category: 'METEOROLOGICAL',
        title: `${seg.name} Monsoon Precipitation Band`,
        locationName: seg.name,
        segmentId: seg.segment_id,
        lat: seg.lat,
        lng: seg.lng,
        severity: seg.severity >= 0.7 ? 'HIGH' : seg.severity >= 0.4 ? 'MEDIUM' : 'LOW',
        severityScore: seg.severity,
        timestamp: seg.last_updated,
        source: seg.source || 'IMD Doppler Radar',
        sourceType: 'AUTHORITATIVE',
        origin: isDbRecord ? 'MODELLED' : 'SIMULATED',
        confidence: Number((seg.base_confidence * (0.7 + 0.3 * recencyFactor)).toFixed(2)),
        freshness,
        ageMinutes,
        trend: (seg.trend?.toUpperCase() as any) || 'STABLE',
        verificationStatus: 'OFFICIAL',
        affectedRoads: [seg.name],
        description: `Monsoon precipitation band observed at ${seg.name}.`,
        recommendedResponse: 'Reduce speed; engage low gear and defoggers.'
      }];
    }

    // Simulated Demonstration Fixture
    return [
      {
        id: 'WEATHER_SIM_W01',
        type: 'HEAVY_RAIN',
        category: 'METEOROLOGICAL',
        title: 'Intense Monsoon Precipitation Band (Demonstration)',
        locationName: 'Lakkidi Ghat Summit (NH-766)',
        segmentId: 'S5',
        lat: 11.5000,
        lng: 75.9980,
        severity: 'HIGH',
        severityScore: 0.72,
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        source: 'Simulated IMD Radar Fixture',
        sourceType: 'SIMULATED',
        origin: 'SIMULATED',
        confidence: 0.85,
        freshness: '30 min ago',
        ageMinutes: 30,
        trend: 'RISING',
        verificationStatus: 'SIMULATED',
        affectedRoads: ['NH-766 Hairpin Curves 6-9'],
        description: 'Simulated radar precipitation band along ghat escarpment for offline testing.',
        recommendedResponse: 'Reduce speed below 20 km/h; engage low gear.'
      }
    ];
  }
}

// 2. Disaster / Geotechnical Alert Adapter — Transforms real HazardSegment or uses honestly-labeled SIMULATED fixture
export class DisasterAlertAdapter {
  static normalize(raw?: HazardSegment | HazardSegment[] | any): NormalizedHazardEvent[] {
    if (raw && !Array.isArray(raw) && raw.segment_id) {
      const seg = raw as HazardSegment;
      const { freshness, ageMinutes } = formatTimestampFreshness(seg.last_updated);
      const recencyFactor = calculateSegmentRecency(seg.last_updated);

      return [{
        id: `GEO_${seg.segment_id}`,
        type: 'LANDSLIDE',
        category: 'GEOTECHNICAL',
        title: `${seg.name} Slope Saturation Alert`,
        locationName: seg.name,
        segmentId: seg.segment_id,
        lat: seg.lat,
        lng: seg.lng,
        severity: seg.severity >= 0.7 ? 'HIGH' : seg.severity >= 0.4 ? 'MEDIUM' : 'LOW',
        severityScore: seg.severity,
        timestamp: seg.last_updated,
        source: seg.source || 'GSI Slope Susceptibility Model',
        sourceType: 'MODELED',
        origin: 'MODELLED',
        confidence: Number((seg.base_confidence * (0.7 + 0.3 * recencyFactor)).toFixed(2)),
        freshness,
        ageMinutes,
        trend: (seg.trend?.toUpperCase() as any) || 'STABLE',
        verificationStatus: 'MODELED',
        affectedRoads: [seg.name],
        description: `Geotechnical slope saturation model active for ${seg.name}.`,
        recommendedResponse: 'Hold transit if rainfall intensifies; check safe zones.'
      }];
    }

    // Simulated Demonstration Fixture
    return [
      {
        id: 'GEO_SIM_L01',
        type: 'LANDSLIDE',
        category: 'GEOTECHNICAL',
        title: 'Slope Saturation & Rock Slip Watch (Demonstration)',
        locationName: 'Vythiri Ghat Incline (NH-766)',
        segmentId: 'S3',
        lat: 11.5760,
        lng: 76.0980,
        severity: 'HIGH',
        severityScore: 0.78,
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        source: 'Simulated GSI Model Fixture',
        sourceType: 'SIMULATED',
        origin: 'SIMULATED',
        confidence: 0.82,
        freshness: '45 min ago',
        ageMinutes: 45,
        trend: 'RISING',
        verificationStatus: 'SIMULATED',
        affectedRoads: ['NH-766 Vythiri-Lakkidi Corridor'],
        description: 'Simulated slope saturation model used for demo conflict evaluation.',
        recommendedResponse: 'Hold transit at nearest foothill safe zone.'
      }
    ];
  }
}

// 3. Wildlife Telemetry Adapter — Transforms real HazardSegment or uses honestly-labeled SIMULATED fixture
export class WildlifeAdapter {
  static normalize(raw?: HazardSegment | HazardSegment[] | any): NormalizedHazardEvent[] {
    if (raw && !Array.isArray(raw) && raw.segment_id) {
      const seg = raw as HazardSegment;
      const { freshness, ageMinutes } = formatTimestampFreshness(seg.last_updated);

      return [{
        id: `WILD_${seg.segment_id}`,
        type: 'WILDLIFE_CROSSING',
        category: 'WILDLIFE',
        title: `${seg.name} Wildlife Movement Alert`,
        locationName: seg.name,
        segmentId: seg.segment_id,
        lat: seg.lat,
        lng: seg.lng,
        severity: seg.severity >= 0.7 ? 'HIGH' : seg.severity >= 0.4 ? 'MEDIUM' : 'LOW',
        severityScore: seg.severity,
        timestamp: seg.last_updated,
        source: seg.source || 'Forest Department Checkpost Log',
        sourceType: 'AUTHORITATIVE',
        origin: 'MODELLED',
        confidence: seg.base_confidence,
        freshness,
        ageMinutes,
        trend: (seg.trend?.toUpperCase() as any) || 'STABLE',
        verificationStatus: 'OFFICIAL',
        affectedRoads: [seg.name],
        description: `Wildlife activity telemetry recorded along ${seg.name}.`,
        recommendedResponse: 'Do not honk; stay inside vehicle.'
      }];
    }

    // Simulated Demonstration Fixture
    return [
      {
        id: 'WILD_SIM_E01',
        type: 'WILDLIFE_CROSSING',
        category: 'WILDLIFE',
        title: 'Elephant Herd Crossing (Demonstration)',
        locationName: 'Padinjarethara Reserve Forest Link (Alt Route A)',
        segmentId: 'S4',
        lat: 11.6280,
        lng: 76.4310,
        severity: 'HIGH',
        severityScore: 0.75,
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        source: 'Simulated Forest RRT Fixture',
        sourceType: 'SIMULATED',
        origin: 'SIMULATED',
        confidence: 0.88,
        freshness: '1h ago',
        ageMinutes: 60,
        trend: 'STABLE',
        verificationStatus: 'SIMULATED',
        affectedRoads: ['Padinjarethara Forest Detour A'],
        description: 'Simulated elephant herd crossing used for detour conflict demo.',
        recommendedResponse: 'Avoid Alternate Route A; stay inside vehicle.'
      }
    ];
  }
}

// 4. Road Status / Incident Adapter
export class RoadStatusAdapter {
  static normalize(rawSegments?: HazardSegment[]): NormalizedRoadStatus[] {
    if (Array.isArray(rawSegments) && rawSegments.length > 0) {
      return rawSegments.map(s => {
        const { freshness } = formatTimestampFreshness(s.last_updated);
        const state = s.severity >= 0.8 ? 'BLOCKED' : s.severity >= 0.45 ? 'RESTRICTED' : 'OPEN';
        return {
          segmentId: s.segment_id,
          roadName: s.name,
          state,
          surfaceCondition: s.severity >= 0.7 ? 'MUDDY' : s.severity >= 0.4 ? 'WET' : 'DRY',
          source: s.source,
          sourceType: 'AUTHORITATIVE',
          origin: 'MODELLED',
          confidence: s.base_confidence,
          lastUpdated: s.last_updated,
          freshness
        };
      });
    }

    // Default honestly marked historical/simulated baseline
    return [
      {
        segmentId: 'S1',
        roadName: 'Adivaram Plain Base Link',
        state: 'OPEN',
        surfaceCondition: 'WET',
        source: 'Kerala Police Traffic Cell (Seeded Baseline)',
        sourceType: 'AUTHORITATIVE',
        origin: 'HISTORICAL',
        confidence: 0.90,
        lastUpdated: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
        freshness: '2h ago',
      },
      {
        segmentId: 'S3',
        roadName: 'Vythiri Ghat Incline Section',
        state: 'RESTRICTED',
        surfaceCondition: 'MUDDY',
        source: 'PWD Highway Engineers (Seeded Baseline)',
        sourceType: 'MODELED',
        origin: 'MODELLED',
        confidence: 0.85,
        lastUpdated: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
        freshness: '2h ago',
      }
    ];
  }
}

// 5. Safe Zone Adapter (Official Staging Directory)
export class SafeZoneAdapter {
  static getAllSafeZones(): NormalizedSafeZone[] {
    return [
      {
        id: 'SAFE_ADIVARAM_BASE',
        name: 'Adivaram Foothill Emergency Rescue & Rest Center',
        type: 'SAFE_ZONE',
        lat: 11.4720,
        lng: 75.9890,
        distanceKm: 3.5,
        estimatedReachMinutes: 8,
        capacityStatus: 'AVAILABLE',
        roadAccessibility: 'OPEN',
        facilities: ['Covered Parking', '24/7 First Aid Post', 'Clean Water', 'High-Bandwidth Cellular', 'Food Stalls'],
        contactNumber: '0495-2233445',
        lastUpdated: 'Verified Registry',
        origin: 'HISTORICAL'
      },
      {
        id: 'SAFE_LAKKIDI_SHELTER',
        name: 'Lakkidi Ghat Emergency Transit Station (Hairpin 9)',
        type: 'SHELTER',
        lat: 11.5120,
        lng: 76.0240,
        distanceKm: 5.2,
        estimatedReachMinutes: 12,
        capacityStatus: 'AVAILABLE',
        roadAccessibility: 'RESTRICTED',
        facilities: ['Reinforced Concrete Bunker', 'Oxygen Cylinders', 'Emergency Sat-Phone', 'Paramedic Unit'],
        contactNumber: '04936-255100',
        lastUpdated: 'Verified Registry',
        origin: 'HISTORICAL'
      },
      {
        id: 'SAFE_VYTHIRI_CIVIL',
        name: 'Vythiri Community Disaster Relief Hub',
        type: 'HOSPITAL',
        lat: 11.5540,
        lng: 76.0420,
        distanceKm: 8.0,
        estimatedReachMinutes: 18,
        capacityStatus: 'AVAILABLE',
        roadAccessibility: 'RESTRICTED',
        facilities: ['24-Bed Triage Center', 'Ambulance Station', 'Generator Power', 'Helipad Access'],
        contactNumber: '04936-256222',
        lastUpdated: 'Verified Registry',
        origin: 'HISTORICAL'
      },
      {
        id: 'SAFE_KALPETTA_POLICE',
        name: 'Kalpetta District Emergency Command Post',
        type: 'POLICE_STATION',
        lat: 11.6090,
        lng: 76.0830,
        distanceKm: 14.5,
        estimatedReachMinutes: 28,
        capacityStatus: 'AVAILABLE',
        roadAccessibility: 'OPEN',
        facilities: ['District EOC Control Room', 'Police Control Room (112)', 'Heavy Recovery Crane', 'Emergency Fuel'],
        contactNumber: '112',
        lastUpdated: 'Verified Registry',
        origin: 'HISTORICAL'
      }
    ];
  }
}
