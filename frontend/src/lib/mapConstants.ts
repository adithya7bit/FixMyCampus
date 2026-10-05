export interface CampusBuilding {
  id: string;
  name: string;
  code: string;
  latitude: number;
  longitude: number;
  description: string;
}

// Mapbox API Configuration
export const MAPBOX_ACCESS_TOKEN =
  (import.meta as any).env?.VITE_MAPBOX_TOKEN || '';

export interface MapboxStyleOption {
  id: string;
  name: string;
  styleId: string;
  icon: string;
  description: string;
}

export const MAPBOX_STYLES: MapboxStyleOption[] = [
  {
    id: 'streets',
    name: 'Mapbox Streets (v12)',
    styleId: 'mapbox/streets-v12',
    icon: '🗺️',
    description: 'High-res vector roads, 3D buildings, pedestrian paths, and campus walkways',
  },
  {
    id: 'satellite-streets',
    name: 'Mapbox Satellite Hybrid',
    styleId: 'mapbox/satellite-streets-v12',
    icon: '🛰️',
    description: 'High-res satellite aerial imagery overlaid with campus street labels',
  },
  {
    id: 'dark',
    name: 'Mapbox Dark (v11)',
    styleId: 'mapbox/dark-v11',
    icon: '🌙',
    description: 'Mapbox official high-contrast dark theme for night telemetry',
  },
  {
    id: 'outdoors',
    name: 'Mapbox Outdoors (v12)',
    styleId: 'mapbox/outdoors-v12',
    icon: '🌲',
    description: 'Topographic contour, campus greenery, quadrangles, and recreation trails',
  },
  {
    id: 'navigation-night',
    name: 'Mapbox Navigation Night',
    styleId: 'mapbox/navigation-night-v1',
    icon: '⚡',
    description: 'High-visibility tactical night view',
  },
];

export interface CampusPreset {
  id: string;
  name: string;
  shortName: string;
  latitude: number;
  longitude: number;
  zoom: number;
  description: string;
  buildings: CampusBuilding[];
}

export const CAMPUS_BUILDINGS: CampusBuilding[] = [
  {
    id: 'bld-1',
    name: 'Block A (Science & Engg)',
    code: 'BLK-A',
    latitude: 37.4275,
    longitude: -122.1697,
    description: 'Engineering labs, lecture halls 101-305',
  },
  {
    id: 'bld-2',
    name: 'Block B (Computing & Tech)',
    code: 'BLK-B',
    latitude: 37.4282,
    longitude: -122.1712,
    description: 'Computer labs, server hubs, networking center',
  },
  {
    id: 'bld-3',
    name: 'Main Administration Building',
    code: 'ADMIN',
    latitude: 37.426,
    longitude: -122.1685,
    description: 'Dean office, registrar, student affairs',
  },
  {
    id: 'bld-4',
    name: 'Central University Library',
    code: 'LIB',
    latitude: 37.4268,
    longitude: -122.1668,
    description: '4 floors of reading rooms and digital media center',
  },
  {
    id: 'bld-5',
    name: 'Student Canteen & Dining Hall',
    code: 'CANTEEN',
    latitude: 37.4255,
    longitude: -122.1715,
    description: 'Main dining hall, food court, cafeteria',
  },
  {
    id: 'bld-6',
    name: 'Hostel Block 1 (Boys Residence)',
    code: 'HSTL-1',
    latitude: 37.4295,
    longitude: -122.166,
    description: 'Undergraduate student residence block 1',
  },
  {
    id: 'bld-7',
    name: 'Hostel Block 2 (Girls Residence)',
    code: 'HSTL-2',
    latitude: 37.4298,
    longitude: -122.1645,
    description: 'Undergraduate student residence block 2',
  },
  {
    id: 'bld-8',
    name: 'Sports Complex & Gymnasium',
    code: 'SPORTS',
    latitude: 37.4248,
    longitude: -122.1652,
    description: 'Indoor stadium, fitness center, squash courts',
  },
  {
    id: 'bld-9',
    name: 'Health & Wellness Center',
    code: 'CLINIC',
    latitude: 37.425,
    longitude: -122.168,
    description: 'Campus medical clinic and first aid center',
  },
];

