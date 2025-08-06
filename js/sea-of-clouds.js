// sea-of-clouds.js - Sea of Clouds prediction interface
document.addEventListener('DOMContentLoaded', () => {
    let allPredictionData = {};
    let currentForecastData = null; // Store current forecast data for detailed view
    let locationsPublicData = {}; // Store public location information
    let userSelection = {
        location: null,
        date: null
    };

    // --- DOM Element References ---
    const locationToggle = document.getElementById('location-toggle');
    const locationDropdown = document.getElementById('location-dropdown');
    const dateToggle = document.getElementById('date-toggle');
    const dateDropdown = document.getElementById('date-dropdown');
    const searchButton = document.getElementById('search-button');
    const emptyButton = document.getElementById('empty-button');
    
    const selectedLocationEl = document.getElementById('selected-location');
    const selectedDateEl = document.getElementById('selected-date');
    const coverageDisplayEl = document.getElementById('coverage-display');
    const recommendLevelEl = document.getElementById('recommend-level');
    const recommendDescEl = document.getElementById('recommend-description');
    const peakTimeEl = document.getElementById('peak-time');
    const peakDescEl = document.getElementById('peak-description');
    const regionAreaEl = document.getElementById('region-area');
    const regionDescEl = document.getElementById('region-description');

    // --- Load Public Location Data ---
    async function loadPublicLocationData() {
        try {
            const response = await fetch('../data/locations_public.json?v=' + new Date().getTime());
            const data = await response.json();
            
            // Convert to lookup map for easier access
            data.locations.forEach(location => {
                locationsPublicData[location.key] = location;
                // Also map by display name for easier lookup
                locationsPublicData[location.display_name] = location;
            });
            console.log('Public location data loaded:', Object.keys(locationsPublicData).length / 2, 'locations');
        } catch (error) {
            console.error('Failed to load public location data:', error);
        }
    }

    // --- Update Location Information Panel ---
    function updateLocationInfoPanel(locationKey) {
        // locationKey might be a display name or internal key
        let locationData = locationsPublicData[locationKey];
        
        // If not found by key, try to find by display name
        if (!locationData) {
            locationData = Object.values(locationsPublicData).find(loc => 
                loc.display_name === locationKey || loc.key === locationKey
            );
        }
        
        if (!locationData) {
            // Show hint if no location selected
            document.getElementById('location-selection-hint').style.display = 'block';
            document.getElementById('location-details').style.display = 'none';
            console.log('No location data found for:', locationKey);
            return;
        }

        console.log('Updating location info for:', locationData.display_name);

        // Hide hint and show details
        document.getElementById('location-selection-hint').style.display = 'none';
        document.getElementById('location-details').style.display = 'block';

        // Update header
        document.getElementById('location-detail-name').textContent = locationData.display_name;
        document.getElementById('location-category').textContent = locationData.category;

        // Update geography & elevation
        document.getElementById('elevation-range').textContent = locationData.geography.elevation_range;
        document.getElementById('viewing-height').textContent = locationData.geography.best_viewing_elevation;
        document.getElementById('cloud-zone').textContent = locationData.viewing_info.cloud_formation_zone;
        document.getElementById('analysis-method').textContent = locationData.seasonal_patterns.formation_type;

        // Update seasonal patterns
        document.getElementById('peak-season').textContent = locationData.seasonal_patterns.peak_season;
        document.getElementById('formation-type').textContent = locationData.seasonal_patterns.formation_type;
        document.getElementById('moisture-source').textContent = locationData.seasonal_patterns.moisture_source;

        // Generate seasonal calendar
        generateSeasonalCalendar(locationData.seasonal_patterns.peak_months);
    }

    // --- Generate Seasonal Calendar ---
    function generateSeasonalCalendar(peakMonths) {
        const months = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];
        
        const calendarContainer = document.getElementById('seasonal-calendar');
        calendarContainer.innerHTML = '';

        months.forEach((month, index) => {
            const monthCell = document.createElement('div');
            monthCell.className = 'month-cell';
            monthCell.textContent = month;
            
            // Determine month class based on peak season
            const fullMonthName = new Date(2023, index, 1).toLocaleString('en-US', { month: 'long' });
            if (peakMonths.includes(fullMonthName)) {
                monthCell.classList.add('peak');
                monthCell.title = `Peak season - ${month}`;
            } else {
                // Add some logic for adjacent months
                const adjacentToPeak = peakMonths.some(peakMonth => {
                    const peakIndex = months.findIndex(m => new Date(2023, months.indexOf(m), 1).toLocaleString('en-US', { month: 'long' }) === peakMonth);
                    return Math.abs(peakIndex - index) === 1 || (peakIndex === 0 && index === 11) || (peakIndex === 11 && index === 0);
                });
                
                if (adjacentToPeak) {
                    monthCell.classList.add('good');
                    monthCell.title = `Good conditions - ${month}`;
                } else {
                    monthCell.classList.add('fair');
                    monthCell.title = `Fair conditions - ${month}`;
                }
            }
            
            calendarContainer.appendChild(monthCell);
        });
    }

    // --- Toggle Viewing Section (Collapsible) ---
    window.toggleViewingSection = function(sectionId) {
        const content = document.getElementById(sectionId + '-content');
        const icon = document.getElementById(sectionId + '-icon');
        
        if (content && icon) {
            const isExpanded = content.classList.contains('expanded');
            
            if (isExpanded) {
                // Collapse
                content.classList.remove('expanded');
                icon.classList.remove('rotated');
            } else {
                // Expand
                content.classList.add('expanded');
                icon.classList.add('rotated');
            }
        }
    };

    // --- Update Viewing Tips Panel ---
    function updateViewingTipsPanel(locationKey) {
        // locationKey might be a display name or internal key
        let locationData = locationsPublicData[locationKey];
        
        // If not found by key, try to find by display name
        if (!locationData) {
            locationData = Object.values(locationsPublicData).find(loc => 
                loc.display_name === locationKey || loc.key === locationKey
            );
        }
        
        if (!locationData || !locationData.visiting_tips || !locationData.visiting_tips.viewing_instructions) {
            // Show hint if no location selected or no viewing instructions available
            document.getElementById('viewing-tips-hint').style.display = 'block';
            document.getElementById('viewing-tips-details').style.display = 'none';
            return;
        }

        console.log('Updating viewing tips for:', locationData.display_name);

        // Hide hint and show details
        document.getElementById('viewing-tips-hint').style.display = 'none';
        document.getElementById('viewing-tips-details').style.display = 'block';

        // Reset all sections to collapsed except first one
        const sections = ['see-clouds', 'be-in-clouds', 'photography', 'access-safety'];
        sections.forEach((sectionId, index) => {
            const content = document.getElementById(sectionId + '-content');
            const icon = document.getElementById(sectionId + '-icon');
            
            if (content && icon) {
                if (index === 0) {
                    // First section (see-clouds) starts expanded
                    content.classList.add('expanded');
                    icon.classList.add('rotated');
                } else {
                    // Other sections start collapsed
                    content.classList.remove('expanded');
                    icon.classList.remove('rotated');
                }
            }
        });

        const viewingInstructions = locationData.visiting_tips.viewing_instructions;

        // Update header
        document.getElementById('viewing-location-name').textContent = locationData.display_name + ' Viewing Guide';
        document.getElementById('viewing-best-time').textContent = locationData.visiting_tips.best_time;

        // Update "To See Clouds" section
        if (viewingInstructions.to_see_clouds) {
            const toSee = viewingInstructions.to_see_clouds;
            document.getElementById('viewing-position').textContent = toSee.position || '--';
            document.getElementById('viewing-direction').textContent = toSee.direction || '--';
            document.getElementById('viewing-vantage').textContent = toSee.best_vantage || '--';
            document.getElementById('viewing-description').textContent = toSee.description || '--';
            document.getElementById('viewing-landmarks').textContent = toSee.landmarks || '--';
        }

        // Update "To Be In Clouds" section
        if (viewingInstructions.to_be_in_clouds) {
            const toBeIn = viewingInstructions.to_be_in_clouds;
            document.getElementById('immersion-position').textContent = toBeIn.position || '--';
            document.getElementById('immersion-experience').textContent = toBeIn.experience || '--';
            document.getElementById('immersion-description').textContent = toBeIn.description || '--';
            document.getElementById('fog-thickness').textContent = toBeIn.fog_thickness || '--';
            
            // Update immersion spots
            const spotsContainer = document.getElementById('immersion-spots');
            spotsContainer.innerHTML = '';
            if (toBeIn.immersion_spots && Array.isArray(toBeIn.immersion_spots)) {
                toBeIn.immersion_spots.forEach(spot => {
                    const spotElement = document.createElement('div');
                    spotElement.className = 'spot-item';
                    spotElement.textContent = spot;
                    spotsContainer.appendChild(spotElement);
                });
            }
        }

        // Update Photography Tips section
        if (viewingInstructions.photography_tips) {
            const photoTips = viewingInstructions.photography_tips;
            document.getElementById('sunrise-spot').textContent = photoTips.sunrise_spot || '--';
            document.getElementById('sunset-spot').textContent = photoTips.sunset_spot || '--';
            document.getElementById('photo-equipment').textContent = photoTips.equipment || '--';
        }

        // Update Access & Safety section
        const visitingTips = locationData.visiting_tips;
        document.getElementById('access-routes').textContent = visitingTips.access_routes || '--';
        document.getElementById('parking-info').textContent = visitingTips.parking || '--';
        document.getElementById('equipment-info').textContent = visitingTips.equipment || '--';
    }

    // Global function for monitoring area interaction
    window.toggleRegionDetails = function() {
        const detailsPanel = document.getElementById('region-details');
        const regionAreaEl = document.getElementById('region-area');
        
        if (detailsPanel.style.display === 'none' || !detailsPanel.style.display) {
            detailsPanel.style.display = 'block';
            regionAreaEl.classList.add('active');
        } else {
            detailsPanel.style.display = 'none';
            regionAreaEl.classList.remove('active');
        }
    };

    function getRecommendationColor(level) {
        const colors = {
            1: '#e74c3c',  // Red - Poor
            2: '#f39c12',  // Orange - Fair  
            3: '#f1c40f',  // Yellow - Good
            4: '#27ae60',  // Green - Very Good
            5: '#3498db',  // Blue - Excellent
            6: '#9b59b6'   // Purple - Outstanding
        };
        return colors[level] || '#7f8c8d';
    }

    // Initialize the application
    async function init() {
        console.log('🌊 Initializing Sea of Clouds interface...');
        
        // Load public location data first
        await loadPublicLocationData();
        
        // Load prediction data
        await loadPredictionData();
        
        // Set up UI
        setupEventListeners();
        updateButtonTexts();
        initInteractiveButtons();
        
        console.log('✅ Sea of Clouds interface ready');
    }

    async function loadPredictionData() {
        console.log("Loading sea_of_clouds_results.json...");
        try {
            const response = await fetch(`../data/sea_of_clouds_results.json?v=20250729-3&t=${Date.now()}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            allPredictionData = await response.json();
            console.log("✅ Sea of clouds data loaded successfully:", allPredictionData);
            populateLocationDropdown();
            populateDateDropdown();
        } catch (error) {
            console.error("❌ Failed to load prediction data:", error);
            alert("Error: Unable to load sea of clouds prediction data.");
        }
    }

    function populateLocationDropdown() {
        if (!allPredictionData.predictions || !allPredictionData.predictions.sea_of_clouds) {
            console.error("No sea of clouds data found");
            return;
        }

        const locations = Object.keys(allPredictionData.predictions.sea_of_clouds);
        locationDropdown.innerHTML = '';
        
        // Add search box
        const searchBox = document.createElement('div');
        searchBox.className = 'dropdown-search';
        searchBox.innerHTML = '<input type="text" placeholder="Search locations..." id="location-search-sea-clouds">';
        locationDropdown.appendChild(searchBox);
        
        // Add location items
        locations.forEach(location => {
            const item = document.createElement('div');
            item.className = 'dropdown-item';
            item.textContent = location;
            item.addEventListener('click', () => selectLocation(location));
            locationDropdown.appendChild(item);
        });
        
        // Add search functionality
        const searchInput = document.getElementById('location-search-sea-clouds');
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
    }

    function populateDateDropdown() {
        // Get actual dates from the first location's forecasts instead of metadata
        const locations = Object.keys(allPredictionData.predictions.sea_of_clouds);
        if (locations.length === 0) return;
        
        const firstLocation = allPredictionData.predictions.sea_of_clouds[locations[0]];
        const actualDates = Object.keys(firstLocation.forecasts || {}).sort();
        
        dateDropdown.innerHTML = '';
        
        actualDates.forEach(date => {
            const item = document.createElement('div');
            item.className = 'dropdown-item';
            item.textContent = formatDateDisplay(date);
            item.addEventListener('click', () => selectDate(date));
            dateDropdown.appendChild(item);
        });
        
        console.log("Available dates:", actualDates);
    }

    function formatDateDisplay(dateStr) {
        // 修复：手动解析日期字符串避免时区问题
        const [year, month, day] = dateStr.split('-').map(Number);
        const date = new Date(year, month - 1, day); // month是0-based
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        const formatted = date.toLocaleDateString('en-US', options);
        console.log(`Date formatting: ${dateStr} → ${formatted}`);
        return formatted;
    }

    function selectLocation(location) {
        userSelection.location = location;
        document.getElementById('location-text').textContent = location;
        hideDropdown(locationDropdown);
        updateButtonTexts();
        updateLocationInfoPanel(location); // Update location info panel
        updateViewingTipsPanel(location); // Update viewing tips panel
    }

    function selectDate(date) {
        userSelection.date = date;
        document.getElementById('date-text').textContent = formatDateDisplay(date);
        hideDropdown(dateDropdown);
        updateButtonTexts();
    }

    function setupEventListeners() {
        // Dropdown toggles
        locationToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleDropdown(locationDropdown);
        });

        dateToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleDropdown(dateDropdown);
        });

        // Search button
        searchButton.addEventListener('click', performSearch);

        // Empty button
        emptyButton.addEventListener('click', clearSelections);

        // Close dropdowns when clicking outside
        document.addEventListener('click', () => {
            hideAllDropdowns();
        });
    }

    function toggleDropdown(dropdown) {
        hideAllDropdowns();
        dropdown.classList.add('show');
    }

    function hideDropdown(dropdown) {
        dropdown.classList.remove('show');
    }

    function hideAllDropdowns() {
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.classList.remove('show');
        });
    }

    function updateButtonTexts() {
        if (!userSelection.location) {
            document.getElementById('location-text').textContent = 'Choose Location';
        }
        if (!userSelection.date) {
            document.getElementById('date-text').textContent = 'Choose Date';
        }
    }

    function clearSelections() {
        userSelection = { location: null, date: null };
        document.getElementById('location-text').textContent = 'Choose Location';
        document.getElementById('date-text').textContent = 'Choose Date';
        clearDisplay();
    }

    function clearDisplay() {
        selectedLocationEl.textContent = 'Location';
        selectedDateEl.textContent = 'Date';
        coverageDisplayEl.textContent = '--';
        recommendLevelEl.innerHTML = '--';
        recommendDescEl.textContent = 'Please select location and date';
        peakTimeEl.textContent = '--:--';
        peakDescEl.textContent = 'Peak coverage time information';
        regionAreaEl.textContent = '--';
        regionDescEl.textContent = 'Total monitoring area information';
    }

    function performSearch() {
        if (!userSelection.location || !userSelection.date) {
            alert('Please select both location and date.');
            return;
        }

        console.log("Searching for:", userSelection.location, userSelection.date);

        const locationData = allPredictionData.predictions.sea_of_clouds[userSelection.location];
        if (!locationData) {
            alert('No data found for selected location.');
            return;
        }

        const dateData = locationData.forecasts[userSelection.date];
        if (!dateData) {
            alert(`No forecast data found for ${userSelection.location} on ${formatDateDisplay(userSelection.date)}. This location may not have data for the selected date.`);
            return;
        }

        console.log("Found data:", dateData);
        displayData(locationData, dateData);
    }

    function displayData(locationData, dateData) {
        // Store data for detailed view
        currentForecastData = dateData;
        
        console.log("Displaying data for:", dateData.date, dateData.dayOfWeek);
        console.log("Summary:", dateData.summary);
        
        // Update header
        selectedLocationEl.textContent = userSelection.location;
        selectedDateEl.textContent = formatDateDisplay(userSelection.date);

        // Update coverage display - format to 1 decimal place
        const coverage = parseFloat(dateData.summary.averageCoverage).toFixed(1);
        coverageDisplayEl.textContent = `${coverage}%`;
        
        // Update coverage circle
        const coverageCircle = document.querySelector('.coverage-circle');
        if (coverageCircle) {
            const angle = (parseFloat(coverage) / 100) * 360;
            coverageCircle.style.setProperty('--coverage-angle', `${angle}deg`);
            const span = coverageCircle.querySelector('span');
            if (span) span.textContent = `${coverage}%`;
        }

        // Update recommendation level
        const recommendLevel = dateData.summary.recommendLevel;
        const recommendPercentage = dateData.summary.recommendPercentage;
        
        console.log("Recommendation:", recommendLevel, recommendPercentage + "%", dateData.summary.recommendDescription);
        
        recommendLevelEl.innerHTML = `
            <div class="coverage-circle" style="--coverage-angle: ${(recommendPercentage / 100) * 360}deg;">
                <span>${recommendPercentage}%</span>
            </div>
        `;
        recommendDescEl.textContent = dateData.summary.recommendDescription;
        // Removed force blue color - now using CSS white color

        // Update peak time
        peakTimeEl.textContent = dateData.summary.peakCoverageTime;
        peakDescEl.textContent = `Peak coverage of ${parseFloat(dateData.summary.peakCoverageArea).toFixed(1)} km² (${parseFloat(dateData.summary.peakCoveragePercentage).toFixed(1)}%) expected`;

        // Update region info
        const regionInfo = locationData.region_info;
        regionAreaEl.innerHTML = `${regionInfo.total_area_km2} km² <span class="expand-icon">▼</span>`;
        regionDescEl.textContent = `Grid: ${regionInfo.grid_size} (${regionInfo.total_grid_points} points) - Click for details`;

        // Prepare detailed hourly statistics
        updateHourlyStatistics(dateData);

        // Update daily forecast in interactive section
        updateDailyForecast(locationData);
    }

    function updateHourlyStatistics(dateData) {
        const hourlyStatsEl = document.getElementById('hourly-stats');
        if (!hourlyStatsEl || !dateData.hourlyData) return;

        let html = '';

        // Show all 24 hours
        if (dateData.hourlyData.length === 0) {
            html = '<div class="hourly-stat"><div class="time">No data available</div></div>';
        } else {
            dateData.hourlyData.forEach(hourData => {
                const time = hourData.time;
                html += `
                    <div class="hourly-stat">
                        <div class="time">${time}</div>
                        <div class="coverage">${hourData.coverage_percentage.toFixed(1)}%</div>
                        <div class="area">${hourData.area_km2.toFixed(1)} km²</div>
                    </div>
                `;
            });
        }

        hourlyStatsEl.innerHTML = html;
    }

    function updateDailyForecast(locationData) {
        const forecastPanel = document.getElementById('forecast-panel');
        if (!forecastPanel) return;

        let html = '<h3>Daily Forecast Summary</h3>';
        html += '<div class="daily-cards">';

        Object.entries(locationData.forecasts).forEach(([date, forecast]) => {
            const dateObj = new Date(date);
            const formattedDate = dateObj.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                weekday: 'short'
            });

            html += `
                <div class="daily-card">
                    <h4>${formattedDate}</h4>
                    <div class="coverage-stat">
                        <span>Average Coverage:</span>
                        <span>${forecast.summary.averageCoverage}%</span>
                    </div>
                    <div class="coverage-stat">
                        <span>Peak Time:</span>
                        <span>${forecast.summary.peakCoverageTime}</span>
                    </div>
                    <div class="coverage-stat">
                        <span>Peak Coverage:</span>
                        <span>${forecast.summary.peakCoveragePercentage}%</span>
                    </div>
                    <div class="coverage-stat">
                        <span>Recommendation:</span>
                        <span>${forecast.summary.recommendPercentage}%</span>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        forecastPanel.innerHTML = html;
    }

    function initInteractiveButtons() {
        const buttons = document.querySelectorAll('.info-btn');
        const panels = document.querySelectorAll('.content-panel');

        buttons.forEach(button => {
            button.addEventListener('click', () => {
                const targetId = button.getAttribute('data-target');
                
                // Update button states
                buttons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Update panel visibility
                panels.forEach(panel => panel.classList.remove('active'));
                const targetPanel = document.getElementById(targetId);
                if (targetPanel) {
                    targetPanel.classList.add('active');
                }
            });
        });

        // Show first panel by default
        if (buttons.length > 0 && panels.length > 0) {
            buttons[0].classList.add('active');
            panels[0].classList.add('active');
        }

        // Initialize collapsible sections
        initializeCollapsibleSections();
    }

    // --- Initialize Collapsible Sections ---
    function initializeCollapsibleSections() {
        const sections = ['see-clouds', 'be-in-clouds', 'photography', 'access-safety'];
        sections.forEach((sectionId, index) => {
            const content = document.getElementById(sectionId + '-content');
            const icon = document.getElementById(sectionId + '-icon');
            
            if (content && icon) {
                if (index === 0) {
                    // First section (see-clouds) starts expanded
                    content.classList.add('expanded');
                    icon.classList.add('rotated');
                } else {
                    // Other sections start collapsed
                    content.classList.remove('expanded');
                    icon.classList.remove('rotated');
                }
            }
        });
    }

    // Start the application
    init();
});
