import { 
  ReplayObservationRaw, 
  CalculatedSegmentState, 
  ReplaySnapshot, 
  DecisionTimelineEvent, 
  ReplayProvenance 
} from './replayTypes';
import { 
  HazardState, 
  RoadState, 
  HazardType, 
  HazardTrend,
  ActionType
} from '../engine/actionResolution/actionTypes';
import { resolveProtectiveAction } from '../engine/actionResolution/actionResolutionEngine';

// ============================================================
// 1. RAW SYNTHETIC REPLAY DATASET (Munnar → Valparai Corridor)
// ============================================================
export const RAW_SYNTHETIC_REPLAY_DATASET: ReplayObservationRaw[] = [
  // --- 06:00 ---
  {
    timestamp: '2026-09-25 06:00',
    segment_id: 'S1',
    from_location: 'Munnar',
    to_location: 'Gap Road',
    latitude: 10.0889,
    longitude: 77.0595,
    slope_deg: 34,
    rainfall_1h_mm: 5.2,
    rainfall_24h_mm: 42,
    soil_saturation_pct: 66,
    water_level_pct: 31,
    wildlife_activity_0_1: 0.22,
    wildlife_sightings_6h: 2,
    traffic_density_pct: 18,
    road_state: 'OPEN',
    landslide_risk_0_100: 29,
    flood_risk_0_100: 27,
    wildlife_risk_0_100: 22,
    road_risk_0_100: 0,
    overall_risk_0_100: 22.5,
    confidence_0_100: 88,
    trend: 'STABLE',
    data_origin: 'SIMULATED_REPLAY',
    source_status: 'SYNTHETIC_NOT_LIVE',
  },
  {
    timestamp: '2026-09-25 06:00',
    segment_id: 'S2',
    from_location: 'Gap Road',
    to_location: 'Chinnar Approach',
    latitude: 10.2195,
    longitude: 77.1602,
    slope_deg: 22,
    rainfall_1h_mm: 4.1,
    rainfall_24h_mm: 36,
    soil_saturation_pct: 61,
    water_level_pct: 27,
    wildlife_activity_0_1: 0.17,
    wildlife_sightings_6h: 1,
    traffic_density_pct: 14,
    road_state: 'OPEN',
    landslide_risk_0_100: 22,
    flood_risk_0_100: 23,
    wildlife_risk_0_100: 17,
    road_risk_0_100: 0,
    overall_risk_0_100: 17.8,
    confidence_0_100: 87,
    trend: 'STABLE',
    data_origin: 'SIMULATED_REPLAY',
    source_status: 'SYNTHETIC_NOT_LIVE',
  },
  {
    timestamp: '2026-09-25 06:00',
    segment_id: 'S3',
    from_location: 'Chinnar Approach',
    to_location: 'Marayoor',
    latitude: 10.2750,
    longitude: 77.1370,
    slope_deg: 18,
    rainfall_1h_mm: 3.6,
    rainfall_24h_mm: 31,
    soil_saturation_pct: 58,
    water_level_pct: 24,
    wildlife_activity_0_1: 0.14,
    wildlife_sightings_6h: 1,
    traffic_density_pct: 12,
    road_state: 'OPEN',
    landslide_risk_0_100: 19,
    flood_risk_0_100: 20,
    wildlife_risk_0_100: 14,
    road_risk_0_100: 0,
    overall_risk_0_100: 15.0,
    confidence_0_100: 86,
    trend: 'STABLE',
    data_origin: 'SIMULATED_REPLAY',
    source_status: 'SYNTHETIC_NOT_LIVE',
  },
  {
    timestamp: '2026-09-25 06:00',
    segment_id: 'S4',
    from_location: 'Marayoor',
    to_location: 'Valparai East',
    latitude: 10.3240,
    longitude: 76.9550,
    slope_deg: 31,
    rainfall_1h_mm: 5.0,
    rainfall_24h_mm: 40,
    soil_saturation_pct: 64,
    water_level_pct: 29,
    wildlife_activity_0_1: 0.20,
    wildlife_sightings_6h: 2,
    traffic_density_pct: 16,
    road_state: 'OPEN',
    landslide_risk_0_100: 27,
    flood_risk_0_100: 25,
    wildlife_risk_0_100: 20,
    road_risk_0_100: 0,
    overall_risk_0_100: 21.5,
    confidence_0_100: 87,
    trend: 'STABLE',
    data_origin: 'SIMULATED_REPLAY',
    source_status: 'SYNTHETIC_NOT_LIVE',
  },
  {
    timestamp: '2026-09-25 06:00',
    segment_id: 'S5',
    from_location: 'Munnar',
    to_location: 'Anamudi Corridor',
    latitude: 10.1460,
    longitude: 77.0630,
    slope_deg: 42,
    rainfall_1h_mm: 6.1,
    rainfall_24h_mm: 48,
    soil_saturation_pct: 70,
    water_level_pct: 34,
    wildlife_activity_0_1: 0.28,
    wildlife_sightings_6h: 2,
    traffic_density_pct: 20,
    road_state: 'OPEN',
    landslide_risk_0_100: 38,
    flood_risk_0_100: 30,
    wildlife_risk_0_100: 28,
    road_risk_0_100: 0,
    overall_risk_0_100: 26.6,
    confidence_0_100: 89,
    trend: 'STABLE',
    data_origin: 'SIMULATED_REPLAY',
    source_status: 'SYNTHETIC_NOT_LIVE',
  },
  {
    timestamp: '2026-09-25 06:00',
    segment_id: 'S6',
    from_location: 'Anamudi Corridor',
    to_location: 'Valparai',
    latitude: 10.3265,
    longitude: 76.9515,
    slope_deg: 38,
    rainfall_1h_mm: 5.8,
    rainfall_24h_mm: 46,
    soil_saturation_pct: 68,
    water_level_pct: 33,
    wildlife_activity_0_1: 0.25,
    wildlife_sightings_6h: 2,
    traffic_density_pct: 19,
    road_state: 'OPEN',
    landslide_risk_0_100: 34,
    flood_risk_0_100: 29,
    wildlife_risk_0_100: 25,
    road_risk_0_100: 0,
    overall_risk_0_100: 24.1,
    confidence_0_100: 88,
    trend: 'STABLE',
    data_origin: 'SIMULATED_REPLAY',
    source_status: 'SYNTHETIC_NOT_LIVE',
  },

  // --- 09:00 ---
  {
    timestamp: '2026-09-25 09:00',
    segment_id: 'S1',
    from_location: 'Munnar',
    to_location: 'Gap Road',
    latitude: 10.0889,
    longitude: 77.0595,
    slope_deg: 34,
    rainfall_1h_mm: 8.7,
    rainfall_24h_mm: 51,
    soil_saturation_pct: 70,
    water_level_pct: 36,
    wildlife_activity_0_1: 0.18,
    wildlife_sightings_6h: 1,
    traffic_density_pct: 35,
    road_state: 'OPEN',
    landslide_risk_0_100: 35,
    flood_risk_0_100: 32,
    wildlife_risk_0_100: 18,
    road_risk_0_100: 0,
    overall_risk_0_100: 25.0,
    confidence_0_100: 90,
    trend: 'STABLE',
    data_origin: 'SIMULATED_REPLAY',
    source_status: 'SYNTHETIC_NOT_LIVE',
  },
  {
    timestamp: '2026-09-25 09:00',
    segment_id: 'S2',
    from_location: 'Gap Road',
    to_location: 'Chinnar Approach',
    latitude: 10.2195,
    longitude: 77.1602,
    slope_deg: 22,
    rainfall_1h_mm: 7.5,
    rainfall_24h_mm: 45,
    soil_saturation_pct: 65,
    water_level_pct: 32,
    wildlife_activity_0_1: 0.20,
    wildlife_sightings_6h: 2,
    traffic_density_pct: 29,
    road_state: 'OPEN',
    landslide_risk_0_100: 27,
    flood_risk_0_100: 29,
    wildlife_risk_0_100: 20,
    road_risk_0_100: 0,
    overall_risk_0_100: 20.6,
    confidence_0_100: 89,
    trend: 'STABLE',
    data_origin: 'SIMULATED_REPLAY',
    source_status: 'SYNTHETIC_NOT_LIVE',
  },
  {
    timestamp: '2026-09-25 09:00',
    segment_id: 'S3',
    from_location: 'Chinnar Approach',
    to_location: 'Marayoor',
    latitude: 10.2750,
    longitude: 77.1370,
    slope_deg: 18,
    rainfall_1h_mm: 6.8,
    rainfall_24h_mm: 39,
    soil_saturation_pct: 62,
    water_level_pct: 29,
    wildlife_activity_0_1: 0.19,
    wildlife_sightings_6h: 2,
    traffic_density_pct: 27,
    road_state: 'OPEN',
    landslide_risk_0_100: 24,
    flood_risk_0_100: 25,
    wildlife_risk_0_100: 19,
    road_risk_0_100: 0,
    overall_risk_0_100: 18.6,
    confidence_0_100: 88,
    trend: 'STABLE',
    data_origin: 'SIMULATED_REPLAY',
    source_status: 'SYNTHETIC_NOT_LIVE',
  },
  {
    timestamp: '2026-09-25 09:00',
    segment_id: 'S4',
    from_location: 'Marayoor',
    to_location: 'Valparai East',
    latitude: 10.3240,
    longitude: 76.9550,
    slope_deg: 31,
    rainfall_1h_mm: 8.2,
    rainfall_24h_mm: 49,
    soil_saturation_pct: 69,
    water_level_pct: 35,
    wildlife_activity_0_1: 0.24,
    wildlife_sightings_6h: 2,
    traffic_density_pct: 31,
    road_state: 'OPEN',
    landslide_risk_0_100: 33,
    flood_risk_0_100: 31,
    wildlife_risk_0_100: 24,
    road_risk_0_100: 0,
    overall_risk_0_100: 23.8,
    confidence_0_100: 89,
    trend: 'STABLE',
    data_origin: 'SIMULATED_REPLAY',
    source_status: 'SYNTHETIC_NOT_LIVE',
  },
  {
    timestamp: '2026-09-25 09:00',
    segment_id: 'S5',
    from_location: 'Munnar',
    to_location: 'Anamudi Corridor',
    latitude: 10.1460,
    longitude: 77.0630,
    slope_deg: 42,
    rainfall_1h_mm: 10.4,
    rainfall_24h_mm: 59,
    soil_saturation_pct: 75,
    water_level_pct: 41,
    wildlife_activity_0_1: 0.34,
    wildlife_sightings_6h: 3,
    traffic_density_pct: 38,
    road_state: 'OPEN',
    landslide_risk_0_100: 49,
    flood_risk_0_100: 36,
    wildlife_risk_0_100: 34,
    road_risk_0_100: 0,
    overall_risk_0_100: 31.9,
    confidence_0_100: 90,
    trend: 'RISING',
    data_origin: 'SIMULATED_REPLAY',
    source_status: 'SYNTHETIC_NOT_LIVE',
  },
  {
    timestamp: '2026-09-25 09:00',
    segment_id: 'S6',
    from_location: 'Anamudi Corridor',
    to_location: 'Valparai',
    latitude: 10.3265,
    longitude: 76.9515,
    slope_deg: 38,
    rainfall_1h_mm: 9.8,
    rainfall_24h_mm: 57,
    soil_saturation_pct: 74,
    water_level_pct: 40,
    wildlife_activity_0_1: 0.32,
    wildlife_sightings_6h: 3,
    traffic_density_pct: 36,
    road_state: 'OPEN',
    landslide_risk_0_100: 46,
    flood_risk_0_100: 35,
    wildlife_risk_0_100: 32,
    road_risk_0_100: 0,
    overall_risk_0_100: 30.2,
    confidence_0_100: 90,
    trend: 'RISING',
    data_origin: 'SIMULATED_REPLAY',
    source_status: 'SYNTHETIC_NOT_LIVE',
  },

  // --- 12:00 ---
  {
    timestamp: '2026-09-25 12:00',
    segment_id: 'S1',
    from_location: 'Munnar',
    to_location: 'Gap Road',
    latitude: 10.0889,
    longitude: 77.0595,
    slope_deg: 34,
    rainfall_1h_mm: 14.6,
    rainfall_24h_mm: 67,
    soil_saturation_pct: 76,
    water_level_pct: 47,
    wildlife_activity_0_1: 0.31,
    wildlife_sightings_6h: 3,
    traffic_density_pct: 52,
    road_state: 'PARTIALLY_ACCESSIBLE',
    landslide_risk_0_100: 48,
    flood_risk_0_100: 43,
    wildlife_risk_0_100: 31,
    road_risk_0_100: 45,
    overall_risk_0_100: 43.0,
    confidence_0_100: 89,
    trend: 'RISING',
    data_origin: 'SIMULATED_REPLAY',
    source_status: 'SYNTHETIC_NOT_LIVE',
  },
  {
    timestamp: '2026-09-25 12:00',
    segment_id: 'S2',
    from_location: 'Gap Road',
    to_location: 'Chinnar Approach',
    latitude: 10.2195,
    longitude: 77.1602,
    slope_deg: 22,
    rainfall_1h_mm: 13.2,
    rainfall_24h_mm: 61,
    soil_saturation_pct: 72,
    water_level_pct: 43,
    wildlife_activity_0_1: 0.29,
    wildlife_sightings_6h: 3,
    traffic_density_pct: 46,
    road_state: 'PARTIALLY_ACCESSIBLE',
    landslide_risk_0_100: 39,
    flood_risk_0_100: 39,
    wildlife_risk_0_100: 29,
    road_risk_0_100: 45,
    overall_risk_0_100: 37.2,
    confidence_0_100: 90,
    trend: 'RISING',
    data_origin: 'SIMULATED_REPLAY',
    source_status: 'SYNTHETIC_NOT_LIVE',
  },
  {
    timestamp: '2026-09-25 12:00',
    segment_id: 'S3',
    from_location: 'Chinnar Approach',
    to_location: 'Marayoor',
    latitude: 10.2750,
    longitude: 77.1370,
    slope_deg: 18,
    rainfall_1h_mm: 11.9,
    rainfall_24h_mm: 55,
    soil_saturation_pct: 68,
    water_level_pct: 39,
    wildlife_activity_0_1: 0.26,
    wildlife_sightings_6h: 3,
    traffic_density_pct: 43,
    road_state: 'PARTIALLY_ACCESSIBLE',
    landslide_risk_0_100: 34,
    flood_risk_0_100: 35,
    wildlife_risk_0_100: 26,
    road_risk_0_100: 45,
    overall_risk_0_100: 33.3,
    confidence_0_100: 89,
    trend: 'RISING',
    data_origin: 'SIMULATED_REPLAY',
    source_status: 'SYNTHETIC_NOT_LIVE',
  },
  {
    timestamp: '2026-09-25 12:00',
    segment_id: 'S4',
    from_location: 'Marayoor',
    to_location: 'Valparai East',
    latitude: 10.3240,
    longitude: 76.9550,
    slope_deg: 31,
    rainfall_1h_mm: 15.1,
    rainfall_24h_mm: 70,
    soil_saturation_pct: 78,
    water_level_pct: 48,
    wildlife_activity_0_1: 0.35,
    wildlife_sightings_6h: 4,
    traffic_density_pct: 49,
    road_state: 'PARTIALLY_ACCESSIBLE',
    landslide_risk_0_100: 51,
    flood_risk_0_100: 44,
    wildlife_risk_0_100: 35,
    road_risk_0_100: 45,
    overall_risk_0_100: 44.7,
    confidence_0_100: 90,
    trend: 'RISING',
    data_origin: 'SIMULATED_REPLAY',
    source_status: 'SYNTHETIC_NOT_LIVE',
  },
  {
    timestamp: '2026-09-25 12:00',
    segment_id: 'S5',
    from_location: 'Munnar',
    to_location: 'Anamudi Corridor',
    latitude: 10.1460,
    longitude: 77.0630,
    slope_deg: 42,
    rainfall_1h_mm: 18.2,
    rainfall_24h_mm: 79,
    soil_saturation_pct: 84,
    water_level_pct: 56,
    wildlife_activity_0_1: 0.42,
    wildlife_sightings_6h: 4,
    traffic_density_pct: 54,
    road_state: 'RESTRICTED',
    landslide_risk_0_100: 65,
    flood_risk_0_100: 52,
    wildlife_risk_0_100: 42,
    road_risk_0_100: 70,
    overall_risk_0_100: 62.1,
    confidence_0_100: 91,
    trend: 'RISING',
    data_origin: 'SIMULATED_REPLAY',
    source_status: 'SYNTHETIC_NOT_LIVE',
  },
  {
    timestamp: '2026-09-25 12:00',
    segment_id: 'S6',
    from_location: 'Anamudi Corridor',
    to_location: 'Valparai',
    // Corrected coordinate typo (77.9515 -> 76.9515)
    latitude: 10.3265,
    longitude: 76.9515,
    slope_deg: 38,
    rainfall_1h_mm: 17.6,
    rainfall_24h_mm: 76,
    soil_saturation_pct: 82,
    water_level_pct: 55,
    wildlife_activity_0_1: 0.44,
    wildlife_sightings_6h: 5,
    traffic_density_pct: 51,
    road_state: 'PARTIALLY_ACCESSIBLE',
    landslide_risk_0_100: 61,
    flood_risk_0_100: 50,
    wildlife_risk_0_100: 44,
    road_risk_0_100: 45,
    overall_risk_0_100: 55.4,
    confidence_0_100: 91,
    trend: 'RISING',
    data_origin: 'SIMULATED_REPLAY',
    source_status: 'SYNTHETIC_NOT_LIVE',
  },

  // --- 15:00 ---
  {
    timestamp: '2026-09-25 15:00',
    segment_id: 'S1',
    from_location: 'Munnar',
    to_location: 'Gap Road',
    latitude: 10.0889,
    longitude: 77.0595,
    slope_deg: 34,
    rainfall_1h_mm: 22.8,
    rainfall_24h_mm: 91,
    soil_saturation_pct: 86,
    water_level_pct: 63,
    wildlife_activity_0_1: 0.38,
    wildlife_sightings_6h: 4,
    traffic_density_pct: 61,
    road_state: 'RESTRICTED',
    landslide_risk_0_100: 66,
    flood_risk_0_100: 58,
    wildlife_risk_0_100: 38,
    road_risk_0_100: 70,
    overall_risk_0_100: 63.2,
    confidence_0_100: 91,
    trend: 'RISING',
    data_origin: 'SIMULATED_REPLAY',
    source_status: 'SYNTHETIC_NOT_LIVE',
  },
  {
    timestamp: '2026-09-25 15:00',
    segment_id: 'S2',
    from_location: 'Gap Road',
    to_location: 'Chinnar Approach',
    latitude: 10.2195,
    longitude: 77.1602,
    slope_deg: 22,
    rainfall_1h_mm: 19.4,
    rainfall_24h_mm: 82,
    soil_saturation_pct: 81,
    water_level_pct: 57,
    wildlife_activity_0_1: 0.34,
    wildlife_sightings_6h: 4,
    traffic_density_pct: 58,
    road_state: 'RESTRICTED',
    landslide_risk_0_100: 52,
    flood_risk_0_100: 51,
    wildlife_risk_0_100: 34,
    road_risk_0_100: 70,
    overall_risk_0_100: 54.3,
    confidence_0_100: 90,
    trend: 'RISING',
    data_origin: 'SIMULATED_REPLAY',
    source_status: 'SYNTHETIC_NOT_LIVE',
  },
  {
    timestamp: '2026-09-25 15:00',
    segment_id: 'S3',
    from_location: 'Chinnar Approach',
    to_location: 'Marayoor',
    latitude: 10.2750,
    longitude: 77.1370,
    slope_deg: 18,
    rainfall_1h_mm: 17.2,
    rainfall_24h_mm: 73,
    soil_saturation_pct: 77,
    water_level_pct: 52,
    wildlife_activity_0_1: 0.32,
    wildlife_sightings_6h: 4,
    traffic_density_pct: 55,
    road_state: 'RESTRICTED',
    landslide_risk_0_100: 46,
    flood_risk_0_100: 46,
    wildlife_risk_0_100: 32,
    road_risk_0_100: 70,
    overall_risk_0_100: 50.5,
    confidence_0_100: 90,
    trend: 'RISING',
    data_origin: 'SIMULATED_REPLAY',
    source_status: 'SYNTHETIC_NOT_LIVE',
  },
  {
    timestamp: '2026-09-25 15:00',
    segment_id: 'S4',
    from_location: 'Marayoor',
    to_location: 'Valparai East',
    latitude: 10.3240,
    longitude: 76.9550,
    slope_deg: 31,
    rainfall_1h_mm: 23.6,
    rainfall_24h_mm: 96,
    soil_saturation_pct: 88,
    water_level_pct: 66,
    wildlife_activity_0_1: 0.41,
    wildlife_sightings_6h: 5,
    traffic_density_pct: 63,
    road_state: 'RESTRICTED',
    landslide_risk_0_100: 70,
    flood_risk_0_100: 61,
    wildlife_risk_0_100: 41,
    road_risk_0_100: 70,
    overall_risk_0_100: 66.8,
    confidence_0_100: 91,
    trend: 'RISING',
    data_origin: 'SIMULATED_REPLAY',
    source_status: 'SYNTHETIC_NOT_LIVE',
  },
  {
    timestamp: '2026-09-25 15:00',
    segment_id: 'S5',
    from_location: 'Munnar',
    to_location: 'Anamudi Corridor',
    latitude: 10.1460,
    longitude: 77.0630,
    slope_deg: 42,
    rainfall_1h_mm: 27.4,
    rainfall_24h_mm: 112,
    soil_saturation_pct: 94,
    water_level_pct: 79,
    wildlife_activity_0_1: 0.48,
    wildlife_sightings_6h: 6,
    traffic_density_pct: 68,
    road_state: 'RESTRICTED',
    landslide_risk_0_100: 83,
    flood_risk_0_100: 72,
    wildlife_risk_0_100: 48,
    road_risk_0_100: 70,
    overall_risk_0_100: 77.6,
    confidence_0_100: 92,
    trend: 'RISING',
    data_origin: 'SIMULATED_REPLAY',
    source_status: 'SYNTHETIC_NOT_LIVE',
  },
  {
    timestamp: '2026-09-25 15:00',
    segment_id: 'S6',
    from_location: 'Anamudi Corridor',
    to_location: 'Valparai',
    latitude: 10.3265,
    longitude: 76.9515,
    slope_deg: 38,
    rainfall_1h_mm: 25.1,
    rainfall_24h_mm: 104,
    soil_saturation_pct: 90,
    water_level_pct: 74,
    wildlife_activity_0_1: 0.52,
    wildlife_sightings_6h: 6,
    traffic_density_pct: 65,
    road_state: 'RESTRICTED',
    landslide_risk_0_100: 78,
    flood_risk_0_100: 68,
    wildlife_risk_0_100: 52,
    road_risk_0_100: 70,
    overall_risk_0_100: 72.8,
    confidence_0_100: 92,
    trend: 'RISING',
    data_origin: 'SIMULATED_REPLAY',
    source_status: 'SYNTHETIC_NOT_LIVE',
  },

  // --- 18:00 (Severe Multi-Hazard Peak / Blockage) ---
  {
    timestamp: '2026-09-25 18:00',
    segment_id: 'S1',
    from_location: 'Munnar',
    to_location: 'Gap Road',
    latitude: 10.0889,
    longitude: 77.0595,
    slope_deg: 34,
    rainfall_1h_mm: 24.2,
    rainfall_24h_mm: 106,
    soil_saturation_pct: 92,
    water_level_pct: 76,
    wildlife_activity_0_1: 0.45,
    wildlife_sightings_6h: 5,
    traffic_density_pct: 69,
    road_state: 'RESTRICTED',
    landslide_risk_0_100: 76,
    flood_risk_0_100: 67,
    wildlife_risk_0_100: 45,
    road_risk_0_100: 70,
    overall_risk_0_100: 70.9,
    confidence_0_100: 92,
    trend: 'RISING',
    data_origin: 'SIMULATED_REPLAY',
    source_status: 'SYNTHETIC_NOT_LIVE',
  },
  {
    timestamp: '2026-09-25 18:00',
    segment_id: 'S2',
    from_location: 'Gap Road',
    to_location: 'Chinnar Approach',
    latitude: 10.2195,
    longitude: 77.1602,
    slope_deg: 22,
    rainfall_1h_mm: 21.0,
    rainfall_24h_mm: 95,
    soil_saturation_pct: 87,
    water_level_pct: 68,
    wildlife_activity_0_1: 0.39,
    wildlife_sightings_6h: 5,
    traffic_density_pct: 64,
    road_state: 'RESTRICTED',
    landslide_risk_0_100: 62,
    flood_risk_0_100: 59,
    wildlife_risk_0_100: 39,
    road_risk_0_100: 70,
    overall_risk_0_100: 61.2,
    confidence_0_100: 91,
    trend: 'RISING',
    data_origin: 'SIMULATED_REPLAY',
    source_status: 'SYNTHETIC_NOT_LIVE',
  },
  {
    timestamp: '2026-09-25 18:00',
    segment_id: 'S3',
    from_location: 'Chinnar Approach',
    to_location: 'Marayoor',
    latitude: 10.2750,
    longitude: 77.1370,
    slope_deg: 18,
    rainfall_1h_mm: 19.5,
    rainfall_24h_mm: 88,
    soil_saturation_pct: 82,
    water_level_pct: 61,
    wildlife_activity_0_1: 0.36,
    wildlife_sightings_6h: 4,
    traffic_density_pct: 60,
    road_state: 'RESTRICTED',
    landslide_risk_0_100: 55,
    flood_risk_0_100: 52,
    wildlife_risk_0_100: 36,
    road_risk_0_100: 70,
    overall_risk_0_100: 56.4,
    confidence_0_100: 91,
    trend: 'RISING',
    data_origin: 'SIMULATED_REPLAY',
    source_status: 'SYNTHETIC_NOT_LIVE',
  },
  {
    timestamp: '2026-09-25 18:00',
    segment_id: 'S4',
    from_location: 'Marayoor',
    to_location: 'Valparai East',
    latitude: 10.3240,
    longitude: 76.9550,
    slope_deg: 31,
    rainfall_1h_mm: 25.8,
    rainfall_24h_mm: 110,
    soil_saturation_pct: 95,
    water_level_pct: 78,
    wildlife_activity_0_1: 0.50,
    wildlife_sightings_6h: 6,
    traffic_density_pct: 70,
    road_state: 'RESTRICTED',
    landslide_risk_0_100: 80,
    flood_risk_0_100: 71,
    wildlife_risk_0_100: 50,
    road_risk_0_100: 70,
    overall_risk_0_100: 73.7,
    confidence_0_100: 92,
    trend: 'RISING',
    data_origin: 'SIMULATED_REPLAY',
    source_status: 'SYNTHETIC_NOT_LIVE',
  },
  {
    timestamp: '2026-09-25 18:00',
    segment_id: 'S5',
    from_location: 'Munnar',
    to_location: 'Anamudi Corridor',
    latitude: 10.1460,
    longitude: 77.0630,
    slope_deg: 42,
    rainfall_1h_mm: 29.5,
    rainfall_24h_mm: 125,
    soil_saturation_pct: 98,
    water_level_pct: 88,
    wildlife_activity_0_1: 0.55,
    wildlife_sightings_6h: 7,
    traffic_density_pct: 75,
    road_state: 'RESTRICTED',
    landslide_risk_0_100: 89,
    flood_risk_0_100: 81,
    wildlife_risk_0_100: 55,
    road_risk_0_100: 70,
    overall_risk_0_100: 82.5,
    confidence_0_100: 93,
    trend: 'RISING',
    data_origin: 'SIMULATED_REPLAY',
    source_status: 'SYNTHETIC_NOT_LIVE',
  },
  {
    timestamp: '2026-09-25 18:00',
    segment_id: 'S6',
    from_location: 'Anamudi Corridor',
    to_location: 'Valparai',
    latitude: 10.3265,
    longitude: 76.9515,
    slope_deg: 38,
    rainfall_1h_mm: 26.8,
    rainfall_24h_mm: 118,
    soil_saturation_pct: 96,
    water_level_pct: 84,
    wildlife_activity_0_1: 0.62,
    wildlife_sightings_6h: 8,
    traffic_density_pct: 72,
    road_state: 'BLOCKED',
    landslide_risk_0_100: 85,
    flood_risk_0_100: 77,
    wildlife_risk_0_100: 62,
    road_risk_0_100: 100,
    overall_risk_0_100: 84.5,
    confidence_0_100: 93,
    trend: 'RISING',
    data_origin: 'SIMULATED_REPLAY',
    source_status: 'SYNTHETIC_NOT_LIVE',
  },
];

