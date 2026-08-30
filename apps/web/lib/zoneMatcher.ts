import { AdminZone } from './types';

export const ADMIN_ZONES: AdminZone[] = [
  // ── LUDHIANA ──────────────────────────────────────────────────────────────
  {
    id: 'b1111111-1111-1111-1111-111111111111',
    zone_name: 'Ward 18 (Model Town, Ludhiana)',
    department: 'Ludhiana Municipal Corporation — PWD',
    city: 'Ludhiana',
    city_code: 'LDH',
    official_handle: '@LMC_PWD_ModelTown',
    center: [30.9225, 75.8375],
    boundary: [[[75.820, 30.910], [75.855, 30.910], [75.855, 30.935], [75.820, 30.935], [75.820, 30.910]]]
  },
  {
    id: 'b2222222-2222-2222-2222-222222222222',
    zone_name: 'Ward 32 (Sahnewal, Ludhiana)',
    department: 'Ludhiana MC — Solid Waste Management',
    city: 'Ludhiana',
    city_code: 'LDH',
    official_handle: '@LMC_SWM_Sahnewal',
    center: [30.885, 75.8875],
    boundary: [[[75.870, 30.870], [75.905, 30.870], [75.905, 30.900], [75.870, 30.900], [75.870, 30.870]]]
  },
  {
    id: 'b3333333-3333-3333-3333-333333333333',
    zone_name: 'Ward 9 (Civil Lines, Ludhiana)',
    department: 'Ludhiana MC — Roads & Drainage',
    city: 'Ludhiana',
    city_code: 'LDH',
    official_handle: '@LMC_Roads_CivilLines',
    center: [30.9075, 75.855],
    boundary: [[[75.840, 30.895], [75.870, 30.895], [75.870, 30.920], [75.840, 30.920], [75.840, 30.895]]]
  },
  {
    id: 'b4444444-4444-4444-4444-444444444444',
    zone_name: 'Ward 45 (Dugri, Ludhiana)',
    department: 'Ludhiana MC — Public Health Engineering',
    city: 'Ludhiana',
    city_code: 'LDH',
    official_handle: '@LMC_PHE_Dugri',
    center: [30.880, 75.815],
    boundary: [[[75.800, 30.865], [75.830, 30.865], [75.830, 30.895], [75.800, 30.895], [75.800, 30.865]]]
  },

  // ── AMRITSAR ──────────────────────────────────────────────────────────────
  {
    id: 'c1111111-1111-1111-1111-111111111111',
    zone_name: 'Ward 7 (Golden Avenue, Amritsar)',
    department: 'Amritsar Municipal Corporation — PWD',
    city: 'Amritsar',
    city_code: 'AMR',
    official_handle: '@AMC_PWD_GoldenAve',
    center: [31.625, 74.840],
    boundary: [[[74.820, 31.610], [74.860, 31.610], [74.860, 31.640], [74.820, 31.640], [74.820, 31.610]]]
  },
  {
    id: 'c2222222-2222-2222-2222-222222222222',
    zone_name: 'Ward 22 (Ranjit Avenue, Amritsar)',
    department: 'Amritsar MC — Solid Waste Management',
    city: 'Amritsar',
    city_code: 'AMR',
    official_handle: '@AMC_SWM_RanjitAve',
    center: [31.634, 74.875],
    boundary: [[[74.855, 31.620], [74.895, 31.620], [74.895, 31.648], [74.855, 31.648], [74.855, 31.620]]]
  },
  {
    id: 'c3333333-3333-3333-3333-333333333333',
    zone_name: 'Ward 14 (Old City Heritage, Amritsar)',
    department: 'Amritsar MC — Heritage Zone Roads',
    city: 'Amritsar',
    city_code: 'AMR',
    official_handle: '@AMC_Heritage_Roads',
    center: [31.628, 74.8825],
    boundary: [[[74.870, 31.618], [74.895, 31.618], [74.895, 31.638], [74.870, 31.638], [74.870, 31.618]]]
  },
  {
    id: 'c4444444-4444-4444-4444-444444444444',
    zone_name: 'Ward 35 (Green Avenue, Amritsar)',
    department: 'Amritsar MC — Streetlights & Electrical',
    city: 'Amritsar',
    city_code: 'AMR',
    official_handle: '@AMC_Electrical_GreenAve',
    center: [31.6125, 74.855],
    boundary: [[[74.840, 31.600], [74.870, 31.600], [74.870, 31.625], [74.840, 31.625], [74.840, 31.600]]]
  },

  // ── CHANDIGARH ─────────────────────────────────────────────────────────────
  {
    id: 'd1111111-1111-1111-1111-111111111111',
    zone_name: 'Sector 17 (City Centre, Chandigarh)',
    department: 'Chandigarh MC — Roads & Infrastructure',
    city: 'Chandigarh',
    city_code: 'CHD',
    official_handle: '@CMC_Roads_Sector17',
    center: [30.7425, 76.785],
    boundary: [[[76.770, 30.730], [76.800, 30.730], [76.800, 30.755], [76.770, 30.755], [76.770, 30.730]]]
  },
  {
    id: 'd2222222-2222-2222-2222-222222222222',
    zone_name: 'Sector 22 (Industrial Area, Chandigarh)',
    department: 'Chandigarh MC — Sanitation & SWM',
    city: 'Chandigarh',
    city_code: 'CHD',
    official_handle: '@CMC_SWM_Sector22',
    center: [30.743, 76.815],
    boundary: [[[76.800, 30.730], [76.830, 30.730], [76.830, 30.756], [76.800, 30.756], [76.800, 30.730]]]
  },
  {
    id: 'd3333333-3333-3333-3333-333333333333',
    zone_name: 'Sector 35 (Residential, Chandigarh)',
    department: 'Chandigarh MC — Parks & Drainage',
    city: 'Chandigarh',
    city_code: 'CHD',
    official_handle: '@CMC_Parks_Sector35',
    center: [30.717, 76.777],
    boundary: [[[76.762, 30.704], [76.792, 30.704], [76.792, 30.730], [76.762, 30.730], [76.762, 30.704]]]
  },
  {
    id: 'd4444444-4444-4444-4444-444444444444',
    zone_name: 'Sector 9 (University Zone, Chandigarh)',
    department: 'Chandigarh MC — Electrical & Streetlights',
    city: 'Chandigarh',
    city_code: 'CHD',
    official_handle: '@CMC_Electric_Sector9',
    center: [30.7675, 76.755],
    boundary: [[[76.740, 30.755], [76.770, 30.755], [76.770, 30.780], [76.740, 30.780], [76.740, 30.755]]]
  },

  // ── PATIALA ────────────────────────────────────────────────────────────────
  {
    id: 'e1111111-1111-1111-1111-111111111111',
    zone_name: 'Ward 8 (Urban Estate, Patiala)',
    department: 'Patiala Municipal Corporation — PWD',
    city: 'Patiala',
    city_code: 'PTL',
    official_handle: '@PMC_PWD_UrbanEstate',
    center: [30.334, 76.390],
    boundary: [[[76.370, 30.320], [76.410, 30.320], [76.410, 30.348], [76.370, 30.348], [76.370, 30.320]]]
  },
  {
    id: 'e2222222-2222-2222-2222-222222222222',
    zone_name: 'Ward 20 (Old City, Patiala)',
    department: 'Patiala MC — Solid Waste & Sanitation',
    city: 'Patiala',
    city_code: 'PTL',
    official_handle: '@PMC_SWM_OldCity',
    center: [30.3475, 76.4075],
    boundary: [[[76.390, 30.335], [76.425, 30.335], [76.425, 30.360], [76.390, 30.360], [76.390, 30.335]]]
  },
  {
    id: 'e3333333-3333-3333-3333-333333333333',
    zone_name: 'Ward 30 (Rajpura Road, Patiala)',
    department: 'Patiala MC — Roads & Drainage',
    city: 'Patiala',
    city_code: 'PTL',
    official_handle: '@PMC_Roads_Rajpura',
    center: [30.354, 76.4275],
    boundary: [[[76.410, 30.340], [76.445, 30.340], [76.445, 30.368], [76.410, 30.368], [76.410, 30.340]]]
  },

  // ── JALANDHAR ──────────────────────────────────────────────────────────────
  {
    id: 'f1111111-1111-1111-1111-111111111111',
    zone_name: 'Ward 11 (Model Town, Jalandhar)',
    department: 'Jalandhar Municipal Corporation — PWD',
    city: 'Jalandhar',
    city_code: 'JLD',
    official_handle: '@JMC_PWD_ModelTown',
    center: [31.3175, 75.565],
    boundary: [[[75.550, 31.305], [75.580, 31.305], [75.580, 31.330], [75.550, 31.330], [75.550, 31.305]]]
  },
  {
    id: 'f2222222-2222-2222-2222-222222222222',
    zone_name: 'Ward 25 (New Model Town, Jalandhar)',
    department: 'Jalandhar MC — Solid Waste Management',
    city: 'Jalandhar',
    city_code: 'JLD',
    official_handle: '@JMC_SWM_NewModelTown',
    center: [31.3315, 75.5925],
    boundary: [[[75.575, 31.318], [75.610, 31.318], [75.610, 31.345], [75.575, 31.345], [75.575, 31.318]]]
  },
  {
    id: 'f3333333-3333-3333-3333-333333333333',
    zone_name: 'Ward 38 (Lajpat Nagar, Jalandhar)',
    department: 'Jalandhar MC — Roads & Infrastructure',
    city: 'Jalandhar',
    city_code: 'JLD',
    official_handle: '@JMC_Roads_LajpatNagar',
    center: [31.3075, 75.545],
    boundary: [[[75.530, 31.295], [75.560, 31.295], [75.560, 31.320], [75.530, 31.320], [75.530, 31.295]]]
  },

  // ── MOHALI (SAS Nagar) ─────────────────────────────────────────────────────
  {
    id: 'g1111111-1111-1111-1111-111111111111',
    zone_name: 'Phase 7 (IT City, Mohali)',
    department: 'Greater Mohali Area Dev Authority (GMADA)',
    city: 'Mohali',
    city_code: 'MOH',
    official_handle: '@GMADA_Phase7',
    center: [30.715, 76.740],
    boundary: [[[76.720, 30.700], [76.760, 30.700], [76.760, 30.730], [76.720, 30.730], [76.720, 30.700]]]
  },
  {
    id: 'g2222222-2222-2222-2222-222222222222',
    zone_name: 'Phase 11 (Residential, Mohali)',
    department: 'GMADA — Roads & Drainage',
    city: 'Mohali',
    city_code: 'MOH',
    official_handle: '@GMADA_Phase11',
    center: [30.7185, 76.7725],
    boundary: [[[76.755, 30.705], [76.790, 30.705], [76.790, 30.732], [76.755, 30.732], [76.755, 30.705]]]
  },
];

