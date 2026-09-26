/**
 * Unified Emergency Contacts & Survival Directory for TravelLord AI
 * Single source of truth for:
 * - /emergency
 * - EmergencyPanel.tsx
 * - /learn/emergency-contacts
 */

export interface EmergencyContact {
  id: string;
  title: string;
  number: string;
  category: 'NATIONAL' | 'DISASTER_MANAGEMENT' | 'WILDLIFE' | 'POLICE_TRAFFIC' | 'MEDICAL';
  desc: string;
  tollFree: boolean;
  jurisdiction: string;
}

export interface SurvivalGuide {
  id: string;
  category: 'LANDSLIDE' | 'FLOOD' | 'WILDLIFE' | 'ROAD_BLOCKAGE' | 'ACCIDENT';
  title: string;
  summary: string;
  protocol: string[];
}

export const EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    id: 'ER_112',
    title: 'National Emergency Helpline',
    number: '112',
    category: 'NATIONAL',
    desc: 'Unified emergency dispatch for Police, Fire, Ambulance, and Mountain Search & Rescue.',
    tollFree: true,
    jurisdiction: 'All-India 24/7'
  },
  {
    id: 'ER_1077',
    title: 'Kerala SDMA Control Room',
    number: '1077',
    category: 'DISASTER_MANAGEMENT',
    desc: 'State & District Disaster Management Authority control room for monsoon & landslide alerts.',
    tollFree: true,
    jurisdiction: 'Kerala District Level'
  },
  {
    id: 'ER_SEOC',
    title: 'State Emergency Operations Centre (SEOC)',
    number: '0471-2331645',
    category: 'DISASTER_MANAGEMENT',
    desc: 'Thiruvananthapuram central disaster coordination & high-level rescue dispatch.',
    tollFree: false,
    jurisdiction: 'Kerala State Central HQ'
  },
  {
    id: 'ER_WILDLIFE',
    title: 'Forest Dept Wildlife Rapid Response (RRT)',
    number: '1800-425-4733',
    category: 'WILDLIFE',
    desc: 'Specialized elephant corridor monitoring, animal crossing blockades, and rescue.',
    tollFree: true,
    jurisdiction: 'Western Ghats Forest Division'
  },
  {
    id: 'ER_TRAUMA',
    title: 'Highway Ambulance & Medical Triage',
    number: '108',
    category: 'MEDICAL',
    desc: 'Immediate mobile medical dispatch with basic life support units along highways.',
    tollFree: true,
    jurisdiction: 'National Highways & Ghat Routes'
  },
  {
    id: 'ER_WAYANAD_DDMA',
    title: 'Wayanad District Disaster Management',
    number: '04936-204151',
    category: 'DISASTER_MANAGEMENT',
    desc: 'Collectorate EOC control room for NH-766 ghat pass landslide management.',
    tollFree: false,
    jurisdiction: 'Wayanad District'
  }
];

export const SURVIVAL_GUIDES: SurvivalGuide[] = [
  {
    id: 'SG_LANDSLIDE',
    category: 'LANDSLIDE',
    title: 'Geotechnical Slope Failure & Mudflow',
    summary: 'Procedures when encountering active debris flow or saturated hillside slips on ghat roads.',
    protocol: [
      'Do not attempt to drive through moving mud or fresh rock debris; saturated soil mantles can suddenly collapse.',
      'Reverse to the nearest wide hairpin curve or designated foothill safe zone immediately.',
      'If trapped between two slips, exit vehicle if hillside above is actively failing and seek high ground on stable bedrock.',
      'Report exact GPS coordinates to 112 or SDMA 1077.'
    ]
  },
  {
    id: 'SG_WILDLIFE',
    category: 'WILDLIFE',
    title: 'Wild Elephant Corridor Encounters',
    summary: 'Standard forest division protocol for elephant herd crossings in Munnar and Wayanad reserves.',
    protocol: [
      'Stop at least 100 meters away from the herd; turn off high-beam headlights and do NOT sound the vehicle horn.',
      'Keep engine running in low gear, windows rolled up, and be prepared to reverse slowly.',
      'Never attempt to overtake or squeeze past calves or lone bulls on narrow forest links.',
      'Wait for the herd to cross into the reserve interior; contact Forest RRT at 1800-425-4733.'
    ]
  },
  {
    id: 'SG_FLOOD',
    category: 'FLOOD',
    title: 'Flash Floods & Waterway Surges',
    summary: 'Handling sudden water level spikes at culverts, foothill causeways, and river bridges.',
    protocol: [
      'Never drive across a submerged bridge or flooded culvert — water depth and carriageway integrity cannot be determined.',
      'Turn back immediately and hold transit at higher elevation safe staging zones.',
      'If vehicle stalls in rising water, abandon vehicle immediately and move to higher ground.'
    ]
  },
  {
    id: 'SG_BLOCKAGE',
    category: 'ROAD_BLOCKAGE',
    title: 'Fallen Trees & Structural Blockages',
    summary: 'Safety protocol for electrical line disruptions and heavy timber road obstacles.',
    protocol: [
      'Assume all downed power lines are energized; stay at least 10 meters away inside your vehicle.',
      'Warn approaching traffic from a safe distance using hazard blinkers.',
      'Dial 112 and use Hazard Intelligence to report the blockage for immediate PWD clearance.'
    ]
  }
];