export const REPLAY_TIMESTAMPS: string[] = [
  '2026-09-25 06:00',
  '2026-09-25 09:00',
  '2026-09-25 12:00',
  '2026-09-25 15:00',
  '2026-09-25 18:00',
];

export const SEGMENT_NAMES: Record<string, string> = {
  S1: 'Munnar → Gap Road (Lockhart Cliffside)',
  S2: 'Gap Road → Chinnar Approach',
  S3: 'Chinnar Approach → Marayoor',
  S4: 'Marayoor → Valparai East Pass',
  S5: 'Munnar → Anamudi Forest Corridor',
  S6: 'Anamudi Corridor → Valparai Plateau',
};

// ============================================================
// 2. MATHEMATICAL RISK AND EVIDENCE FORMULAS
// ============================================================

/**
 * Landslide Signal = 0.15 + 0.004 * slope_deg + 0.0025 * rainfall_24h_mm + 0.003 * rainfall_1h_mm (clamped 0..1)
 * Landslide Risk = 100 * (0.45 * LandslideSignal + 0.35 * min(rainfall_1h_mm / 30, 1) + 0.20 * min(rainfall_24h_mm / 140, 1))
 */
export function calculateLandslideRisk(
  slope_deg: number,
  rainfall_24h_mm: number,
  rainfall_1h_mm: number
): { signal: number; risk: number } {
  const rawSignal = 0.15 + 0.004 * slope_deg + 0.0025 * rainfall_24h_mm + 0.003 * rainfall_1h_mm;
  const signal = Math.max(0, Math.min(1, rawSignal));

  const rawRisk = 100 * (
    0.45 * signal +
    0.35 * Math.min(rainfall_1h_mm / 30, 1) +
    0.20 * Math.min(rainfall_24h_mm / 140, 1)
  );
  const risk = Math.max(0, Math.min(100, Number(rawRisk.toFixed(1))));
  return { signal: Number(signal.toFixed(4)), risk };
}

