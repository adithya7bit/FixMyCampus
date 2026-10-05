/**
 * FixMyCampus - Interactive Campus Issue Reporting & GIS Map
 * Powered by Mapbox GL JS & Mapbox Geocoding API
 * Features: 3D Isometric View, Real-Time Heatmaps, Geocoding Autocomplete, Floor/Room Tracking & CSV Export
 */

(function () {
  'use strict';

  // --- Mapbox Access Token ---
  mapboxgl.accessToken = window.VITE_MAPBOX_TOKEN || '';

  // --- State Management ---
  const state = {
    currentCampus: 'bannari-amman',
    complaints: [],
    myFiledIds: [], // Track issues filed by user this session
    activePinpoint: null, // { lat, lng }
    pinModeActive: false,
    activeLayer: 'street',
    landmarksVisible: true,
    is3DView: false,
    heatmapActive: false,
    soundEnabled: true,
    filterCategory: 'all',
    filterStatus: 'all',
    searchQuery: '',
    sortBy: 'upvotes',
    selectedComplaintId: null,
    adminMode: false,
    canAccessAdmin: false,
    uploadedPhotoData: null,
    userLocation: null
  };

  // --- Mapbox Styles ---
  const MAP_STYLES = {
    street: 'mapbox://styles/mapbox/streets-v12',
    satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
    dark: 'mapbox://styles/mapbox/dark-v11'
  };

  // Sample photos for quick testing
  const SAMPLE_PHOTOS = [
    'https://images.unsplash.com/photo-1585672840546-d5eb3914a520?auto=format&fit=crop&w=600&q=80', // Plumbing
    'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=600&q=80', // Dark street light
    'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80', // Pothole/paver
    'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=600&q=80'  // Trash/Sanitation
  ];

  // Map & Marker Storage
  let mapInstance = null;
  let complaintMarkers = [];
  let landmarkMarkers = [];
  let newPinMarker = null;
  let userGpsMarker = null;
  let searchFoundMarker = null;
  let audioContext = null;

  // --- Initializer ---
  function init() {
    // Check URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const paramCampus = urlParams.get('campus');
    if (paramCampus && window.CAMPUS_PRESETS && window.CAMPUS_PRESETS[paramCampus]) {
      state.currentCampus = paramCampus;
    }
    const isAdminUser = urlParams.get('admin') === 'true';
    state.canAccessAdmin = isAdminUser;
    state.adminMode = isAdminUser;

    loadComplaintsFromStorage();
    initMap();
    updateStats();
    setupEventListeners();

    const toggleContainer = document.getElementById('adminToggleContainer');
    const toggle = document.getElementById('adminModeToggle');
    const adminPanel = document.getElementById('adminControlPanel');
    const officerBanner = document.getElementById('adminOfficerBanner');

    if (state.canAccessAdmin) {
      document.body.classList.add('admin-authorized');
      if (toggleContainer) toggleContainer.style.display = 'flex';
      if (toggle) {
        toggle.disabled = false;
        toggle.checked = state.adminMode;
      }
      if (state.adminMode) {
        document.body.classList.add('admin-mode-active');
        if (adminPanel) adminPanel.style.display = 'block';
        if (officerBanner) officerBanner.style.display = 'flex';
      }
    } else {
      document.body.classList.remove('admin-authorized', 'admin-mode-active');
      if (toggleContainer) toggleContainer.style.display = 'none';
      if (toggle) {
        toggle.checked = false;
        toggle.disabled = true;
      }
      if (adminPanel) adminPanel.style.display = 'none';
      if (officerBanner) officerBanner.style.display = 'none';
    }

    if (paramCampus) {
      const sel = document.getElementById('campusSelect');
      if (sel) sel.value = paramCampus;
    }

    const isPickOnly = urlParams.get('pickOnly') === 'true';
    state.pickOnlyMode = isPickOnly;
    if (isPickOnly) {
      document.body.classList.add('pick-only-mode');
      setTimeout(() => {
        activatePinMode();
      }, 400);
    }

    const initLat = parseFloat(urlParams.get('lat') || '');
    const initLng = parseFloat(urlParams.get('lng') || '');
    if (!isNaN(initLat) && !isNaN(initLng)) {
      setTimeout(() => {
        placeDraggablePin(initLat, initLng);
        if (mapInstance && typeof mapInstance.flyTo === 'function') {
          mapInstance.flyTo({ center: [initLng, initLat], zoom: 17.5 });
        }
      }, 700);
    }

    if (urlParams.get('startReport') === 'true' && !isPickOnly) {
      setTimeout(() => {
        openReportDrawer();
      }, 700);
    }

    // Listen for parent window messages
    window.addEventListener('message', function (e) {
      if (!e.data) return;
      if (e.data.action === 'switchCampus' && e.data.campus) {
        switchCampus(e.data.campus);
      }
      if (e.data.action === 'flyToLocation' && e.data.lat && e.data.lng) {
        placeDraggablePin(e.data.lat, e.data.lng);
        if (mapInstance && typeof mapInstance.flyTo === 'function') {
          mapInstance.flyTo({ center: [e.data.lng, e.data.lat], zoom: 18 });
        }
      }
      if (e.data.action === 'setPickOnlyMode') {
        state.pickOnlyMode = !!e.data.active;
        if (state.pickOnlyMode) {
          document.body.classList.add('pick-only-mode');
          activatePinMode();
        } else {
          document.body.classList.remove('pick-only-mode');
        }
      }
      if (e.data.action === 'toggleAdmin') {
        const isAdmin = !!e.data.admin;
        state.canAccessAdmin = isAdmin;
        state.adminMode = isAdmin;
        const currentToggleContainer = document.getElementById('adminToggleContainer');
        const currentToggle = document.getElementById('adminModeToggle');
        const currentAdminPanel = document.getElementById('adminControlPanel');
        const currentOfficerBanner = document.getElementById('adminOfficerBanner');

        if (isAdmin) {
          document.body.classList.add('admin-authorized', 'admin-mode-active');
          if (currentToggleContainer) currentToggleContainer.style.display = 'flex';
          if (currentToggle) {
            currentToggle.disabled = false;
            currentToggle.checked = true;
          }
          if (currentAdminPanel) currentAdminPanel.style.display = 'block';
          if (currentOfficerBanner) currentOfficerBanner.style.display = 'flex';
        } else {
          document.body.classList.remove('admin-authorized', 'admin-mode-active');
          if (currentToggleContainer) currentToggleContainer.style.display = 'none';
          if (currentToggle) {
            currentToggle.checked = false;
            currentToggle.disabled = true;
          }
          if (currentAdminPanel) currentAdminPanel.style.display = 'none';
          if (currentOfficerBanner) currentOfficerBanner.style.display = 'none';
        }
        renderComplaintMarkers();
        renderComplaintsList();
      }
      if (e.data.action === 'startReport' || e.data.action === 'openReport') {
        openReportDrawer();
      }
      if (e.data.action === 'syncComplaints' && Array.isArray(e.data.complaints)) {
        e.data.complaints.forEach(extC => {
          const idx = state.complaints.findIndex(c => c.id === extC.id || c.title === extC.title);
          if (idx >= 0) {
            state.complaints[idx] = { ...state.complaints[idx], ...extC };
          } else {
            state.complaints.unshift(extC);
          }
        });
        saveComplaintsToStorage();
        renderComplaintMarkers();
        renderComplaintsList();
        updateStats();
      }
    });

    refreshIcons();
  }

  // --- Web Audio Synthesizer (Micro-interactions) ---
  function playAudio(type) {
    if (!state.soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioContext) audioContext = new AudioCtx();
      if (audioContext.state === 'suspended') audioContext.resume();

      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.connect(gain);
      gain.connect(audioContext.destination);

      const now = audioContext.currentTime;

      if (type === 'pin') {
        osc.frequency.setValueAtTime(420, now);
        osc.frequency.exponentialRampToValueAtTime(780, now + 0.08);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'upvote') {
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'success') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(554.37, now + 0.08); // C#
        osc.frequency.setValueAtTime(659.25, now + 0.16); // E
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      }
    } catch (e) {
      // Audio not permitted or supported
    }
  }

  // --- LocalStorage Handling ---
  function loadComplaintsFromStorage() {
    try {
      const saved = localStorage.getItem('fixmycampus_reports');
      if (saved) {
        state.complaints = JSON.parse(saved);
        // Remove legacy sample complaints from removed colleges
        state.complaints = state.complaints.filter(c => !c.id.startsWith('FMC-10'));
        // Ensure BIT and KPR complaints exist
        if (window.INITIAL_COMPLAINTS) {
          window.INITIAL_COMPLAINTS.forEach(initC => {
            if (!state.complaints.some(c => c.id === initC.id)) {
              state.complaints.push(initC);
            }
          });
        }
        saveComplaintsToStorage();
      } else {
        state.complaints = [...window.INITIAL_COMPLAINTS];
        saveComplaintsToStorage();
      }
      const mySaved = localStorage.getItem('fixmycampus_my_ids');
      if (mySaved) {
        state.myFiledIds = JSON.parse(mySaved);
      }
    } catch (e) {
      console.warn('Could not read from localStorage, using default campus data', e);
      state.complaints = [...window.INITIAL_COMPLAINTS];
    }
  }

  function saveComplaintsToStorage() {
    try {
      localStorage.setItem('fixmycampus_reports', JSON.stringify(state.complaints));
      localStorage.setItem('fixmycampus_my_ids', JSON.stringify(state.myFiledIds));
    } catch (e) {
      console.warn('Could not save to localStorage', e);
    }
  }

  // --- Mapbox GL Map Initialization ---
  function initMap() {
    const campusConfig = window.CAMPUS_PRESETS[state.currentCampus];
    const initialCenter = [campusConfig.center[1], campusConfig.center[0]];

    mapInstance = new mapboxgl.Map({
      container: 'map',
      style: MAP_STYLES[state.activeLayer],
      center: initialCenter,
      zoom: campusConfig.zoom,
      pitch: 0,
      bearing: 0,
      antialias: true
    });

    // Add Navigation controls
    mapInstance.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'bottom-right');

    mapInstance.on('load', function () {
      add3DBuildingsLayer();
      setupHeatmapSourceAndLayer();
      renderComplaintMarkers();
    });

    mapInstance.on('style.load', function () {
      add3DBuildingsLayer();
      setupHeatmapSourceAndLayer();
      renderComplaintMarkers();
    });

    // Map Click Interaction for dropping a pin
    mapInstance.on('click', function (e) {
      if (e.originalEvent.target.closest('.custom-campus-pin') ||
          e.originalEvent.target.closest('.mapboxgl-popup')) {
        return;
      }
      onMapClicked(e.lngLat);
    });
  }

  // --- 3D Extrusion Buildings Layer ---
  function add3DBuildingsLayer() {
    try {
      const layers = mapInstance.getStyle().layers;
      const labelLayerId = layers.find(
        layer => layer.type === 'symbol' && layer.layout && layer.layout['text-field']
      )?.id;

      if (!mapInstance.getLayer('add-3d-buildings') && mapInstance.getSource('composite')) {
        mapInstance.addLayer(
          {
            id: 'add-3d-buildings',
            source: 'composite',
            'source-layer': 'building',
            filter: ['==', 'extrude', 'true'],
            type: 'fill-extrusion',
            minzoom: 15,
            paint: {
              'fill-extrusion-color': '#cbd5e1',
              'fill-extrusion-height': [
                'interpolate',
                ['linear'],
                ['zoom'],
                15,
                0,
                15.05,
                ['get', 'height']
              ],
              'fill-extrusion-base': [
                'interpolate',
                ['linear'],
                ['zoom'],
                15,
                0,
                15.05,
                ['get', 'min_height']
              ],
              'fill-extrusion-opacity': 0.65
            }
          },
          labelLayerId
        );
      }
    } catch (err) {
      console.log('3D layer setup skipped', err);
    }
  }

  // --- Hotspots / Heatmap Layer ---
  function setupHeatmapSourceAndLayer() {
    try {
      const geojson = getComplaintsGeoJSON();

      if (!mapInstance.getSource('campus-complaints-source')) {
        mapInstance.addSource('campus-complaints-source', {
          type: 'geojson',
          data: geojson
        });
      } else {
        mapInstance.getSource('campus-complaints-source').setData(geojson);
      }

      if (!mapInstance.getLayer('campus-heatmap-layer')) {
        mapInstance.addLayer({
          id: 'campus-heatmap-layer',
          type: 'heatmap',
          source: 'campus-complaints-source',
          layout: {
            visibility: state.heatmapActive ? 'visible' : 'none'
          },
          paint: {
            // Increase weight based on upvotes and urgency
            'heatmap-weight': [
              'interpolate',
              ['linear'],
              ['get', 'weight'],
              1, 0.4,
              10, 1
            ],
            // Increase intensity as zoom increases
            'heatmap-intensity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              14, 1,
              18, 3
            ],
            // Color ramp: cool blue to fiery red
            'heatmap-color': [
              'interpolate',
              ['linear'],
              ['heatmap-density'],
              0, 'rgba(33, 102, 172, 0)',
              0.2, 'rgb(103, 169, 207)',
              0.4, 'rgb(209, 229, 240)',
              0.6, 'rgb(253, 219, 199)',
              0.8, 'rgb(239, 138, 98)',
              1, 'rgb(178, 24, 43)'
            ],
            'heatmap-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              14, 20,
              18, 45
            ],
            'heatmap-opacity': 0.85
          }
        });
      }
    } catch (err) {
      console.warn('Heatmap setup:', err);
    }
  }

  function getComplaintsGeoJSON() {
    return {
      type: 'FeatureCollection',
      features: state.complaints.map(c => {
        let weight = 1;
        if (c.urgency === 'urgent') weight = 8;
        else if (c.urgency === 'high') weight = 5;
        weight += Math.min(5, Math.floor((c.upvotes || 0) / 10));

        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [c.lng, c.lat]
          },
          properties: {
            id: c.id,
            category: c.category,
            status: c.status,
            weight: weight
          }
        };
      })
    };
  }

  function toggleHeatmap() {
    state.heatmapActive = !state.heatmapActive;
    const btn = document.getElementById('toggleHeatmapBtn');
    btn.classList.toggle('active', state.heatmapActive);

    if (mapInstance.getLayer('campus-heatmap-layer')) {
      mapInstance.setLayoutProperty(
        'campus-heatmap-layer',
        'visibility',
        state.heatmapActive ? 'visible' : 'none'
      );
    }

    if (state.heatmapActive) {
      showToast('Hotspot Heatmap Enabled', 'Displaying concentrated problem zones across campus.');
      playAudio('pin');
    } else {
      showToast('Standard View', 'Heatmap layer hidden.');
    }
  }

  function setMapLayer(layerKey) {
    if (!MAP_STYLES[layerKey]) return;
    state.activeLayer = layerKey;
    mapInstance.setStyle(MAP_STYLES[layerKey]);

    document.querySelectorAll('.dock-btn[id^="layer"]').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`layer${capitalize(layerKey)}`);
    if (activeBtn) activeBtn.classList.add('active');
  }

  function toggle3DView() {
    state.is3DView = !state.is3DView;
    const btn = document.getElementById('toggle3DBtn');
    btn.classList.toggle('active', state.is3DView);

    mapInstance.easeTo({
      pitch: state.is3DView ? 60 : 0,
      bearing: state.is3DView ? -25 : 0,
      duration: 1200
    });

    if (state.is3DView) {
      showToast('3D Campus View', 'Tilted map with 3D buildings enabled.');
      playAudio('pin');
    }
  }

  // --- Landmark Buildings Rendering ---
  // --- Complaint Markers Rendering ---
  function renderComplaintMarkers() {
    complaintMarkers.forEach(m => m.remove());
    complaintMarkers = [];

    const filtered = getFilteredComplaints();

    // Update GeoJSON source for heatmap
    if (mapInstance && mapInstance.getSource('campus-complaints-source')) {
      mapInstance.getSource('campus-complaints-source').setData(getComplaintsGeoJSON());
    }

    filtered.forEach(c => {
      const catConfig = window.CATEGORIES_CONFIG[c.category] || {
        color: '#2563eb',
        icon: 'alert-circle',
        label: 'General',
        bgColor: '#eff6ff',
        border: '#bfdbfe'
      };

      const isUrgent = c.urgency === 'urgent' || c.urgency === 'high';
      const statusClass = `status-${c.status} ${isUrgent ? 'urgent-hazard' : ''}`;

      const el = document.createElement('div');
      el.className = 'custom-campus-pin';
      el.innerHTML = `
        <div class="pin-bubble" style="background-color: ${catConfig.color};">
          <i data-lucide="${catConfig.icon}"></i>
          <span class="pin-status-badge ${statusClass}"></span>
        </div>
      `;

      const floorLabel = c.floor ? ` • ${c.floor}` : '';

      let adminPopupBar = '';
      if (state.adminMode) {
        adminPopupBar = `
          <div class="admin-quick-popup-bar">
            <span class="admin-bar-title"><i data-lucide="shield-check" style="width:10px;height:10px;display:inline;"></i> Officer Quick Action:</span>
            <div class="admin-popup-btns">
              <button class="btn-admin-quick in-progress" onclick="window.quickUpdateStatus('${c.id}', 'in-progress')" title="Mark In-Progress">
                <i data-lucide="clock"></i> Active
              </button>
              <button class="btn-admin-quick resolve" onclick="window.quickUpdateStatus('${c.id}', 'resolved')" title="Mark Resolved">
                <i data-lucide="check-circle-2"></i> Fix
              </button>
              <button class="btn-admin-quick delete" onclick="window.deleteComplaint('${c.id}')" title="Delete Complaint">
                <i data-lucide="trash-2"></i>
              </button>
            </div>
          </div>
        `;
      }

      const popupHtml = `
        <div class="map-popup-card">
          <div class="popup-category-bar">
            <span class="popup-tag" style="background:${catConfig.bgColor}; color:${catConfig.color}; border: 1px solid ${catConfig.border};">
              ${escapeHtml(catConfig.label)}
            </span>
            <span class="status-pill ${c.status}" style="font-size:10px; padding:2px 6px;">${formatStatus(c.status)}</span>
          </div>
          <div class="popup-title">${escapeHtml(c.title)}</div>
          <div class="popup-meta">
            <i data-lucide="map-pin"></i>
            <span>${escapeHtml(c.locationName || c.nearestBuilding || 'Campus Grounds')}${escapeHtml(floorLabel)}</span>
          </div>
          <div class="popup-footer">
            <span style="font-size:11px; font-weight:700; color:#2563eb;">👍 ${c.upvotes || 0} Upvotes</span>
            <button class="popup-view-btn" onclick="window.viewComplaintDetails('${c.id}')">View Details</button>
          </div>
          ${adminPopupBar}
        </div>
      `;

      const popup = new mapboxgl.Popup({ offset: 25, closeButton: true })
        .setHTML(popupHtml);

      const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
        .setLngLat([c.lng, c.lat])
        .setPopup(popup)
        .addTo(mapInstance);

      el.addEventListener('click', () => {
        highlightActiveCardInList(c.id);
        playAudio('pin');
      });

      complaintMarkers.push(marker);
    });

    renderComplaintsList();
    updateStats();
    refreshIcons();
  }

  // --- Filtering & Searching Logic ---
  function getFilteredComplaints() {
    let list = state.complaints.filter(c => {
      // Category filter
      if (state.filterCategory === 'my-reports') {
        if (!state.myFiledIds.includes(c.id) && !c.hasUpvoted) return false;
      } else if (state.filterCategory === 'top-upvoted') {
        // Will be sorted below
      } else if (state.filterCategory !== 'all' && c.category !== state.filterCategory) {
        return false;
      }

      // Status filter
      if (state.filterStatus !== 'all' && c.status !== state.filterStatus) {
        return false;
      }

      // Search Query filter
      if (state.searchQuery) {
        const q = state.searchQuery.toLowerCase();
        const titleMatch = c.title.toLowerCase().includes(q);
        const descMatch = c.description.toLowerCase().includes(q);
        const locMatch = (c.locationName || '').toLowerCase().includes(q);
        const bldgMatch = (c.nearestBuilding || '').toLowerCase().includes(q);
        const idMatch = (c.id || '').toLowerCase().includes(q);
        if (!titleMatch && !descMatch && !locMatch && !bldgMatch && !idMatch) {
          return false;
        }
      }
      return true;
    });

    if (state.filterCategory === 'top-upvoted') {
      list.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
    }

    return list;
  }

  // --- Autocomplete Suggestions for Search ---
  function updateSearchAutocomplete(query) {
    const dropdown = document.getElementById('searchAutocomplete');
    if (!dropdown) return;

    if (!query || query.length < 2) {
      dropdown.style.display = 'none';
      dropdown.innerHTML = '';
      return;
    }

    const q = query.toLowerCase();
    const campus = window.CAMPUS_PRESETS[state.currentCampus];
    const results = [];

    // 1. Search campus buildings
    if (campus && campus.buildings) {
      campus.buildings.forEach(b => {
        if (b.name.toLowerCase().includes(q) || b.zone.toLowerCase().includes(q)) {
          results.push({
            type: 'landmark',
            name: b.name,
            sub: `Campus Landmark • ${b.zone}`,
            coords: [b.coords[1], b.coords[0]], // [lng, lat]
            icon: b.icon || 'landmark'
          });
        }
      });
    }

    // 2. Search existing complaints
    state.complaints.forEach(c => {
      if (c.title.toLowerCase().includes(q) || (c.nearestBuilding && c.nearestBuilding.toLowerCase().includes(q))) {
        results.push({
          type: 'issue',
          name: c.title,
          sub: `Ticket ${c.id} • ${c.nearestBuilding || 'Campus'}`,
          coords: [c.lng, c.lat],
          id: c.id,
          icon: 'alert-circle'
        });
      }
    });

    if (results.length === 0) {
      dropdown.style.display = 'none';
      return;
    }

    dropdown.innerHTML = results.slice(0, 5).map(res => `
      <div class="autocomplete-item" data-coords="${res.coords.join(',')}" data-id="${res.id || ''}" data-type="${res.type}">
        <div class="autocomplete-icon">
          <i data-lucide="${res.icon}"></i>
        </div>
        <div class="autocomplete-info">
          <div class="autocomplete-name">${escapeHtml(res.name)}</div>
          <div class="autocomplete-sub">${escapeHtml(res.sub)}</div>
        </div>
        <span class="autocomplete-badge">${res.type === 'landmark' ? 'Building' : 'Issue'}</span>
      </div>
    `).join('');

    dropdown.style.display = 'flex';
    refreshIcons();

    dropdown.querySelectorAll('.autocomplete-item').forEach(item => {
      item.addEventListener('click', function () {
        const coords = this.dataset.coords.split(',').map(Number);
        const issueId = this.dataset.id;

        dropdown.style.display = 'none';

        mapInstance.flyTo({
          center: coords,
          zoom: 18,
          duration: 1400,
          essential: true
        });

        if (issueId) {
          window.viewComplaintDetails(issueId);
        } else {
          showToast('Navigated', `Centered on selected building.`);
        }
      });
    });
  }

  // --- Location Search & Geocoding ("Go to Location") ---
  async function executeLocationSearch(explicitQuery) {
    const searchInput = document.getElementById('searchInput');
    const q = (explicitQuery || searchInput.value).trim();
    if (!q) {
      showToast('Search Location', 'Please enter a location, campus building, or city to find.');
      searchInput.focus();
      return;
    }

    const searchBtn = document.getElementById('searchLocationBtn');
    if (searchBtn) {
      searchBtn.innerHTML = '<i data-lucide="loader"></i>';
      refreshIcons();
    }

    const qLower = q.toLowerCase();
    const campus = window.CAMPUS_PRESETS[state.currentCampus];

    // 1. Check if it matches a preset campus building
    if (campus && campus.buildings) {
      const match = campus.buildings.find(b =>
        b.name.toLowerCase().includes(qLower) || (b.zone && b.zone.toLowerCase().includes(qLower))
      );
      if (match) {
        navigateToCoords([match.coords[1], match.coords[0]], match.name, 18);
        resetSearchBtn();
        return;
      }
    }

    // 2. Check if it matches any college campus in CAMPUS_PRESETS
    for (const [key, preset] of Object.entries(window.CAMPUS_PRESETS)) {
      if (preset.name.toLowerCase().includes(qLower) || key.includes(qLower)) {
        switchCampus(key);
        const campusSelect = document.getElementById('campusSelect');
        if (campusSelect) campusSelect.value = key;
        showToast('Campus Switched', `Navigated to ${preset.name}`);
        resetSearchBtn();
        return;
      }
    }

    // 3. Check if it matches an existing registered complaint
    const matchedComplaint = state.complaints.find(c =>
      c.title.toLowerCase().includes(qLower) ||
      (c.locationName && c.locationName.toLowerCase().includes(qLower)) ||
      (c.nearestBuilding && c.nearestBuilding.toLowerCase().includes(qLower)) ||
      c.id.toLowerCase() === qLower
    );
    if (matchedComplaint) {
      navigateToCoords([matchedComplaint.lng, matchedComplaint.lat], matchedComplaint.title, 18);
      openDetailDrawer(matchedComplaint);
      resetSearchBtn();
      return;
    }

    // 4. Mapbox Forward Geocoding API (Any real-world address, street, city, or landmark)
    try {
      const center = mapInstance.getCenter();
      const proximity = `${center.lng},${center.lat}`;
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?access_token=${mapboxgl.accessToken}&proximity=${proximity}&limit=1`;
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.features && data.features.length > 0) {
          const feature = data.features[0];
          const [lng, lat] = feature.center;
          navigateToCoords([lng, lat], feature.place_name, 17);
          resetSearchBtn();
          return;
        }
      }
    } catch (err) {
      console.warn('Mapbox Geocoding lookup error:', err);
    }

    resetSearchBtn();
    showToast('Location Not Found', `Could not find "${q}". Try a landmark, city, or block name.`);
  }

  function resetSearchBtn() {
    const searchBtn = document.getElementById('searchLocationBtn');
    if (searchBtn) {
      searchBtn.innerHTML = '<i data-lucide="arrow-right"></i> <span>Search</span>';
      refreshIcons();
    }
  }

  function navigateToCoords(coords, label, zoom = 18) {
    const dropdown = document.getElementById('searchAutocomplete');
    if (dropdown) dropdown.style.display = 'none';

    mapInstance.flyTo({
      center: coords,
      zoom: zoom,
      duration: 1600,
      essential: true
    });

    dropTemporaryLocationHighlight(coords[1], coords[0], label);
    playAudio('pin');
  }

  function dropTemporaryLocationHighlight(lat, lng, label) {
    if (searchFoundMarker) {
      searchFoundMarker.remove();
      searchFoundMarker = null;
    }

    const el = document.createElement('div');
    el.className = 'search-found-marker';
    el.innerHTML = `
      <div class="search-found-ripple"></div>
      <div class="search-found-pin">
        <i data-lucide="map-pin" style="width:20px;height:20px;"></i>
      </div>
    `;

    const cleanLabel = label.replace(/'/g, "\\'");
    const popup = new mapboxgl.Popup({ offset: 25, closeButton: true })
      .setHTML(`
        <div style="font-weight:700;font-size:13px;color:#0f172a;margin-bottom:4px;">📍 ${escapeHtml(label)}</div>
        <div style="font-size:11px;color:#64748b;margin-bottom:8px;">Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}</div>
        <button class="btn btn-primary btn-sm" style="font-size:11px;padding:4px 8px;width:100%;cursor:pointer;" onclick="window.reportIssueAtLocation(${lat}, ${lng}, '${escapeHtml(cleanLabel)}')">
          <i data-lucide="plus-circle" style="width:12px;height:12px;"></i> Report Issue Here
        </button>
      `);

    searchFoundMarker = new mapboxgl.Marker({ element: el, anchor: 'center' })
      .setLngLat([lng, lat])
      .setPopup(popup)
      .addTo(mapInstance);

    searchFoundMarker.togglePopup();
    refreshIcons();
  }

  window.reportIssueAtLocation = function (lat, lng, label) {
    if (searchFoundMarker) {
      searchFoundMarker.remove();
      searchFoundMarker = null;
    }
    placeDraggablePin(lat, lng);
    openReportDrawer();
    const nearestInput = document.getElementById('nearestBuildingInput');
    if (nearestInput) nearestInput.value = label.split(',')[0];
  };

  // --- Pinpoint Dropping Workflow ---
  function activatePinMode() {
    state.pinModeActive = true;
    const banner = document.getElementById('pinModeBanner');
    if (banner) banner.classList.add('active');
    if (mapInstance && mapInstance.getCanvas()) {
      mapInstance.getCanvas().style.cursor = 'crosshair';
    }

    if (!state.activePinpoint && mapInstance && typeof mapInstance.getCenter === 'function') {
      try {
        const center = mapInstance.getCenter();
        if (center) {
          placeDraggablePin(center.lat, center.lng);
        }
      } catch (err) {}
    }
  }

  function deactivatePinMode() {
    state.pinModeActive = false;
    const banner = document.getElementById('pinModeBanner');
    if (banner) banner.classList.remove('active');
    if (mapInstance && mapInstance.getCanvas()) {
      mapInstance.getCanvas().style.cursor = '';
    }
  }

  function onMapClicked(lngLat) {
    placeDraggablePin(lngLat.lat, lngLat.lng);
    if (!state.pickOnlyMode) {
      openReportDrawer();
    }
    playAudio('pin');
    if (window.parent && window.parent !== window) {
      const nearest = findNearestCampusBuilding(lngLat.lat, lngLat.lng);
      window.parent.postMessage({
        action: 'locationPicked',
        lat: lngLat.lat,
        lng: lngLat.lng,
        building: nearest ? nearest.name : 'Campus Area'
      }, '*');
    }
  }

  function placeDraggablePin(lat, lng) {
    state.activePinpoint = { lat, lng };

    if (newPinMarker) {
      newPinMarker.remove();
    }

    const el = document.createElement('div');
    el.className = 'new-pin-pulse-container';
    el.innerHTML = `
      <div class="new-pin-ring"></div>
      <div class="new-pin-marker">
        <i data-lucide="map-pin" style="width:20px;height:20px;"></i>
      </div>
    `;

    newPinMarker = new mapboxgl.Marker({
      element: el,
      draggable: true,
      anchor: 'center'
    })
      .setLngLat([lng, lat])
      .addTo(mapInstance);

    newPinMarker.on('dragend', function () {
      const pos = newPinMarker.getLngLat();
      state.activePinpoint = { lat: pos.lat, lng: pos.lng };
      updateFormLocationDetails(pos.lat, pos.lng);
      playAudio('pin');
      if (window.parent && window.parent !== window) {
        const nearest = findNearestCampusBuilding(pos.lat, pos.lng);
        window.parent.postMessage({
          action: 'locationPicked',
          lat: pos.lat,
          lng: pos.lng,
          building: nearest ? nearest.name : 'Campus Area'
        }, '*');
      }
    });

    updateFormLocationDetails(lat, lng);
    refreshIcons();
  }

  // Auto-detect and reverse-geocode using Mapbox Places API + local campus calculation
  async function updateFormLocationDetails(lat, lng) {
    const latFormatted = lat.toFixed(5);
    const lngFormatted = lng.toFixed(5);

    const coordEl = document.getElementById('coordDisplay');
    if (coordEl) {
      coordEl.innerHTML = `<i data-lucide="map-pin"></i> <span>Lat: ${latFormatted}, Lng: ${lngFormatted}</span>`;
      refreshIcons();
    }

    const nearest = findNearestCampusBuilding(lat, lng);
    const nearestInput = document.getElementById('nearestBuildingInput');
    
    if (nearest) {
      nearestInput.value = nearest.name;
    } else {
      nearestInput.placeholder = 'Fetching Mapbox reverse geocode...';
      const placeName = await reverseGeocodeMapbox(lng, lat);
      if (placeName) {
        nearestInput.value = placeName.split(',')[0];
      } else {
        nearestInput.value = 'Campus Grounds';
      }
    }
  }

  async function reverseGeocodeMapbox(lng, lat) {
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}&limit=1`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.features && data.features.length > 0) {
          return data.features[0].place_name;
        }
      }
    } catch (e) {
      console.warn('Mapbox reverse geocode lookup failed:', e);
    }
    return null;
  }

  function findNearestCampusBuilding(lat, lng) {
    const campus = window.CAMPUS_PRESETS[state.currentCampus];
    if (!campus || !campus.buildings || campus.buildings.length === 0) return null;

    let nearest = null;
    let minDistance = 250;

    campus.buildings.forEach(b => {
      const dist = getDistanceInMeters(lat, lng, b.coords[0], b.coords[1]);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = b;
      }
    });

    return nearest;
  }

  function getDistanceInMeters(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  // --- Drawer Management ---
  function openReportDrawer() {
    closeAllDrawers();
    const drawer = document.getElementById('reportDrawer');
    if (drawer) drawer.classList.add('open');
    if (mapInstance && mapInstance.loaded()) {
      activatePinMode();
    } else if (mapInstance) {
      mapInstance.once('load', () => activatePinMode());
    } else {
      setTimeout(activatePinMode, 500);
    }
  }

  function closeReportDrawer() {
    const drawer = document.getElementById('reportDrawer');
    if (drawer) drawer.classList.remove('open');
    deactivatePinMode();
    if (newPinMarker) {
      newPinMarker.remove();
      newPinMarker = null;
    }
  }

  function openDetailDrawer(complaint) {
    closeAllDrawers();
    state.selectedComplaintId = complaint.id;

    document.getElementById('detailTicketId').textContent = complaint.id;
    document.getElementById('detailTitle').textContent = complaint.title;

    const statusBadge = document.getElementById('detailStatusBadge');
    statusBadge.className = `status-pill ${complaint.status}`;
    statusBadge.textContent = formatStatus(complaint.status);

    const catConfig = window.CATEGORIES_CONFIG[complaint.category] || { label: 'General' };
    document.getElementById('detailCategory').textContent = catConfig.label;

    document.getElementById('detailLocation').textContent =
      complaint.locationName ? `${complaint.locationName} (${complaint.nearestBuilding || ''})` : (complaint.nearestBuilding || 'Campus Grounds');

    const detailFloorEl = document.getElementById('detailFloor');
    if (detailFloorEl) {
      detailFloorEl.textContent = complaint.floor ? `${complaint.floor}${complaint.room ? ' • ' + complaint.room : ''}` : 'Ground Floor';
    }

    document.getElementById('detailReporter').textContent =
      complaint.anonymous ? 'Anonymous Student' : `${complaint.reporterName || 'Student'} (${complaint.rollNumber || 'ID Verified'})`;

    document.getElementById('detailDate').textContent = formatDate(complaint.timestamp);
    document.getElementById('detailDescription').textContent = complaint.description;

    // Urgency tag
    const urgencyEl = document.getElementById('detailUrgencyTag');
    urgencyEl.className = `urgency-tag urgent-${complaint.urgency}`;
    urgencyEl.textContent = `${capitalize(complaint.urgency)} Priority`;

    // Upvote Button
    const upvoteBtn = document.getElementById('detailUpvoteBtn');
    const upvoteCount = document.getElementById('detailUpvoteCount');
    upvoteCount.textContent = complaint.upvotes || 0;
    if (complaint.hasUpvoted) {
      upvoteBtn.classList.add('upvoted');
    } else {
      upvoteBtn.classList.remove('upvoted');
    }

    // Photo Box
    const photoContainer = document.getElementById('detailPhotoContainer');
    const photoEl = document.getElementById('detailPhoto');
    if (complaint.photos && complaint.photos.length > 0) {
      photoEl.src = complaint.photos[0];
      photoContainer.style.display = 'block';
    } else {
      photoContainer.style.display = 'none';
    }

    // Timeline Rendering
    renderTimeline(complaint.timeline || []);

    // Admin Control Panel
    const adminPanel = document.getElementById('adminControlPanel');
    if (state.adminMode) {
      adminPanel.style.display = 'block';
    } else {
      adminPanel.style.display = 'none';
    }

    document.getElementById('detailDrawer').classList.add('open');
    refreshIcons();
  }

  function closeDetailDrawer() {
    document.getElementById('detailDrawer').classList.remove('open');
    state.selectedComplaintId = null;
  }

  function openListDrawer() {
    closeAllDrawers();
    document.getElementById('listDrawer').classList.add('open');
    renderComplaintsList();
  }

  function closeListDrawer() {
    document.getElementById('listDrawer').classList.remove('open');
  }

  function closeAllDrawers() {
    document.querySelectorAll('.side-drawer').forEach(d => d.classList.remove('open'));
    const dropdown = document.getElementById('searchAutocomplete');
    if (dropdown) dropdown.style.display = 'none';
  }

  // --- Timeline Rendering ---
  function renderTimeline(timelineItems) {
    const container = document.getElementById('detailTimeline');
    if (!container) return;

    if (!timelineItems || timelineItems.length === 0) {
      container.innerHTML = '<p style="color:#94a3b8;font-size:12px;">No activity logged yet.</p>';
      return;
    }

    container.innerHTML = timelineItems.map((item, idx) => {
      const isLatest = idx === timelineItems.length - 1;
      return `
        <div class="timeline-step ${isLatest ? 'completed' : ''}">
          <div class="timeline-dot"></div>
          <div class="timeline-title">${escapeHtml(item.title)}</div>
          <div class="timeline-time">${escapeHtml(item.time)}</div>
          <div class="timeline-desc">${escapeHtml(item.desc)}</div>
        </div>
      `;
    }).join('');
  }

  // --- Complaints Ledger List Drawer Rendering ---
  function renderComplaintsList() {
    const container = document.getElementById('complaintsList');
    if (!container) return;

    let items = getFilteredComplaints();

    if (state.sortBy === 'upvotes') {
      items.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
    } else if (state.sortBy === 'newest') {
      items.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } else if (state.sortBy === 'status') {
      items.sort((a, b) => a.status.localeCompare(b.status));
    }

    document.getElementById('filteredCount').textContent = items.length;
    document.getElementById('dockIssueCount').textContent = items.length;

    if (items.length === 0) {
      container.innerHTML = `
        <div style="padding: 30px 20px; text-align: center; color: #64748b;">
          <i data-lucide="check-circle-2" style="width:36px;height:36px;color:#10b981;margin-bottom:8px;"></i>
          <p style="font-weight:700;font-size:14px;color:#0f172a;">No complaints match this filter</p>
          <span style="font-size:12px;">Try selecting another category or clearing your search.</span>
        </div>
      `;
      refreshIcons();
      return;
    }

    container.innerHTML = items.map(c => {
      const catConfig = window.CATEGORIES_CONFIG[c.category] || { label: 'General', color: '#2563eb', bgColor: '#eff6ff' };
      const isActive = state.selectedComplaintId === c.id ? 'active' : '';

      return `
        <div class="complaint-card-item ${isActive}" data-id="${c.id}" onclick="window.viewComplaintDetails('${c.id}')">
          <div class="card-top-row">
            <span class="card-category-chip" style="background:${catConfig.bgColor}; color:${catConfig.color};">
              <i data-lucide="${catConfig.icon}"></i>
              ${escapeHtml(catConfig.label)}
            </span>
            <span class="status-pill ${c.status}">${formatStatus(c.status)}</span>
          </div>
          <div class="card-title">${escapeHtml(c.title)}</div>
          <div class="card-location">
            <i data-lucide="map-pin"></i>
            <span>${escapeHtml(c.nearestBuilding || c.locationName || 'Campus')} ${c.floor ? '• ' + escapeHtml(c.floor) : ''}</span>
          </div>
          <div class="card-bottom-row">
            <span class="card-upvotes"><i data-lucide="thumbs-up"></i> ${c.upvotes || 0} Upvotes</span>
            <span style="color:#94a3b8;font-family:var(--font-mono);">${c.id}</span>
          </div>
          ${state.adminMode ? `
            <div class="card-admin-actions" onclick="event.stopPropagation()">
              <button class="btn-admin-quick in-progress" onclick="window.quickUpdateStatus('${c.id}', 'in-progress')" title="Mark In Progress">
                <i data-lucide="clock"></i> Active
              </button>
              <button class="btn-admin-quick resolve" onclick="window.quickUpdateStatus('${c.id}', 'resolved')" title="Mark Resolved">
                <i data-lucide="check-circle-2"></i> Resolve
              </button>
              <button class="btn-admin-quick delete" onclick="window.deleteComplaint('${c.id}')" title="Delete">
                <i data-lucide="trash-2"></i>
              </button>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    refreshIcons();
  }

  function highlightActiveCardInList(id) {
    document.querySelectorAll('.complaint-card-item').forEach(card => {
      if (card.dataset.id === id) {
        card.classList.add('active');
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        card.classList.remove('active');
      }
    });
  }

  // --- Form Submission ---
  function handleComplaintSubmit(e) {
    e.preventDefault();

    if (!state.activePinpoint) {
      alert('Please click on the campus map to place the accurate location pin first.');
      return;
    }

    const title = document.getElementById('complaintTitle').value.trim();
    const description = document.getElementById('complaintDesc').value.trim();
    const category = document.getElementById('selectedCategory').value;
    const urgency = document.querySelector('input[name="urgency"]:checked').value;
    const nearestBuilding = document.getElementById('nearestBuildingInput').value.trim();
    const locationSpecifics = document.getElementById('locationSpecifics').value.trim();
    const floor = document.getElementById('floorSelect') ? document.getElementById('floorSelect').value : 'Ground Floor';
    const room = document.getElementById('roomNumberInput') ? document.getElementById('roomNumberInput').value.trim() : '';
    const isAnonymous = document.getElementById('anonymousCheckbox').checked;

    const reporterName = isAnonymous ? 'Anonymous' : document.getElementById('reporterName').value.trim();
    const rollNumber = isAnonymous ? '' : document.getElementById('rollNumber').value.trim();
    const department = isAnonymous ? '' : document.getElementById('department').value.trim();

    if (!isAnonymous && (!reporterName || !rollNumber)) {
      alert('Please provide your name and student ID or check "Submit Anonymously".');
      return;
    }

    const ticketId = 'FMC-' + Math.floor(1000 + Math.random() * 9000);

    const now = new Date();
    const timeFormatted = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' • ' + now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    const newReport = {
      id: ticketId,
      title: title,
      category: category,
      urgency: urgency,
      status: 'reported',
      lat: state.activePinpoint.lat,
      lng: state.activePinpoint.lng,
      locationName: locationSpecifics,
      nearestBuilding: nearestBuilding,
      floor: floor,
      room: room,
      description: description,
      reporterName: reporterName,
      rollNumber: rollNumber,
      department: department,
      anonymous: isAnonymous,
      timestamp: now.toISOString(),
      upvotes: 1,
      hasUpvoted: true,
      photos: state.uploadedPhotoData ? [state.uploadedPhotoData] : [],
      timeline: [
        {
          title: 'Complaint Logged with GPS Pinpoint',
          time: timeFormatted,
          desc: `Issue filed with ${urgency.toUpperCase()} urgency at coordinates (${state.activePinpoint.lat.toFixed(4)}, ${state.activePinpoint.lng.toFixed(4)}), ${floor}.`
        },
        {
          title: 'Campus Facility Dispatched',
          time: 'Automated Routing',
          desc: `Notification queued for campus ${window.CATEGORIES_CONFIG[category].label} maintenance team.`
        }
      ]
    };

    state.complaints.unshift(newReport);
    state.myFiledIds.unshift(ticketId);
    saveComplaintsToStorage();

    // Notify parent React app in real-time
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        action: 'complaintCreated',
        complaint: newReport
      }, '*');
    }

    playAudio('success');

    // Reset Form
    document.getElementById('complaintForm').reset();
    clearPhotoPreview();
    closeReportDrawer();

    renderComplaintMarkers();

    // Pan with Mapbox flyTo
    mapInstance.flyTo({
      center: [newReport.lng, newReport.lat],
      zoom: 18,
      duration: 1500,
      essential: true
    });

    showToast(`Complaint Filed (${ticketId})`, 'Your issue has been pinpointed and sent to campus maintenance.');

    setTimeout(() => {
      openDetailDrawer(newReport);
    }, 600);
  }

  // --- Photo Upload Handling ---
  function handlePhotoSelect(file) {
    if (!file || !file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPG, PNG).');
      return;
    }
    const reader = new FileReader();
    reader.onload = function (e) {
      state.uploadedPhotoData = e.target.result;
      showPhotoPreview(state.uploadedPhotoData);
    };
    reader.readAsDataURL(file);
  }

  function showPhotoPreview(url) {
    document.getElementById('photoPreview').src = url;
    document.getElementById('photoPreviewWrap').style.display = 'block';
    document.getElementById('dropzonePrompt').style.display = 'none';
  }

  function clearPhotoPreview() {
    state.uploadedPhotoData = null;
    document.getElementById('photoInput').value = '';
    document.getElementById('photoPreview').src = '';
    document.getElementById('photoPreviewWrap').style.display = 'none';
    document.getElementById('dropzonePrompt').style.display = 'block';
  }

  // --- Campus Switching ---
  function switchCampus(campusKey) {
    if (campusKey === 'gps-live') {
      locateUserGPS();
      return;
    }

    if (!window.CAMPUS_PRESETS[campusKey]) return;

    state.currentCampus = campusKey;
    const campus = window.CAMPUS_PRESETS[campusKey];

    const sel = document.getElementById('campusSelect');
    if (sel && sel.value !== campusKey) {
      sel.value = campusKey;
    }

    mapInstance.flyTo({
      center: [campus.center[1], campus.center[0]],
      zoom: campus.zoom,
      duration: 1800,
      essential: true
    });

    renderComplaintMarkers();
  }
  window.switchCampus = switchCampus;

  // --- Geolocation ("Locate Me") ---
  function locateUserGPS() {
    if (!('geolocation' in navigator)) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    const locateBtn = document.getElementById('locateMeBtn');
    locateBtn.innerHTML = '<i data-lucide="loader"></i> Locating...';
    refreshIcons();

    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        state.userLocation = { lat: latitude, lng: longitude };

        if (userGpsMarker) {
          userGpsMarker.remove();
        }

        const el = document.createElement('div');
        el.className = 'user-gps-pulse';
        el.innerHTML = '<div style="width:20px;height:20px;background:#2563eb;border:3px solid #ffffff;border-radius:50%;box-shadow:0 0 12px rgba(37,99,235,0.8);"></div>';

        userGpsMarker = new mapboxgl.Marker({ element: el, anchor: 'center' })
          .setLngLat([longitude, latitude])
          .addTo(mapInstance);

        mapInstance.flyTo({
          center: [longitude, latitude],
          zoom: 18,
          duration: 1600,
          essential: true
        });

        locateBtn.innerHTML = '<i data-lucide="crosshair"></i> <span>Located</span>';
        refreshIcons();
        playAudio('pin');

        showToast('Live Location Locked', 'GPS location locked. Click on the map to file an issue here.');
      },
      error => {
        console.warn('Geolocation error:', error);
        locateBtn.innerHTML = '<i data-lucide="crosshair"></i> <span>Locate Me</span>';
        refreshIcons();
        alert('Could not determine physical GPS position. Centering on campus.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  // --- Upvote Complaint ---
  function upvoteCurrentComplaint() {
    const c = state.complaints.find(item => item.id === state.selectedComplaintId);
    if (!c) return;

    if (c.hasUpvoted) {
      c.upvotes = Math.max(0, (c.upvotes || 1) - 1);
      c.hasUpvoted = false;
      showToast('Upvote Removed', 'You retracted your upvote.');
    } else {
      c.upvotes = (c.upvotes || 0) + 1;
      c.hasUpvoted = true;
      showToast('Marked Affected (+1)', 'Your upvote boosts priority with campus facility crew.');
      playAudio('upvote');
    }

    saveComplaintsToStorage();
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        action: 'complaintUpvoted',
        id: c.id
      }, '*');
    }
    document.getElementById('detailUpvoteCount').textContent = c.upvotes;
    const upvoteBtn = document.getElementById('detailUpvoteBtn');
    if (c.hasUpvoted) {
      upvoteBtn.classList.add('upvoted');
    } else {
      upvoteBtn.classList.remove('upvoted');
    }

    renderComplaintMarkers();
  }

  // --- Share Complaint ---
  function shareCurrentComplaint() {
    const c = state.complaints.find(item => item.id === state.selectedComplaintId);
    if (!c) return;

    const shareText = `FixMyCampus Issue #${c.id}: ${c.title} (${c.nearestBuilding || 'Campus'}). Status: ${formatStatus(c.status)}. Priority: ${c.urgency.toUpperCase()}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText).then(() => {
        showToast('Summary Copied', 'Complaint summary copied to clipboard to share with student council or WhatsApp.');
        playAudio('pin');
      });
    }
  }

  // --- Export CSV Report ---
  function exportComplaintsCSV() {
    if (!state.complaints || state.complaints.length === 0) {
      alert('No complaints to export.');
      return;
    }

    const headers = ['Ticket ID', 'Title', 'Category', 'Urgency', 'Status', 'Nearest Landmark', 'Floor', 'Specifics', 'Upvotes', 'Reported Date', 'Reporter', 'Latitude', 'Longitude'];
    const rows = state.complaints.map(c => [
      c.id,
      `"${(c.title || '').replace(/"/g, '""')}"`,
      c.category,
      c.urgency,
      c.status,
      `"${(c.nearestBuilding || '').replace(/"/g, '""')}"`,
      `"${(c.floor || '').replace(/"/g, '""')}"`,
      `"${(c.locationName || '').replace(/"/g, '""')}"`,
      c.upvotes || 0,
      c.timestamp,
      c.anonymous ? 'Anonymous' : `"${(c.reporterName || '').replace(/"/g, '""')}"`,
      c.lat,
      c.lng
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `fixmycampus_complaints_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Report Exported', 'CSV file downloaded for campus administration review.');
    playAudio('success');
  }

  // --- Admin Mode Simulation Actions ---
  function updateComplaintStatus(newStatus) {
    const c = state.complaints.find(item => item.id === state.selectedComplaintId);
    if (!c) return;

    c.status = newStatus;
    const now = new Date();
    const timeFormatted = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' • ' + now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    let stepTitle = newStatus === 'in-progress' ? 'Maintenance Crew Dispatched' : 'Issue Resolved & Inspected';
    let stepDesc = newStatus === 'in-progress' ? 'Staff work order #MC-331 assigned to on-site technicians.' : 'Campus facility confirmed repair. Closed ticket.';

    c.timeline = c.timeline || [];
    c.timeline.push({
      title: stepTitle,
      time: timeFormatted,
      desc: stepDesc
    });

    saveComplaintsToStorage();
    openDetailDrawer(c);
    renderComplaintMarkers();
    showToast('Status Updated', `Ticket ${c.id} changed to ${formatStatus(newStatus)}.`);
    playAudio('success');
  }

  function addAdminProgressLog() {
    const noteInput = document.getElementById('adminNoteInput');
    const note = noteInput.value.trim();
    if (!note) return;

    const c = state.complaints.find(item => item.id === state.selectedComplaintId);
    if (!c) return;

    const now = new Date();
    const timeFormatted = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' • ' + now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    c.timeline = c.timeline || [];
    c.timeline.push({
      title: 'Facility Officer Log',
      time: timeFormatted,
      desc: note
    });

    saveComplaintsToStorage();
    noteInput.value = '';
    renderTimeline(c.timeline);
    showToast('Progress Log Added', 'Note saved to campus complaint record.');
  }

  // --- Ticket Search Modal ---
  function handleTicketSearch() {
    const query = document.getElementById('trackTicketInput').value.trim().toUpperCase();
    const resultBox = document.getElementById('trackResult');

    if (!query) {
      resultBox.innerHTML = '<span style="color:#dc2626;font-size:12px;">Please enter a ticket ID.</span>';
      return;
    }

    const cleanQuery = query.startsWith('FMC-') ? query : 'FMC-' + query;
    const found = state.complaints.find(c => c.id.toUpperCase() === cleanQuery || c.id.toUpperCase() === query);

    if (found) {
      resultBox.innerHTML = `
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px; margin-top:8px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <strong style="color:#2563eb;">${found.id}</strong>
            <span class="status-pill ${found.status}">${formatStatus(found.status)}</span>
          </div>
          <div style="font-weight:700; font-size:13px; margin-bottom:4px;">${escapeHtml(found.title)}</div>
          <div style="font-size:12px; color:#64748b; margin-bottom:10px;">${escapeHtml(found.locationName || found.nearestBuilding)}</div>
          <button class="btn btn-primary btn-sm" style="width:100%;" onclick="window.viewAndFocusComplaint('${found.id}')">
            Show on Map & Timeline
          </button>
        </div>
      `;
    } else {
      resultBox.innerHTML = `
        <div style="color:#dc2626; font-size:13px; padding:10px; background:#fee2e2; border-radius:6px; margin-top:8px;">
          No complaint found matching <strong>${escapeHtml(query)}</strong>. Please verify the ticket code.
        </div>
      `;
    }
  }

  // --- Statistics Bar Update ---
  function updateStats() {
    const total = state.complaints.length;
    const inProgress = state.complaints.filter(c => c.status === 'in-progress').length;
    const resolved = state.complaints.filter(c => c.status === 'resolved').length;

    document.getElementById('statTotal').textContent = total;
    document.getElementById('statProgress').textContent = inProgress;
    document.getElementById('statResolved').textContent = resolved;
  }

  // --- Toast Notification ---
  function showToast(title, message) {
    const toast = document.getElementById('toast');
    document.getElementById('toastTitle').textContent = title;
    document.getElementById('toastDesc').textContent = message;

    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 4500);
  }

  // --- Global Window Helpers (for HTML inline handlers) ---
  window.viewComplaintDetails = function (id) {
    const complaint = state.complaints.find(c => c.id === id);
    if (complaint) {
      openDetailDrawer(complaint);
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({
          action: 'selectComplaint',
          id: id,
          title: complaint.title
        }, '*');
      }
    }
  };

  window.quickUpdateStatus = function (id, newStatus) {
    state.selectedComplaintId = id;
    updateComplaintStatus(newStatus);
  };

  window.deleteComplaint = function (id) {
    const complaint = state.complaints.find(c => c.id === id);
    const title = complaint ? complaint.title : id;
    if (confirm(`Officer Action: Permanently delete complaint ticket #${id} (${title})?`)) {
      state.complaints = state.complaints.filter(c => c.id !== id);
      saveComplaintsToStorage();
      renderComplaintMarkers();
      renderComplaintsList();
      updateStats();
      closeDetailDrawer();
      showToast('Complaint Deleted', `Ticket #${id} removed from campus registry.`);
      playAudio('pin');
    }
  };

  window.viewAndFocusComplaint = function (id) {
    const complaint = state.complaints.find(c => c.id === id);
    if (complaint) {
      document.getElementById('trackModal').classList.remove('open');
      mapInstance.flyTo({
        center: [complaint.lng, complaint.lat],
        zoom: 18,
        duration: 1500,
        essential: true
      });
      openDetailDrawer(complaint);
    }
  };

  // --- UI Event Listeners ---
  function setupEventListeners() {
    // Campus Selector
    document.getElementById('campusSelect').addEventListener('change', function (e) {
      switchCampus(e.target.value);
    });

    // Start Report Button
    document.getElementById('startReportBtn').addEventListener('click', function () {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ action: 'onRequestReport' }, '*');
        return;
      }
      activatePinMode();
      openReportDrawer();
    });

    // Cancel Pin Mode Banner Button
    document.getElementById('cancelPinModeBtn').addEventListener('click', function () {
      deactivatePinMode();
    });

    // Reposition Pin Button in form
    document.getElementById('repositionPinBtn').addEventListener('click', function () {
      activatePinMode();
      showToast('Adjust Pin', 'Click anywhere on the map or drag the red marker to fine-tune.');
    });

    // Drawer Close Buttons
    document.getElementById('closeReportDrawerBtn').addEventListener('click', closeReportDrawer);
    document.getElementById('cancelReportBtn').addEventListener('click', closeReportDrawer);
    document.getElementById('closeDetailDrawerBtn').addEventListener('click', closeDetailDrawer);
    document.getElementById('closeListDrawerBtn').addEventListener('click', closeListDrawer);

    // List Drawer Toggle Button
    document.getElementById('toggleListDrawerBtn').addEventListener('click', function () {
      const drawer = document.getElementById('listDrawer');
      if (drawer.classList.contains('open')) {
        closeListDrawer();
      } else {
        openListDrawer();
      }
    });

    // Layer Switcher Buttons
    document.getElementById('layerStreet').addEventListener('click', () => setMapLayer('street'));
    document.getElementById('layerSatellite').addEventListener('click', () => setMapLayer('satellite'));
    document.getElementById('layerDark').addEventListener('click', () => setMapLayer('dark'));

    // 3D Perspective View Toggle Button
    const toggle3DBtn = document.getElementById('toggle3DBtn');
    if (toggle3DBtn) {
      toggle3DBtn.addEventListener('click', toggle3DView);
    }

    // Heatmap Hotspots Toggle Button
    const toggleHeatmapBtn = document.getElementById('toggleHeatmapBtn');
    if (toggleHeatmapBtn) {
      toggleHeatmapBtn.addEventListener('click', toggleHeatmap);
    }

    // Locate Me GPS Button
    document.getElementById('locateMeBtn').addEventListener('click', locateUserGPS);

    // Sound FX Toggle Button
    const soundToggleBtn = document.getElementById('soundToggleBtn');
    if (soundToggleBtn) {
      soundToggleBtn.addEventListener('click', function () {
        state.soundEnabled = !state.soundEnabled;
        this.classList.toggle('active', state.soundEnabled);
        this.innerHTML = `<i data-lucide="${state.soundEnabled ? 'volume-2' : 'volume-x'}"></i>`;
        refreshIcons();
        showToast(state.soundEnabled ? 'Audio On' : 'Audio Muted', state.soundEnabled ? 'Audio feedback enabled' : 'Muted');
      });
    }

    // Emergency Helplines Button & Modal
    const emergencyBtn = document.getElementById('emergencyBtn');
    const emergencyModal = document.getElementById('emergencyModal');
    const closeEmergencyModalBtn = document.getElementById('closeEmergencyModalBtn');

    if (emergencyBtn && emergencyModal) {
      emergencyBtn.addEventListener('click', function () {
        const activeCampus = state.currentCampus === 'kpr-iet' ? 'kpr-iet' : 'bannari-amman';
        document.querySelectorAll('.helpline-tab').forEach(t => {
          t.classList.toggle('active', t.dataset.campus === activeCampus);
        });
        renderHelplines(activeCampus);
        emergencyModal.classList.add('open');
      });

      closeEmergencyModalBtn.addEventListener('click', function () {
        emergencyModal.classList.remove('open');
      });

      emergencyModal.addEventListener('click', function (e) {
        if (e.target === emergencyModal) emergencyModal.classList.remove('open');
      });

      document.querySelectorAll('.helpline-tab').forEach(tab => {
        tab.addEventListener('click', function () {
          document.querySelectorAll('.helpline-tab').forEach(t => t.classList.remove('active'));
          this.classList.add('active');
          renderHelplines(this.dataset.campus);
          playAudio('pin');
        });
      });
    }

    // Export CSV Button
    const exportCsvBtn = document.getElementById('exportCsvBtn');
    if (exportCsvBtn) {
      exportCsvBtn.addEventListener('click', exportComplaintsCSV);
    }

    // Share Complaint Button
    const shareComplaintBtn = document.getElementById('shareComplaintBtn');
    if (shareComplaintBtn) {
      shareComplaintBtn.addEventListener('click', shareCurrentComplaint);
    }

    // Category Grid Selection in Form
    document.querySelectorAll('.cat-radio-card').forEach(card => {
      card.addEventListener('click', function () {
        document.querySelectorAll('.cat-radio-card').forEach(c => c.classList.remove('selected'));
        this.classList.add('selected');
        document.getElementById('selectedCategory').value = this.dataset.cat;
        playAudio('pin');
      });
    });

    // Anonymous Checkbox
    document.getElementById('anonymousCheckbox').addEventListener('change', function () {
      const reporterFields = document.getElementById('reporterFields');
      if (this.checked) {
        reporterFields.style.opacity = '0.4';
        reporterFields.style.pointerEvents = 'none';
      } else {
        reporterFields.style.opacity = '1';
        reporterFields.style.pointerEvents = 'auto';
      }
    });

    // Form Submit
    document.getElementById('complaintForm').addEventListener('submit', handleComplaintSubmit);

    // Photo Dropzone Interactions
    const dropzone = document.getElementById('dropzone');
    const photoInput = document.getElementById('photoInput');

    dropzone.addEventListener('click', function (e) {
      if (e.target.closest('#removePhotoBtn') || e.target.closest('#useSamplePhotoBtn')) return;
      photoInput.click();
    });

    photoInput.addEventListener('change', function () {
      if (this.files && this.files[0]) {
        handlePhotoSelect(this.files[0]);
      }
    });

    dropzone.addEventListener('dragover', function (e) {
      e.preventDefault();
      this.style.borderColor = '#2563eb';
    });

    dropzone.addEventListener('dragleave', function () {
      this.style.borderColor = '';
    });

    dropzone.addEventListener('drop', function (e) {
      e.preventDefault();
      this.style.borderColor = '';
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handlePhotoSelect(e.dataTransfer.files[0]);
      }
    });

    document.getElementById('useSamplePhotoBtn').addEventListener('click', function (e) {
      e.stopPropagation();
      const currentCat = document.getElementById('selectedCategory').value;
      let sampleUrl = SAMPLE_PHOTOS[0];
      if (currentCat === 'electrical') sampleUrl = SAMPLE_PHOTOS[1];
      if (currentCat === 'roads') sampleUrl = SAMPLE_PHOTOS[2];
      if (currentCat === 'sanitation') sampleUrl = SAMPLE_PHOTOS[3];

      state.uploadedPhotoData = sampleUrl;
      showPhotoPreview(sampleUrl);
      playAudio('pin');
    });

    document.getElementById('removePhotoBtn').addEventListener('click', function (e) {
      e.stopPropagation();
      clearPhotoPreview();
    });

    // Search Box, Location Go Button & Autocomplete
    const searchInput = document.getElementById('searchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    const searchLocationBtn = document.getElementById('searchLocationBtn');

    searchInput.addEventListener('input', function (e) {
      state.searchQuery = e.target.value.trim();
      clearSearchBtn.style.display = state.searchQuery ? 'block' : 'none';
      updateSearchAutocomplete(state.searchQuery);
      renderComplaintMarkers();
    });

    searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        executeLocationSearch(this.value);
      }
    });

    if (searchLocationBtn) {
      searchLocationBtn.addEventListener('click', function () {
        executeLocationSearch();
      });
    }

    clearSearchBtn.addEventListener('click', function () {
      searchInput.value = '';
      state.searchQuery = '';
      this.style.display = 'none';
      updateSearchAutocomplete('');
      renderComplaintMarkers();
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('.search-box-wrap')) {
        const dropdown = document.getElementById('searchAutocomplete');
        if (dropdown) dropdown.style.display = 'none';
      }
    });

    // Category Filter Chips
    document.querySelectorAll('.filter-chip').forEach(chip => {
      chip.addEventListener('click', function () {
        document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        this.classList.add('active');
        state.filterCategory = this.dataset.category;
        renderComplaintMarkers();
        playAudio('pin');
      });
    });

    // Status Filter Select
    document.getElementById('statusFilter').addEventListener('change', function (e) {
      state.filterStatus = e.target.value;
      renderComplaintMarkers();
    });

    // Sort Select in Ledger
    document.getElementById('listSortSelect').addEventListener('change', function (e) {
      state.sortBy = e.target.value;
      renderComplaintsList();
    });

    // Upvote Button
    document.getElementById('detailUpvoteBtn').addEventListener('click', upvoteCurrentComplaint);

    // Center on Map Button in Detail Drawer
    document.getElementById('focusOnMapBtn').addEventListener('click', function () {
      const complaint = state.complaints.find(c => c.id === state.selectedComplaintId);
      if (complaint) {
        mapInstance.flyTo({
          center: [complaint.lng, complaint.lat],
          zoom: 18,
          duration: 1400,
          essential: true
        });
      }
    });

    // Copy Ticket Button
    document.getElementById('copyTicketBtn').addEventListener('click', function () {
      const ticketId = document.getElementById('detailTicketId').textContent;
      navigator.clipboard.writeText(ticketId).then(() => {
        showToast('Copied to Clipboard', `Ticket ID ${ticketId} copied.`);
        playAudio('pin');
      });
    });

    // Admin Mode Switch
    const adminToggleEl = document.getElementById('adminModeToggle');
    if (adminToggleEl) {
      adminToggleEl.addEventListener('change', function () {
        if (!state.canAccessAdmin) {
          this.checked = false;
          return;
        }
        state.adminMode = this.checked;
        document.body.classList.toggle('admin-mode-active', state.adminMode);

        const adminPanel = document.getElementById('adminControlPanel');
        if (adminPanel) adminPanel.style.display = state.adminMode ? 'block' : 'none';

        const officerBanner = document.getElementById('adminOfficerBanner');
        if (officerBanner) officerBanner.style.display = state.adminMode ? 'flex' : 'none';

        // Re-render markers and list to display 1-click admin actions
        renderComplaintMarkers();
        renderComplaintsList();

        if (state.adminMode) {
          showToast('Officer Command Mode ON', 'Map pins and ledger cards now feature 1-click status & delete actions.');
          playAudio('success');
        } else {
          showToast('Officer Mode Deactivated', 'Standard student view restored.');
          playAudio('pin');
        }
      });
    }

    // Top Admin Banner Actions
    const adminQuickDispatchBtn = document.getElementById('adminQuickDispatchBtn');
    if (adminQuickDispatchBtn) {
      adminQuickDispatchBtn.addEventListener('click', function () {
        showToast('Technician Crew Dispatched', 'Dispatch order #MC-402 assigned to Electrical & Plumbing team.');
        playAudio('success');
      });
    }

    const adminResolveOpenBtn = document.getElementById('adminResolveOpenBtn');
    if (adminResolveOpenBtn) {
      adminResolveOpenBtn.addEventListener('click', function () {
        const activeIssues = state.complaints.filter(c => c.status === 'in-progress' || c.status === 'reported');
        if (activeIssues.length === 0) {
          showToast('All Issues Fixed', 'There are no active complaints to resolve.');
          return;
        }
        if (confirm(`Officer Action: Mark all ${activeIssues.length} active complaints as Resolved?`)) {
          state.complaints.forEach(c => {
            if (c.status !== 'resolved') {
              c.status = 'resolved';
              c.timeline = c.timeline || [];
              c.timeline.push({
                title: 'Batch Resolved by Officer',
                time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
                desc: 'Executive batch resolution by Campus Facilities Management.'
              });
            }
          });
          saveComplaintsToStorage();
          renderComplaintMarkers();
          renderComplaintsList();
          updateStats();
          showToast('Batch Resolved', `${activeIssues.length} campus complaints marked as Resolved.`);
          playAudio('success');
        }
      });
    }

    const adminStatsSummaryBtn = document.getElementById('adminStatsSummaryBtn');
    if (adminStatsSummaryBtn) {
      adminStatsSummaryBtn.addEventListener('click', function () {
        openListDrawer();
      });
    }

    // Admin Action Buttons
    document.querySelectorAll('.btn-admin-action').forEach(btn => {
      btn.addEventListener('click', function () {
        const action = this.dataset.action;
        if (action === 'set-in-progress') {
          updateComplaintStatus('in-progress');
        } else if (action === 'set-resolved') {
          updateComplaintStatus('resolved');
        }
      });
    });

    document.getElementById('addAdminNoteBtn').addEventListener('click', addAdminProgressLog);

    // Track Ticket Modal
    const trackModal = document.getElementById('trackModal');
    document.getElementById('trackTicketBtn').addEventListener('click', function () {
      document.getElementById('trackResult').innerHTML = '';
      document.getElementById('trackTicketInput').value = '';
      trackModal.classList.add('open');
    });

    document.getElementById('closeTrackModalBtn').addEventListener('click', function () {
      trackModal.classList.remove('open');
    });

    trackModal.addEventListener('click', function (e) {
      if (e.target === trackModal) {
        trackModal.classList.remove('open');
      }
    });

    document.getElementById('searchTicketBtn').addEventListener('click', handleTicketSearch);
    document.getElementById('trackTicketInput').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') handleTicketSearch();
    });
  }

  // --- Helplines Dynamic Rendering ---
  function renderHelplines(campusKey) {
    const container = document.getElementById('helplineContainer');
    if (!container || !window.CAMPUS_HELPLINES) return;

    const key = (campusKey && window.CAMPUS_HELPLINES[campusKey]) ? campusKey : 'bannari-amman';
    const list = window.CAMPUS_HELPLINES[key] || [];

    container.innerHTML = list.map(item => `
      <div class="helpline-card ${item.type}">
        <div class="helpline-icon">
          <i data-lucide="${item.icon}"></i>
        </div>
        <div class="helpline-info">
          <strong>${escapeHtml(item.role)}</strong>
          <span class="helpline-num">📞 ${escapeHtml(item.phone)} <span class="helpline-alt">${escapeHtml(item.alt ? '• ' + item.alt : '')}</span></span>
        </div>
        <div class="helpline-actions">
          <a href="tel:${item.phone.replace(/[^0-9+]/g, '')}" class="btn-call" title="Call directly">
            <i data-lucide="phone"></i> Call
          </a>
          <button class="btn-copy-num" data-phone="${escapeHtml(item.phone)}" title="Copy Number">
            <i data-lucide="copy"></i> Copy
          </button>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.btn-copy-num').forEach(btn => {
      btn.addEventListener('click', function () {
        const phone = this.dataset.phone;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(phone).then(() => {
            showToast('Number Copied', `${phone} copied to clipboard.`);
            playAudio('pin');
          });
        }
      });
    });

    refreshIcons();
  }

  // --- Helper Functions ---
  function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function formatStatus(status) {
    switch (status) {
      case 'reported': return 'Reported';
      case 'in-progress': return 'In Progress';
      case 'resolved': return 'Resolved';
      default: return capitalize(status);
    }
  }

  function formatDate(isoStr) {
    if (!isoStr) return 'Recently';
    const d = new Date(isoStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  // Launch on DOM ready
  document.addEventListener('DOMContentLoaded', init);
})();