// Point in Polygon algorithm (Ray-casting)
function isPointInPolygon(point: [number, number], polygon: number[][]): boolean {
  const [lng, lat] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    const intersect = ((yi > lat) !== (yj > lat)) &&
      (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

// Calculate Haversine distance in meters
export function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export interface RealGeoAddress {
  road?: string;
  suburb?: string;
  neighbourhood?: string;
  city?: string;
  town?: string;
  state?: string;
  display_name?: string;
  ward_name: string;
  department: string;
  city_code: string;
}

// Real-time reverse geocoding using OpenStreetMap Nominatim
export async function reverseGeocodeReal(latitude: number, longitude: number): Promise<RealGeoAddress> {
  // First check if within configured Punjab wards
  for (const zone of ADMIN_ZONES) {
    if (zone.boundary && zone.boundary[0]) {
      if (isPointInPolygon([longitude, latitude], zone.boundary[0])) {
        return {
          ward_name: zone.zone_name,
          city: zone.city,
          department: zone.department,
          city_code: zone.city_code,
          display_name: `${zone.zone_name}, ${zone.city}`,
        };
      }
    }
  }

  // If outside polygon, fetch real OSM address
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
      {
        headers: { 'Accept-Language': 'en' },
        signal: controller.signal,
      }
    );
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};

      const road = addr.road || addr.street || '';
      const suburb = addr.suburb || addr.neighbourhood || addr.residential || addr.subdistrict || '';
      const city = addr.city || addr.town || addr.municipality || addr.district || addr.county || 'Local Area';
      const state = addr.state || '';

      const locationLabel = suburb ? `${suburb}, ${city}` : road ? `${road}, ${city}` : city;
      const cityCode = (city.slice(0, 3) || 'PB').toUpperCase();

      return {
        road,
        suburb,
        city,
        state,
        display_name: data.display_name,
        ward_name: `Ward (${locationLabel})`,
        department: `Municipal Corporation (${city})`,
        city_code: cityCode,
      };
    }
  } catch (err: any) {
    if (err?.name !== 'AbortError') {
      console.warn('OSM reverse geocoding note:', err?.message || err);
    }
  }

  // Heuristic coordinate fallback
  return {
    ward_name: 'Ward 09 (Law Gate Municipal Sector)',
    city: 'Phagwara Municipal Corporation',
    department: 'Public Works & Sanitation',
    city_code: 'PHA',
  };
}