/**
 * Flood Risk = 100 * (0.55 * (water_level_pct / 100) + 0.45 * min(rainfall_24h_mm / 160, 1))
 */
export function calculateFloodRisk(
  water_level_pct: number,
  rainfall_24h_mm: number
): number {
  const rawRisk = 100 * (
    0.55 * (water_level_pct / 100) +
    0.45 * Math.min(rainfall_24h_mm / 160, 1)
  );
  return Math.max(0, Math.min(100, Number(rawRisk.toFixed(1))));
}

/**
 * Wildlife Risk = wildlife_activity_0_1 * 100
 */
export function calculateWildlifeRisk(wildlife_activity_0_1: number): number {
  return Math.max(0, Math.min(100, Number((wildlife_activity_0_1 * 100).toFixed(1))));
}

/**
 * Road Risk Mapping:
 * OPEN = 0
 * PARTIALLY_ACCESSIBLE = 45
 * RESTRICTED = 70
 * BLOCKED = 100
 * UNKNOWN = null
 */
export function calculateRoadRisk(road_state: 'OPEN' | 'PARTIALLY_ACCESSIBLE' | 'RESTRICTED' | 'BLOCKED' | 'UNKNOWN'): number {
  switch (road_state) {
    case 'OPEN':
      return 0;
    case 'PARTIALLY_ACCESSIBLE':
      return 45;
    case 'RESTRICTED':
      return 70;
    case 'BLOCKED':
      return 100;
    case 'UNKNOWN':
    default:
      return 50; // Default cautious fallback for unknown
  }
}

