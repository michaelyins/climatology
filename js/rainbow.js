// rainbow.js - Rainbow prediction model frontend
document.addEventListener('DOMContentLoaded', () => {
    let allDisplayData = {};  // Simplified display data
    let allMapData = {};      // Detailed map data
    let userSelection = {
        location: null,
        timeSlot: null
    };

    // --- DOM Element References ---
    const locationToggle = document.getElementById('location-toggle');
    const locationDropdown = document.getElementById('location-dropdown');
    const timeToggle = document.getElementById('time-toggle');
    const timeDropdown = document.getElementById('time-dropdown');
    const searchButton = document.getElementById('search-button');
    const emptyButton = document.getElementById('empty-button');
    
    const selectedLocationEl = document.getElementById('selected-location');
    const selectedDateEl = document.getElementById('selected-date');
    const sunsetDisplayEl = document.getElementById('sunset-display');
    const recommendLevelEl = document.getElementById('recommend-level');
    const recommendDescEl = document.getElementById('recommend-description');
    const airQualityEl = document.getElementById('air-quality');
    const airDescEl = document.getElementById('air-description');
    
    // === MAP VARIABLES ===
    let rainbowMap = null;
    let locationMarkers = {};
    let currentTimeHour = 17;
    let availableTimeSlots = []; // Store all available time slots

    // Location coordinates data
    const locationCoordinates = {
        "Boston": [42.3601, -71.0589],
        "New York": [40.7128, -74.006],
        "Darien": [41.0518, -73.4668],
        "Cleveland": [41.4993, -81.6944],
        "Chicago": [41.8781, -87.6298],
        "Madison": [43.0731, -89.4012],
        "Zion National Park": [37.2982, -113.0263],
        "Monument Valley": [36.9916, -110.1039],
        "Lake Tahoe": [39.0968, -120.0324],
        "Mt. Whitney": [36.5785, -118.292],
        "Houston": [29.7604, -95.3698],
        "Death Valley": [36.2689, -116.8611],
        "Los Angeles": [34.0522, -118.2437],
        "San Francisco": [37.7749, -122.4194],
        "Yosemite National Park": [37.8651, -119.5383],
        "Seattle": [47.6062, -122.3321],
        "Mt. Rainier": [46.8521, -121.7603],
        "Mt. Hood": [45.3300, -121.6944],
        "Yellowstone National Park": [44.4280, -110.5885],
        "Grand Teton National Park": [43.7904, -110.6818],
        "Glacier National Park": [48.7819, -113.7267]
    };

    // Initialize the application
    async function init() {
        console.log("Initializing rainbow application...");
        await loadRainbowData();
        setupEventListeners();
        updateButtonTexts();
        // Initialize map after data is loaded
        setTimeout(() => {
            initRainbowMap();
        }, 100);
    }

    async function loadRainbowData() {
        console.log("Loading rainbow data files...");
        try {
            const timestamp = new Date().getTime();
            
            // Load display data
            const displayResponse = await fetch(`../data/rainbow_display.json?v=${timestamp}`);
            console.log("Display data fetch response status:", displayResponse.status);
            if (!displayResponse.ok) throw new Error(`HTTP error! status: ${displayResponse.status}`);
            allDisplayData = await displayResponse.json();
            console.log("✅ Display data loaded successfully:", allDisplayData);
            
            // Load map data
            const mapResponse = await fetch(`../data/rainbow_map.json?v=${timestamp}`);
            console.log("Map data fetch response status:", mapResponse.status);
            if (!mapResponse.ok) throw new Error(`HTTP error! status: ${mapResponse.status}`);
            allMapData = await mapResponse.json();
            console.log("✅ Map data loaded successfully. Locations:", Object.keys(allMapData).length);
            
            // Extract all available time slots
            extractAvailableTimeSlots();
            
            populateLocationDropdown();
        } catch (error) {
            console.error("❌ Failed to load rainbow data:", error);
            alert("Error: Unable to load rainbow prediction data. Check console for details.");
        }
    }

    function extractAvailableTimeSlots() {
        const allSlots = new Set();
        Object.values(allMapData).forEach(locationData => {
            Object.keys(locationData).forEach(timeSlot => {
                const hour = parseInt(timeSlot.replace('rainbow_', ''));
                allSlots.add(hour);
            });
        });
        availableTimeSlots = Array.from(allSlots).sort((a, b) => a - b);
        console.log("Available time slots:", availableTimeSlots);
        
        // Set current time to first available slot
        if (availableTimeSlots.length > 0) {
            currentTimeHour = availableTimeSlots[0];
        }
    }

    function populateLocationDropdown() {
        locationDropdown.innerHTML = '';
        const locations = Object.keys(allDisplayData);
        if (locations.length === 0) {
            locationDropdown.innerHTML = '<div class="dropdown-item">No available locations</div>';
            return;
        }
        
        // Add search box
        const searchBox = document.createElement('div');
        searchBox.className = 'dropdown-search';
        searchBox.innerHTML = '<input type="text" placeholder="Search locations..." id="location-search-rainbow">';
        locationDropdown.appendChild(searchBox);
        
        // Add location items
        locations.forEach(location => {
            const item = document.createElement('div');
            item.className = 'dropdown-item';
            item.setAttribute('data-value', location);
            item.textContent = location;
            locationDropdown.appendChild(item);
        });
        
        // Add search functionality
        const searchInput = document.getElementById('location-search-rainbow');
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const items = locationDropdown.querySelectorAll('.dropdown-item');
            
            items.forEach(item => {
                const text = item.textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    item.classList.remove('hidden');
                } else {
                    item.classList.add('hidden');
                }
            });
        });
        
        // Prevent dropdown from closing when clicking on search box
        searchInput.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        console.log("Location dropdown populated with:", locations);
    }

    function populateTimeDropdown(locationData) {
        timeDropdown.innerHTML = '';
        
        if (!locationData || !locationData.allTimeSlots) {
            timeDropdown.innerHTML = '<div class="dropdown-item">No available time slots</div>';
            return;
        }
        
        // Filter for positive ratings and sort by time
        const positiveTimeSlots = locationData.allTimeSlots.filter(slot => 
            slot.level > 0
        ).sort((a, b) => {
            const timeA = parseInt(a.time.split(':')[0]);
            const timeB = parseInt(b.time.split(':')[0]);
            return timeA - timeB;
        });
        
        if (positiveTimeSlots.length === 0) {
            timeDropdown.innerHTML = '<div class="dropdown-item">No suitable time slots</div>';
            return;
        }
        
        positiveTimeSlots.forEach(slot => {
            const item = document.createElement('div');
            item.className = 'dropdown-item';
            item.setAttribute('data-value', slot.time);
            item.textContent = `${slot.time} (${slot.level}★)`;
            timeDropdown.appendChild(item);
        });
        
        console.log("Time dropdown populated with:", positiveTimeSlots.length, "slots");
    }

    function setupEventListeners() {
        // Location dropdown toggle
        locationToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleDropdown(locationDropdown);
            closeAllDropdowns(locationDropdown);
        });

        // Time dropdown toggle
        timeToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleDropdown(timeDropdown);
            closeAllDropdowns(timeDropdown);
        });

        // Location selection
        locationDropdown.addEventListener('click', (e) => {
            if (e.target.classList.contains('dropdown-item')) {
                const location = e.target.getAttribute('data-value');
                userSelection.location = location;
                document.getElementById('location-text').textContent = location;
                
                // Populate time dropdown for selected location
                if (allDisplayData[location]) {
                    populateTimeDropdown(allDisplayData[location]);
                }
                
                closeAllDropdowns();
                updateButtonTexts();
            }
        });

        // Time selection
        timeDropdown.addEventListener('click', (e) => {
            if (e.target.classList.contains('dropdown-item')) {
                const timeSlot = e.target.getAttribute('data-value');
                userSelection.timeSlot = timeSlot;
                document.getElementById('time-text').textContent = timeSlot;
                
                closeAllDropdowns();
                updateButtonTexts();
            }
        });

        // Search button
        searchButton.addEventListener('click', () => {
            searchRainbowReports();
        });

        // Empty button
        emptyButton.addEventListener('click', () => {
            resetSelection();
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', () => {
            closeAllDropdowns();
        });

        // Interactive buttons
        initInteractiveButtons();
    }

    function toggleDropdown(dropdown) {
        const isOpen = dropdown.classList.contains('show');
        
        // Close all dropdowns first
        closeAllDropdowns();
        
        // Toggle the clicked dropdown
        if (!isOpen) {
            dropdown.classList.add('show');
        }
    }

    function closeAllDropdowns(except = null) {
        const dropdowns = [locationDropdown, timeDropdown];
        dropdowns.forEach(dropdown => {
            if (dropdown !== except) {
                dropdown.classList.remove('show');
            }
        });
    }

    function updateButtonTexts() {
        // Update location button text
        const locationText = userSelection.location || 'Choose Location';
        document.getElementById('location-text').textContent = locationText;
        
        // Update time button text
        const timeText = userSelection.timeSlot || 'Choose Time Slot';
        document.getElementById('time-text').textContent = timeText;
    }

    function searchRainbowReports() {
        console.log("Searching rainbow reports...");
        
        if (!userSelection.location || !userSelection.timeSlot) {
            alert("Please select both location and time slot.");
            return;
        }
        
        // Find the selected time slot data
        const locationData = allDisplayData[userSelection.location];
        if (!locationData || !locationData.allTimeSlots) {
            console.error("No data found for location:", userSelection.location);
            return;
        }
        
        // Find the specific time slot
        const selectedTimeSlot = locationData.allTimeSlots.find(slot => 
            slot.time === userSelection.timeSlot
        );
        
        if (!selectedTimeSlot) {
            console.error("Time slot not found:", userSelection.timeSlot);
            return;
        }
        
        // Create display data object with proper structure
        const displayData = {
            locationName: locationData.locationName,
            date: new Date().toISOString().split('T')[0], // Current date
            time: selectedTimeSlot.time,
            level: selectedTimeSlot.level,
            percentage: selectedTimeSlot.percentage,
            airQualityValue: locationData.airQualityValue,
            airQuality: locationData.airQuality
        };
        
        // Display the data
        displayRainbowData(displayData);
        
        // Show the map section
        const mapSection = document.querySelector('.map-section');
        if (mapSection) {
            mapSection.style.display = 'block';
        }
        
        console.log("Rainbow data displayed for:", userSelection.location, userSelection.timeSlot);
    }

    function getRecommendDescription(level) {
        switch (level) {
            case 3: return "Excellent conditions for rainbow observation";
            case 2: return "Good conditions for rainbow observation";
            case 1: return "Fair conditions for rainbow observation";
            default: return "Poor conditions for rainbow observation";
        }
    }

    // Get detailed AOD description based on AOD value
    function getAODDescription(aodValue) {
        if (aodValue === undefined || aodValue === null || isNaN(aodValue)) {
            return "AOD data unavailable";
        }
        
        const aod = parseFloat(aodValue);
        
        if (aod < 0.1) {
            return "Excellent air quality - very clean atmosphere, expect vibrant rainbow colors";
        } else if (aod < 0.2) {
            return "Good air quality - clean atmosphere, good rainbow visibility";
        } else if (aod < 0.4) {
            return "Moderate air quality - slight haze may dim colors slightly";
        } else if (aod < 0.6) {
            return "Poor air quality - significant haze, may produce reddish rainbow";
        } else {
            return "Very poor air quality - heavy pollution, rainbow visibility severely reduced";
        }
    }

    // Convert recommend level to percentage
    function getLevelPercentage(level) {
        switch(level) {
            case 1: return 30;
            case 2: return 60;
            case 3: return 95;
            default: return 0;
        }
    }

    // Get weather description based on level and conditions
    function getWeatherDescription(level, data) {
        if (level === 0) {
            return "No rainbow conditions - insufficient sunlight or rainfall";
        }
        
        let desc = "";
        if (level === 3) {
            desc = "Excellent rainbow conditions - strong sunlight with moderate rainfall";
        } else if (level === 2) {
            desc = "Good rainbow conditions - adequate sunlight and rainfall";
        } else if (level === 1) {
            desc = "Fair rainbow conditions - weak sunlight or light rainfall";
        }
        
        return desc;
    }

    function displayRainbowData(data) {
        console.log('Displaying rainbow data:', data);
        
        // Update location and date
        selectedLocationEl.textContent = data.locationName || '--';
        selectedDateEl.textContent = data.date || '--';
        
        // Update time
        sunsetDisplayEl.textContent = data.time || '--:--';
        
        // Update recommend level with percentage
        const levelPercentage = getLevelPercentage(data.level);
        recommendLevelEl.textContent = levelPercentage + '%';
        
        // Update recommend description with specific weather conditions
        const weatherDesc = getWeatherDescription(data.level, data);
        recommendDescEl.textContent = weatherDesc;
        
        // Update air quality (AOD) - just show the number
        if (data.airQualityValue !== undefined) {
            const aodValue = parseFloat(data.airQualityValue).toFixed(3);
            airQualityEl.textContent = aodValue;
        } else {
            airQualityEl.textContent = '--';
        }
        
        // Update air quality description with detailed AOD description
        const aodDesc = getAODDescription(data.airQualityValue);
        airDescEl.textContent = aodDesc;
    }

    function displayNoData() {
        selectedLocationEl.textContent = 'No Data';
        selectedDateEl.textContent = '--';
        sunsetDisplayEl.textContent = '--:--';
        recommendLevelEl.textContent = '--';
        recommendDescEl.textContent = 'No data available';
        airQualityEl.textContent = '--';
        airDescEl.textContent = 'No data available';
    }

    function resetSelection() {
        userSelection.location = null;
        userSelection.timeSlot = null;
        updateButtonTexts();
        displayNoData();
        
        // Hide map section
        const mapSection = document.querySelector('.map-section');
        if (mapSection) {
            mapSection.style.display = 'none';
        }
    }

    function initInteractiveButtons() {
        const buttons = document.querySelectorAll('.info-btn');
        const panels = document.querySelectorAll('.content-panel');
        
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                const targetContent = button.getAttribute('data-content');
                
                // Remove active class from all buttons and panels
                buttons.forEach(btn => btn.classList.remove('active'));
                panels.forEach(panel => panel.classList.remove('active'));
                
                // Add active class to clicked button and corresponding panel
                button.classList.add('active');
                const targetPanel = document.getElementById(`${targetContent}-content`);
                if (targetPanel) {
                    targetPanel.classList.add('active');
                }
            });
        });
    }

    function initRainbowMap() {
        console.log("Initializing rainbow map...");
        // Check if map container exists
        const mapContainer = document.getElementById('rainbow-map');
        if (!mapContainer) {
            console.error('Map container not found');
            return;
        }
        console.log("Map container found:", mapContainer);

        try {
            // Initialize the map centered on US
            rainbowMap = L.map('rainbow-map').setView([39.8283, -98.5795], 4);
            console.log("Map object created:", rainbowMap);

            // Add OpenStreetMap tiles
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 18
            }).addTo(rainbowMap);
            console.log("Map tiles added");

            // Setup time slider
            setupTimeSlider();
            console.log("Time slider setup complete");
            
            // Load initial markers for all locations
            loadAllLocationMarkers();
            console.log("All location markers loaded");
        } catch (error) {
            console.error("Error initializing map:", error);
        }
    }

    function setupTimeSlider() {
        const timeSlider = document.getElementById('time-slider');
        const timeDisplay = document.getElementById('current-time-display');
        
        if (!timeSlider || !timeDisplay) {
            console.error("Time slider elements not found");
            return;
        }

        // Set slider range based on available time slots
        timeSlider.min = Math.min(...availableTimeSlots);
        timeSlider.max = Math.max(...availableTimeSlots);
        timeSlider.value = currentTimeHour;
        timeDisplay.textContent = `${currentTimeHour}:00`;

        timeSlider.addEventListener('input', (e) => {
            currentTimeHour = parseInt(e.target.value);
            timeDisplay.textContent = `${currentTimeHour}:00`;
            updateAllMapMarkers();
        });
    }

    function loadAllLocationMarkers() {
        console.log("Loading all location markers for global display...");
        
        // Clear existing markers
        Object.values(locationMarkers).forEach(markers => {
            markers.forEach(marker => {
                if (rainbowMap.hasLayer(marker)) {
                    rainbowMap.removeLayer(marker);
                }
            });
        });
        locationMarkers = {};
        
        // Create heatmap-style overlays for all locations
        Object.keys(locationCoordinates).forEach(locationName => {
            if (!allMapData[locationName]) return;
            
            const centerCoords = locationCoordinates[locationName];
            const data = getRainbowDataForTime(locationName, currentTimeHour);
            
            if (!data || !data.gridPoints) {
                // Create simple center marker if no grid data
                const color = data ? getColorByRating(data.gridSummary?.recommendLevel || 0) : '#9CA3AF';
                const marker = L.circleMarker([centerCoords[0], centerCoords[1]], {
                    radius: 12,
                    color: '#ffffff',
                    weight: 2,
                    fillColor: color,
                    fillOpacity: 0.8
                });
                
                if (data) {
                    const popupContent = createPopupContent(data);
                    marker.bindPopup(popupContent);
                }
                
                marker.bindTooltip(locationName, {
                    permanent: false,
                    direction: 'bottom',
                    offset: [0, 10],
                    className: 'location-label'
                });
                
                marker.addTo(rainbowMap);
                locationMarkers[locationName] = [marker];
                return;
            }
            
            // Create heatmap-style overlay
            const centerColor = getColorByRating(data.gridSummary?.recommendLevel || 0);
            const centerMarker = L.circleMarker([centerCoords[0], centerCoords[1]], {
                radius: 15,
                color: '#ffffff',
                weight: 3,
                fillColor: centerColor,
                fillOpacity: 0.9
            });
            
            centerMarker.bindTooltip(locationName, {
                permanent: false,
                direction: 'bottom',
                offset: [0, 10],
                className: 'location-label'
            });
            
            centerMarker.addTo(rainbowMap);
            locationMarkers[locationName] = [centerMarker];
            
            // Create heatmap overlay using grid points
            const heatmapData = data.gridPoints.map((point, index) => {
                const intensity = point.rating / 3; // Normalize to 0-1
                return {
                    lat: point.latitude,
                    lng: point.longitude,
                    value: intensity
                };
            });
            
            // Add center point to heatmap data
            heatmapData.push({
                lat: centerCoords[0],
                lng: centerCoords[1],
                value: data.gridSummary?.recommendLevel / 3 || 0
            });
            
            // Create individual colored circles for each grid point
            data.gridPoints.forEach((point, index) => {
                const color = getColorByRating(point.rating);
                const gridMarker = L.circleMarker([point.latitude, point.longitude], {
                    radius: 10,
                    color: '#ffffff',
                    weight: 3,
                    fillColor: color,
                    fillOpacity: 0.8
                });
                
                // Add popup for grid point
                const gridPopupContent = `
                    <div class="popup-title">${locationName} - Grid Point ${index + 1}</div>
                    <div class="popup-time">${data.date} at ${data.localEventTime}</div>
                    <div class="popup-probability">Rainbow Probability: ${point.recommendPercentage}%</div>
                    <div class="popup-aod">Air Quality: AOD ${parseFloat(point.airQualityValue).toFixed(3)}</div>
                    <div class="popup-description">${point.qualityDescription}</div>
                `;
                
                gridMarker.bindPopup(gridPopupContent);
                gridMarker.addTo(rainbowMap);
                locationMarkers[locationName].push(gridMarker);
            });
        });

        console.log("All location heatmaps loaded for time:", currentTimeHour);
    }

    function updateAllMapMarkers() {
        console.log("Updating all map markers for time:", currentTimeHour);
        
        Object.keys(locationMarkers).forEach(locationName => {
            const markers = locationMarkers[locationName];
            if (markers.length === 0) return;
            
            const data = getRainbowDataForTime(locationName, currentTimeHour);
            
            // Update center marker
            const centerMarker = markers[0];
            const centerColor = data ? getColorByRating(data.gridSummary?.recommendLevel || 0) : '#9CA3AF';
            centerMarker.setStyle({
                fillColor: centerColor,
                fillOpacity: 0.9
            });
            
            // Remove existing heatmap layers
            const existingLayers = markers.slice(1);
            existingLayers.forEach(layer => {
                if (rainbowMap.hasLayer(layer)) {
                    rainbowMap.removeLayer(layer);
                }
            });
            
            // Add new heatmap if data exists
            if (data && data.gridPoints) {
                const heatmapData = data.gridPoints.map((point, index) => {
                    const intensity = point.rating / 3;
                    return {
                        lat: point.latitude,
                        lng: point.longitude,
                        value: intensity
                    };
                });
                
                // Add center point
                const centerCoords = locationCoordinates[locationName];
                heatmapData.push({
                    lat: centerCoords[0],
                    lng: centerCoords[1],
                    value: data.gridSummary?.recommendLevel / 3 || 0
                });
                
                // Create individual colored circles for each grid point
                data.gridPoints.forEach((point, index) => {
                    const color = getColorByRating(point.rating);
                    const gridMarker = L.circleMarker([point.latitude, point.longitude], {
                        radius: 10,
                        color: '#ffffff',
                        weight: 3,
                        fillColor: color,
                        fillOpacity: 0.8
                    });
                    
                    // Add popup for grid point
                    const gridPopupContent = `
                        <div class="popup-title">${locationName} - Grid Point ${index + 1}</div>
                        <div class="popup-time">${data.date} at ${data.localEventTime}</div>
                        <div class="popup-probability">Rainbow Probability: ${point.recommendPercentage}%</div>
                        <div class="popup-aod">Air Quality: AOD ${parseFloat(point.airQualityValue).toFixed(3)}</div>
                        <div class="popup-description">${point.qualityDescription}</div>
                    `;
                    
                    gridMarker.bindPopup(gridPopupContent);
                    gridMarker.addTo(rainbowMap);
                    locationMarkers[locationName].push(gridMarker);
                });
            }
        });
    }

    function getRainbowDataForTime(locationName, hour) {
        if (!allMapData[locationName]) return null;
        
        const timeSlotKey = `rainbow_${hour}`;
        console.log(`Looking for ${timeSlotKey} in ${locationName}`);
        return allMapData[locationName][timeSlotKey] || null;
    }

    function getColorByRating(rating) {
        switch (rating) {
            case 3: return '#22C55E'; // Green - High probability
            case 2: return '#F59E0B'; // Yellow - Medium probability
            case 1: return '#EF4444';   // Red - Low probability
            default: return '#9CA3AF'; // Gray - No data
        }
    }

    function createPopupContent(data) {
        const probabilityClass = data.gridSummary?.recommendPercentage >= 66 ? 'high' : 
                                data.gridSummary?.recommendPercentage >= 33 ? 'medium' : 'low';
        
        return `
            <div class="popup-title">${data.locationName}</div>
            <div class="popup-time">${data.date} at ${data.time}</div>
            <div class="popup-probability ${probabilityClass}">Rainbow Probability: ${data.gridSummary?.recommendPercentage || 0}%</div>
            <div class="popup-aod">Air Quality: AOD ${parseFloat(data.gridSummary?.averageAOD || 0).toFixed(3)}</div>
            <div class="popup-description">${data.recommendDescription}</div>
        `;
    }

    // Initialize the application
    init();
}); 