// Synchronous Matcher — returns nearest Punjab zone by polygon, then by distance
export function matchZoneByCoordinates(latitude: number, longitude: number): AdminZone {
  for (const zone of ADMIN_ZONES) {
    if (zone.boundary && zone.boundary[0]) {
      if (isPointInPolygon([longitude, latitude], zone.boundary[0])) {
        return zone;
      }
    }
  }

  // Check proximity to Punjab (centre ~31.1°N 75.3°E)
  const distToPunjab = getDistanceMeters(latitude, longitude, 31.1, 75.3);
  if (distToPunjab > 200000) {
    // User is outside Punjab — return standard designated ward
    return {
      id: `zone-w09`,
      zone_name: 'Ward 09 (Law Gate Municipal Sector)',
      department: 'Municipal Corporation (Roads & Sanitation)',
      city: 'Phagwara',
      city_code: 'PHA',
      official_handle: '@Municipal_Ward09_Desk',
      center: [latitude, longitude],
    };
  }

  // Within Punjab region — return nearest ward by centroid distance
  let nearestZone = ADMIN_ZONES[0];
  let minDistance = Infinity;

  for (const zone of ADMIN_ZONES) {
    const dist = getDistanceMeters(latitude, longitude, zone.center[0], zone.center[1]);
    if (dist < minDistance) {
      minDistance = dist;
      nearestZone = zone;
    }
  }

  return nearestZone;
}