/**
 * Overall Risk (Multi-hazard exposure indicator):
 * Overall Risk = 0.40 * Landslide + 0.20 * Flood + 0.15 * Wildlife + 0.25 * Road
 */
export function calculateOverallRisk(
  landslideRisk: number,
  floodRisk: number,
  wildlifeRisk: number,
  roadRisk: number
): number {
  const rawOverall = 0.40 * landslideRisk + 0.20 * floodRisk + 0.15 * wildlifeRisk + 0.25 * roadRisk;
  return Math.max(0, Math.min(100, Number(rawOverall.toFixed(1))));
}

/**
 * Confidence = 0.40 * Data Completeness + 0.35 * Freshness + 0.25 * Source Agreement (0..100)
 * Evidence quality indicator, strictly independent of hazard severity.
 */
export function calculateEvidenceConfidence(
  dataCompleteness: number = 100,
  freshness: number = 90,
  sourceAgreement: number = 85
): number {
  const rawConfidence = 0.40 * dataCompleteness + 0.35 * freshness + 0.25 * sourceAgreement;
  return Math.max(0, Math.min(100, Number(rawConfidence.toFixed(1))));
}

/**
 * Trend calculation:
 * Current Risk - Previous Risk:
 * >= +8: RISING
 * <= -8: FALLING
 * otherwise: STABLE
 */