export const CAMPUS_PRESETS: CampusPreset[] = [
  {
    id: 'bannari-amman',
    name: 'Bannari Amman Institute of Technology (BIT)',
    shortName: 'Bannari Amman College',
    latitude: 11.497,
    longitude: 77.2771,
    zoom: 16,
    description: 'Sathyamangalam campus, Main Academic Block, Tech Park, Mechanical & Civil Blocks, Hostels, Food Court.',
    buildings: [
      {
        id: 'bit-1',
        name: 'Main Administrative Block & Senate',
        code: 'BIT-ADMIN',
        latitude: 11.4972,
        longitude: 77.2768,
        description: 'Principal office, administrative departments, dean offices',
      },
      {
        id: 'bit-2',
        name: 'Special Lab & Computing Tech Park',
        code: 'BIT-TECH',
        latitude: 11.498,
        longitude: 77.2775,
        description: 'AI & Data Science cluster, Computer Science labs',
      },
      {
        id: 'bit-3',
        name: 'Mechanical & Automobile Complex',
        code: 'BIT-MECH',
        latitude: 11.4965,
        longitude: 77.278,
        description: 'Heavy machinery labs, Mechatronics and CAD centers',
      },
      {
        id: 'bit-4',
        name: 'Dr. Alagappa Chettiar Central Library',
        code: 'BIT-LIB',
        latitude: 11.4975,
        longitude: 77.2762,
        description: 'Digital research library, journals, reading halls',
      },
      {
        id: 'bit-5',
        name: 'Student Dining & Food Court',
        code: 'BIT-FOOD',
        latitude: 11.496,
        longitude: 77.2765,
        description: 'Campus cafeteria, student mess and food stalls',
      },
      {
        id: 'bit-6',
        name: 'Hostel Blocks & Residential Complex',
        code: 'BIT-HOSTEL',
        latitude: 11.4988,
        longitude: 77.2785,
        description: 'Student accommodation and residential dorms',
      },
      {
        id: 'bit-7',
        name: 'Sports Ground & Indoor Stadium',
        code: 'BIT-SPORTS',
        latitude: 11.4952,
        longitude: 77.2778,
        description: 'Cricket grounds, basketball courts, athletics pavilion',
      },
    ],
  },
  {
    id: 'kpr-college',
    name: 'KPR Institute of Engineering and Technology (KPRIET)',
    shortName: 'KPR College',
    latitude: 11.0827,
    longitude: 77.1396,
    zoom: 16,
    description: 'Arasur Coimbatore campus, Central Academic Block, Computing Hub, Hostels, Innovation labs.',
    buildings: [
      {
        id: 'kpr-1',
        name: 'KPR Central Administrative & Senate Block',
        code: 'KPR-MAIN',
        latitude: 11.0827,
        longitude: 77.1396,
        description: 'Principal office, admission and student records',
      },
      {
        id: 'kpr-2',
        name: 'Computing & AI Tech Block',
        code: 'KPR-IT',
        latitude: 11.0835,
        longitude: 77.1405,
        description: 'CSE & IT software labs, high-performance computing clusters',
      },
      {
        id: 'kpr-3',
        name: 'Mechanical & Robotics Block',
        code: 'KPR-MECH',
        latitude: 11.0818,
        longitude: 77.1402,
        description: 'Robotics labs, mechanical workshops and fabrication unit',
      },
      {
        id: 'kpr-4',
        name: 'Central Digital Library & Research Commons',
        code: 'KPR-LIB',
        latitude: 11.0822,
        longitude: 77.1388,
        description: 'Knowledge resource center, study rooms and digital library',
      },
      {
        id: 'kpr-5',
        name: 'Student Amenities & Dining Mess',
        code: 'KPR-DINING',
        latitude: 11.0812,
        longitude: 77.1392,
        description: 'Main food court and student mess dining',
      },
      {
        id: 'kpr-6',
        name: 'Hostel Blocks & Residential Quarters',
        code: 'KPR-HOSTEL',
        latitude: 11.0842,
        longitude: 77.1412,
        description: 'Student hostel blocks and warden offices',
      },
      {
        id: 'kpr-7',
        name: 'Sports Complex & Athletic Grounds',
        code: 'KPR-SPORTS',
        latitude: 11.0805,
        longitude: 77.1408,
        description: 'Track and field, sports pavilion and gym',
      },
    ],
  },
  {
    id: 'iit-tech',
    name: 'Indian Institute of Technology (IIT Campus)',
    shortName: 'IIT Tech Campus',
    latitude: 19.1334,
    longitude: 72.9133,
    zoom: 16,
    description: 'Main Building, Hostel cluster, SAC, Gymkhana, Lecture Hall Complex.',
    buildings: [
      { id: 'iit-1', name: 'Main Academic Building & Senate', code: 'IIT-MAIN', latitude: 19.1334, longitude: 72.9133, description: 'Administrative headquarters, director office, senate hall' },
      { id: 'iit-2', name: 'Lecture Hall Complex (LHC)', code: 'IIT-LHC', latitude: 19.1342, longitude: 72.9145, description: 'Auditoriums and smart lecture halls' },
      { id: 'iit-3', name: 'Computer Science Department', code: 'IIT-CSE', latitude: 19.1328, longitude: 72.9152, description: 'KReSIT building, AI/ML labs and computing clusters' },
      { id: 'iit-4', name: 'Central Library', code: 'IIT-LIB', latitude: 19.1321, longitude: 72.9125, description: 'Central research library and reading halls' },
      { id: 'iit-5', name: 'Students Activity Centre (SAC)', code: 'IIT-SAC', latitude: 19.1355, longitude: 72.9118, description: 'Student council, club rooms, indoor sports' },
      { id: 'iit-6', name: 'Hostel Complex & Dining Mess', code: 'IIT-HOSTEL', latitude: 19.1368, longitude: 72.9140, description: 'Undergraduate student residence and mess dining' },
      { id: 'iit-7', name: 'Campus Health Centre & Hospital', code: 'IIT-HOSP', latitude: 19.1315, longitude: 72.9142, description: '24/7 campus emergency and medical clinic' },
    ],
  },
  {
    id: 'stanford',
    name: 'University Main Campus (Stanford / Tech)',
    shortName: 'Main Campus',
    latitude: 37.4275,
    longitude: -122.1697,
    zoom: 16,
    description: 'Academic quad, engineering blocks, hostels, and sports stadium.',
    buildings: CAMPUS_BUILDINGS,
  },
  {
    id: 'mit-urban',
    name: 'MIT Urban Campus (Cambridge / Boston)',
    shortName: 'MIT Campus',
    latitude: 42.3601,
    longitude: -71.0942,
    zoom: 16,
    description: 'Great Dome, Infinite Corridor, Stata Center, Sloan.',
    buildings: [
      { id: 'mit-1', name: 'Building 10 (Great Dome)', code: 'DOME', latitude: 42.3598, longitude: -71.0919, description: 'Barker Engineering library, infinite corridor' },
      { id: 'mit-2', name: 'Stata Center (Building 32)', code: 'STATA', latitude: 42.3616, longitude: -71.0906, description: 'CSAIL, AI research, robotics labs' },
      { id: 'mit-3', name: 'Student Center (W20)', code: 'W20', latitude: 42.3588, longitude: -71.0948, description: 'Dining hall, student clubs, mail services' },
      { id: 'mit-4', name: 'Zesiger Sports & Fitness (W35)', code: 'W35', latitude: 42.3582, longitude: -71.0955, description: 'Olympic pool, gymnasium, squash courts' },
    ],
  },
];