export function calculateRiskTrend(
  currentRisk: number,
  previousRisk?: number
): 'STABLE' | 'RISING' | 'FALLING' {
  if (previousRisk === undefined || previousRisk === null) {
    return 'STABLE';
  }
  const delta = currentRisk - previousRisk;
  if (delta >= 8.0) return 'RISING';
  if (delta <= -8.0) return 'FALLING';
  return 'STABLE';
}

// ============================================================
// 3. SEGMENT & CORRIDOR STATE CALCULATION PIPELINE
// ============================================================

export function processSegmentObservation(
  obs: ReplayObservationRaw,
  previousSegmentState?: CalculatedSegmentState
): CalculatedSegmentState {
  const { signal: landslideSignal, risk: landslideRisk } = calculateLandslideRisk(
    obs.slope_deg,
    obs.rainfall_24h_mm,
    obs.rainfall_1h_mm
  );
  const floodRisk = calculateFloodRisk(obs.water_level_pct, obs.rainfall_24h_mm);
  const wildlifeRisk = calculateWildlifeRisk(obs.wildlife_activity_0_1);
  const roadRisk = calculateRoadRisk(obs.road_state);
  const overallRisk = calculateOverallRisk(landslideRisk, floodRisk, wildlifeRisk, roadRisk);

  const previousRisk = previousSegmentState ? previousSegmentState.overallRisk : undefined;
  const trend = calculateRiskTrend(overallRisk, previousRisk);

  // Confidence calculation from evidence quality
  const confidence = obs.confidence_0_100 ?? calculateEvidenceConfidence(100, 92, 88);

  return {
    segment_id: obs.segment_id,
    from_location: obs.from_location,
    to_location: obs.to_location,
    name: SEGMENT_NAMES[obs.segment_id] || `${obs.from_location} → ${obs.to_location}`,
    latitude: obs.latitude,
    longitude: obs.longitude,
    slope_deg: obs.slope_deg,

    rainfall_1h_mm: obs.rainfall_1h_mm,
    rainfall_24h_mm: obs.rainfall_24h_mm,
    soil_saturation_pct: obs.soil_saturation_pct,
    water_level_pct: obs.water_level_pct,
    wildlife_activity_0_1: obs.wildlife_activity_0_1,
    wildlife_sightings_6h: obs.wildlife_sightings_6h,
    traffic_density_pct: obs.traffic_density_pct,
    road_state: obs.road_state,

    landslideSignal,
    landslideRisk,
    floodRisk,
    wildlifeRisk,
    roadRisk,
    overallRisk,

    confidence,
    trend,
    previousRisk,
    referenceOverallRisk: obs.overall_risk_0_100,

    data_origin: 'SIMULATED_REPLAY',
    source_status: 'SYNTHETIC_NOT_LIVE',
  };
}

// ============================================================
// 4. ACTION RESOLUTION ENGINE ADAPTATION & REPLAY SNAPSHOTS
// ============================================================

export function buildReplaySnapshot(
  timestamp: string,
  previousSnapshot?: ReplaySnapshot
): ReplaySnapshot {
  const rawRows = RAW_SYNTHETIC_REPLAY_DATASET.filter(r => r.timestamp === timestamp);
  if (rawRows.length === 0) {
    throw new Error(`No replay data rows found for timestamp: ${timestamp}`);
  }

  const segments: Record<string, CalculatedSegmentState> = {};
  const segmentList: CalculatedSegmentState[] = [];

  for (const row of rawRows) {
    const prevSeg = previousSnapshot?.segments[row.segment_id];
    const calculated = processSegmentObservation(row, prevSeg);
    segments[row.segment_id] = calculated;
    segmentList.push(calculated);
  }

  // Identify controlling segment by highest overall risk
  let controllingSegment = segmentList[0];
  for (let i = 1; i < segmentList.length; i++) {
    if (segmentList[i].overallRisk > controllingSegment.overallRisk) {
      controllingSegment = segmentList[i];
    }
  }

  // Corridor aggregates
  const avgRisk = Number((segmentList.reduce((acc, s) => acc + s.overallRisk, 0) / segmentList.length).toFixed(1));
  const maxRisk = controllingSegment.overallRisk;
  const corridorRisk = Number((0.7 * maxRisk + 0.3 * avgRisk).toFixed(1));
  const corridorConfidence = Number((segmentList.reduce((acc, s) => acc + s.confidence, 0) / segmentList.length).toFixed(1));

  const prevCorridorRisk = previousSnapshot ? previousSnapshot.corridorRisk : undefined;
  const corridorTrend = calculateRiskTrend(corridorRisk, prevCorridorRisk);

  // Road state summary across corridor
  const hasBlocked = segmentList.some(s => s.road_state === 'BLOCKED');
  const hasRestricted = segmentList.some(s => s.road_state === 'RESTRICTED');
  const hasPartial = segmentList.some(s => s.road_state === 'PARTIALLY_ACCESSIBLE');
  const roadStateSummary = hasBlocked ? 'BLOCKED' : hasRestricted ? 'RESTRICTED' : hasPartial ? 'PARTIALLY_ACCESSIBLE' : 'OPEN';

  // Primary hazard summary
  let primaryHazard = 'Nominal Weather & Clear Roadways';
  if (controllingSegment.landslideRisk >= 60) {
    primaryHazard = `Severe Landslide Threat (${controllingSegment.landslideRisk}/100)`;
  } else if (controllingSegment.floodRisk >= 60) {
    primaryHazard = `High Inundation & Flash Flood (${controllingSegment.floodRisk}/100)`;
  } else if (controllingSegment.wildlifeRisk >= 50) {
    primaryHazard = `Elephant Corridor Crossing Surge (${controllingSegment.wildlifeRisk}/100)`;
  } else if (controllingSegment.road_state === 'BLOCKED') {
    primaryHazard = 'Complete Road Obstruction';
  } else if (controllingSegment.overallRisk >= 40) {
    primaryHazard = 'Moderate Rain & Slick Mountain Surface';
  }

  // 1. Build normalized HazardStates for the Engine
  const normalizedHazardState: HazardState[] = [];

  for (const s of segmentList) {
    if (s.landslideRisk >= 30) {
      normalizedHazardState.push({
        id: `H_LANDSLIDE_${s.segment_id}`,
        type: 'LANDSLIDE' as HazardType,
        location: { lat: s.latitude, lng: s.longitude, name: s.name },
        affectedSegments: [s.segment_id],
        severity: Number((s.landslideRisk / 100).toFixed(2)),
        confidence: Number((s.confidence / 100).toFixed(2)),
        trend: (s.trend.toLowerCase() as HazardTrend) || 'stable',
        source: 'Simulated Replay Geotechnical Model',
        sourceType: 'SIMULATED',
        lastUpdated: timestamp,
      });
    }

    if (s.floodRisk >= 40) {
      normalizedHazardState.push({
        id: `H_FLOOD_${s.segment_id}`,
        type: 'FLASH_FLOOD' as HazardType,
        location: { lat: s.latitude, lng: s.longitude, name: s.name },
        affectedSegments: [s.segment_id],
        severity: Number((s.floodRisk / 100).toFixed(2)),
        confidence: Number((s.confidence / 100).toFixed(2)),
        trend: (s.trend.toLowerCase() as HazardTrend) || 'stable',
        source: 'Simulated Replay Hydrology Model',
        sourceType: 'SIMULATED',
        lastUpdated: timestamp,
      });
    }

    if (s.wildlifeRisk >= 35) {
      normalizedHazardState.push({
        id: `H_WILDLIFE_${s.segment_id}`,
        type: 'WILDLIFE' as HazardType,
        location: { lat: s.latitude, lng: s.longitude, name: s.name },
        affectedSegments: [s.segment_id],
        severity: Number((s.wildlifeRisk / 100).toFixed(2)),
        confidence: Number((s.confidence / 100).toFixed(2)),
        trend: (s.trend.toLowerCase() as HazardTrend) || 'stable',
        source: 'Simulated Replay Forest Ranger Sensor Network',
        sourceType: 'SIMULATED',
        lastUpdated: timestamp,
      });
    }
  }

  // 2. Build RoadStates for the Engine
  const roadStates: RoadState[] = segmentList.map(s => ({
    segmentId: s.segment_id,
    name: s.name,
    state: s.road_state === 'UNKNOWN' ? 'RESTRICTED' : s.road_state,
    source: 'Simulated Replay Road Telemetry',
    sourceType: 'SIMULATED',
    confidence: Number((s.confidence / 100).toFixed(2)),
    lastUpdated: timestamp,
  }));

  // 3. EXECUTE UNIFIED ACTION RESOLUTION ENGINE
  const decisionResult = resolveProtectiveAction({
    corridorType: 'MUNNAR_VALPARAI',
    baseConfidence: Number((corridorConfidence / 100).toFixed(2)),
    hazards: normalizedHazardState,
    roadStates,
    travelerState: {
      currentSegmentId: controllingSegment.segment_id,
      currentTime: timestamp,
    },
    isSimulatedScenario: true,
    scenarioName: `Replay at ${timestamp.split(' ')[1]}`,
  });

  const timeLabel = timestamp.split(' ')[1] || timestamp;
  const timelineIndex = REPLAY_TIMESTAMPS.indexOf(timestamp);

  const provenance: ReplayProvenance = {
    dataOrigin: 'SIMULATED_REPLAY',
    sourceStatus: 'SYNTHETIC_NOT_LIVE',
    label: 'Real-Time Replay Mode',
    badgeText: 'Simulated Replay',
    provenanceDescription: 'Data source: Synthetic Replay Dataset (Munnar–Valparai Corridor)',
    recencyFormula: 'Evaluated from replay step interval observations',
    isLive: false,
  };

  return {
    timestamp,
    timeLabel,
    timelineIndex: timelineIndex >= 0 ? timelineIndex : 0,
    totalTimestamps: REPLAY_TIMESTAMPS.length,
    segments,
    segmentList,
    controllingSegment,
    corridorRisk,
    corridorConfidence,
    corridorTrend,
    primaryHazard,
    roadStateSummary,
    normalizedHazardState,
    roadStates,
    decisionResult,
    provenance,
  };
}

// ============================================================
// 5. CACHED REPLAY TIMELINE GENERATOR
// ============================================================

export function generateFullReplayTimeline(): {
  snapshots: ReplaySnapshot[];
  events: DecisionTimelineEvent[];
} {
  const snapshots: ReplaySnapshot[] = [];
  const events: DecisionTimelineEvent[] = [];

  let prevSnap: ReplaySnapshot | undefined = undefined;

  for (const ts of REPLAY_TIMESTAMPS) {
    const snap = buildReplaySnapshot(ts, prevSnap);
    snapshots.push(snap);

    const prevAction = prevSnap ? prevSnap.decisionResult.action : 'CONTINUE';
    const actionChanged = !prevSnap || prevAction !== snap.decisionResult.action;

    let reasonForChange = 'Initial corridor baseline status at departure time.';
    if (prevSnap) {
      if (snap.roadStateSummary === 'BLOCKED') {
        reasonForChange = `Critical blockage on ${snap.controllingSegment.name}; forward route impassable.`;
      } else if (snap.corridorRisk > prevSnap.corridorRisk + 15) {
        reasonForChange = `Sharp risk elevation (+${(snap.corridorRisk - prevSnap.corridorRisk).toFixed(1)}) due to rapid rainfall accumulation.`;
      } else if (snap.roadStateSummary === 'RESTRICTED' && prevSnap.roadStateSummary !== 'RESTRICTED') {
        reasonForChange = `Road conditions degraded to RESTRICTED along ${snap.controllingSegment.name}.`;
      } else if (snap.corridorTrend === 'RISING') {
        reasonForChange = `Rising multi-hazard exposure across Munnar–Valparai corridor.`;
      } else {
        reasonForChange = `Stable atmospheric and roadway conditions observed.`;
      }
    }

    events.push({
      timestamp: ts,
      timeLabel: ts.split(' ')[1] || ts,
      previousRisk: prevSnap ? prevSnap.corridorRisk : snap.corridorRisk,
      newRisk: snap.corridorRisk,
      previousRoadState: prevSnap ? prevSnap.roadStateSummary : snap.roadStateSummary,
      newRoadState: snap.roadStateSummary,
      previousTrend: prevSnap ? prevSnap.corridorTrend : snap.corridorTrend,
      newTrend: snap.corridorTrend,
      previousAction: prevAction,
      newAction: snap.decisionResult.action,
      actionChanged,
      reasonForChange,
      controllingSegment: snap.controllingSegment.name,
      candidateEvaluations: snap.decisionResult.candidateEvaluations,
    });

    prevSnap = snap;
  }

  return { snapshots, events };
}

// Precomputed canonical timeline for immediate client hydration
export const PRECOMPUTED_REPLAY = generateFullReplayTimeline();
