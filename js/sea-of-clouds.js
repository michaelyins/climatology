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
    const recLevelDisplayEl = document.getElementById('rec-level-display');
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

    // --- Update Multi-Day Forecast Panel ---
    function updateMultiDayForecast(locationKey) {
        console.log('updateMultiDayForecast called with:', locationKey);
        
        // locationKey might be a display name or internal key
        let locationData = locationsPublicData[locationKey];
        
        // If not found by key, try to find by display name with smart matching
        if (!locationData) {
            locationData = Object.values(locationsPublicData).find(loc => {
                // Exact match
                if (loc.display_name === locationKey || loc.key === locationKey) {
                    return true;
                }
                
                // Smart matching for common variations
                const normalizedKey = locationKey.toLowerCase().replace(/[.,]/g, '').trim();
                const normalizedDisplay = loc.display_name.toLowerCase().replace(/[.,]/g, '').trim();
                
                // Handle common abbreviations
                if (normalizedKey.includes('mt.') && normalizedDisplay.includes('mount')) {
                    return true;
                }
                if (normalizedKey.includes('mount') && normalizedDisplay.includes('mt.')) {
                    return true;
                }
                
                // Handle "National Park" vs "NP" variations
                if (normalizedKey.includes('np') && normalizedDisplay.includes('national park')) {
                    return true;
                }
                
                // Partial matching for similar names
                return normalizedKey.includes(normalizedDisplay) || normalizedDisplay.includes(normalizedKey);
            });
        }
        
        if (!locationData) {
            console.log('No location data found for:', locationKey);
            // Show hint if no location selected
            const forecastHint = document.getElementById('forecast-selection-hint');
            const forecastDetails = document.getElementById('forecast-details');
            
            if (forecastHint) forecastHint.style.display = 'block';
            if (forecastDetails) forecastDetails.style.display = 'none';
            return;
        }

        console.log('Updating multi-day forecast for:', locationData.display_name);

        // Hide hint and show details
        const forecastHint = document.getElementById('forecast-selection-hint');
        const forecastDetails = document.getElementById('forecast-details');
        
        if (forecastHint) forecastHint.style.display = 'none';
        if (forecastDetails) forecastDetails.style.display = 'block';

        // Update header
        const forecastLocationNameEl = document.getElementById('forecast-location-name');
        if (forecastLocationNameEl) forecastLocationNameEl.textContent = locationData.display_name;
        
        const forecastDateRangeEl = document.getElementById('forecast-date-range');
        if (forecastDateRangeEl) forecastDateRangeEl.textContent = '2-Day Forecast';

        // Generate daily forecast cards
        generateDailyForecastCards(locationData);
    }

    // --- Generate Daily Forecast Cards ---
    function generateDailyForecastCards(locationData) {
        const dailyForecastGrid = document.getElementById('daily-forecast-grid');
        if (!dailyForecastGrid) return;

        // Get real forecast data from allPredictionData
        if (!allPredictionData || !allPredictionData.predictions || !allPredictionData.predictions.sea_of_clouds) {
            console.log('No prediction data available for multi-day forecast');
            return;
        }

        const locationKey = locationData.display_name || locationData.key;
        const locationForecasts = allPredictionData.predictions.sea_of_clouds[locationKey];
        
        if (!locationForecasts || !locationForecasts.forecasts) {
            console.log('No forecast data found for location:', locationKey);
            return;
        }

        // Get available dates and sort them
        const availableDates = Object.keys(locationForecasts.forecasts).sort();
        console.log('Available forecast dates for', locationKey, ':', availableDates);

        // Show up to 2 days of forecast data
        const datesToShow = availableDates.slice(0, 2);
        
        let html = '';
        datesToShow.forEach(dateStr => {
            const forecastData = locationForecasts.forecasts[dateStr];
            const summary = forecastData.summary;
            
            // Format date
            const dateObj = new Date(dateStr);
            const formattedDate = dateObj.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                weekday: 'short'
            });

            // Get day name
            const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

            html += `
                <div class="daily-forecast-card">
                    <h5>${formattedDate}</h5>
                    <div class="forecast-metrics">
                        <div class="forecast-metric">
                            <span class="forecast-metric-label">AVG Probability</span>
                            <span class="forecast-metric-value">${(summary.avg_probability * 100).toFixed(1)}%</span>
                        </div>
                        <div class="forecast-metric">
                            <span class="forecast-metric-label">AVG Quality</span>
                            <span class="forecast-metric-value">${(summary.avg_quality * 100).toFixed(1)}%</span>
                        </div>
                        <div class="forecast-metric">
                            <span class="forecast-metric-label">AVG AOD</span>
                            <span class="forecast-metric-value">${summary.avg_aod.toFixed(3)}</span>
                        </div>
                        <div class="forecast-metric">
                            <span class="forecast-metric-label">Day</span>
                            <span class="forecast-metric-value">${dayName}</span>
                        </div>
                    </div>
                    <div class="forecast-recommendation">
                        <span class="forecast-recommendation-label">Recommendation:</span>
                        <p class="forecast-recommendation-text">${summary.recommendationDescription || 'No specific recommendation available.'}</p>
                    </div>
                </div>
            `;
        });

        dailyForecastGrid.innerHTML = html;
    }

    // Global function for monitoring area interaction
    window.toggleRegionDetails = function() {
        const detailsPanel = document.getElementById('region-details');
        const avgProbabilityEl = document.getElementById('avg-probability');
        const expandIcon = avgProbabilityEl.querySelector('.expand-icon');
        
        if (detailsPanel.style.display === 'none' || !detailsPanel.style.display) {
            detailsPanel.style.display = 'block';
            if (expandIcon) {
                expandIcon.style.transform = 'rotate(180deg)';
            }
            // 添加active类来保持高亮状态
            avgProbabilityEl.classList.add('active');
        } else {
            detailsPanel.style.display = 'none';
            if (expandIcon) {
                expandIcon.style.transform = 'rotate(0deg)';
            }
            // 移除active类
            avgProbabilityEl.classList.remove('active');
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
        console.log("Loading sea of clouds prediction data from data directory...");
        try {
            // 优先读取data目录中的集成数据
            const response = await fetch(`../data/sea_of_clouds_results.json?v=${Date.now()}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            allPredictionData = await response.json();
            console.log("✅ Sea of clouds prediction data loaded successfully from data directory:", allPredictionData);
            populateLocationDropdown();
            populateDateDropdown();
        } catch (error) {
            console.error("❌ Failed to load prediction data from data directory:", error);
            // 如果data目录中没有数据，尝试读取云海目录中的最新文件
            try {
                console.log("Trying to load from 云海 directory as fallback...");
                const fallbackResponse = await fetch(`../云海/data_final/master_forecast_20250812.json?v=${Date.now()}`);
                if (!fallbackResponse.ok) throw new Error(`HTTP error! status: ${fallbackResponse.status}`);
                allPredictionData = await fallbackResponse.json();
                console.log("✅ Fallback data loaded successfully:", allPredictionData);
                populateLocationDropdown();
                populateDateDropdown();
            } catch (fallbackError) {
                console.error("❌ Failed to load fallback data:", fallbackError);
                alert("Error: Unable to load sea of clouds prediction data from any source.");
            }
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
        updateMultiDayForecast(location); // Update multi-day forecast panel
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
        
        // Clear AVG Probability (now as clickable text)
        const avgProbabilityEl = document.getElementById('avg-probability');
        if (avgProbabilityEl) {
            avgProbabilityEl.innerHTML = '--% <span class="expand-icon">▼</span>';
        }
        
        // Clear AVG Probability description
        const avgProbabilityDescEl = document.getElementById('avg-probability-description');
        if (avgProbabilityDescEl) {
            avgProbabilityDescEl.textContent = 'Select location and date to view prediction';
        }
        
        // Clear AVG Quality
        const avgQualityEl = document.getElementById('avg-quality');
        if (avgQualityEl) {
            avgQualityEl.textContent = '--%';
        }
        
        // Clear AVG AOD
        const avgAodEl = document.getElementById('avg-aod');
        if (avgAodEl) {
            avgAodEl.textContent = '--';
        }
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

        // Update AVG Probability (now as clickable text)
        const avgProbability = dateData.summary.avg_probability || 0;
        const avgProbabilityEl = document.getElementById('avg-probability');
        if (avgProbabilityEl) {
            avgProbabilityEl.innerHTML = `${(avgProbability * 100).toFixed(1)}% <span class="expand-icon">▼</span>`;
        }
        
        // Update AVG Probability description
        const avgProbabilityDescEl = document.getElementById('avg-probability-description');
        if (avgProbabilityDescEl) {
            avgProbabilityDescEl.textContent = dateData.summary.recommendationDescription || 'Select location and date to view prediction';
        }

        // Update AVG Quality
        const avgQuality = dateData.summary.avg_quality || 0;
        const avgQualityEl = document.getElementById('avg-quality');
        if (avgQualityEl) {
            avgQualityEl.textContent = `${(avgQuality * 100).toFixed(1)}%`;
        }

        // Update AVG AOD
        const avgAod = dateData.summary.avg_aod || 0;
        const avgAodEl = document.getElementById('avg-aod');
        if (avgAodEl) {
            avgAodEl.textContent = avgAod.toFixed(3);
        }

        // Update hourly statistics
        updateHourlyStatistics(dateData);
    }

    function updateHourlyStatistics(dateData) {
        const hourlyStatsEl = document.getElementById('hourly-stats');
        if (!hourlyStatsEl || !dateData.hourlyData) return;

        // Show all hours from 00:00 to 23:00 (24 hours total)
        if (dateData.hourlyData.length === 0) {
            hourlyStatsEl.innerHTML = '<div class="hourly-stat"><div class="time">No data available</div></div>';
            return;
        }

        // Create a complete 24-hour grid from 00:00 to 23:00
        const hours = [];
        for (let i = 0; i <= 23; i++) {
            const hourStr = i.toString().padStart(2, '0') + ':00';
            const hourData = dateData.hourlyData.find(h => h.time === hourStr);
            
            if (hourData) {
                hours.push({
                    time: hourStr,
                    probability: hourData.probability || 0,
                    quality_score: hourData.quality_score || 0,
                    cloud_top_asl: hourData.cloud_top_asl || 0
                });
            } else {
                // If no data for this hour, create placeholder
                hours.push({
                    time: hourStr,
                    probability: 0,
                    quality_score: 0,
                    cloud_top_asl: 0
                });
            }
        }
        
        let html = '';
        hours.forEach(hourData => {
            const time = hourData.time;
            const probability = hourData.probability || 0;
            const quality = hourData.quality_score || 0;
            const cloudTop = hourData.cloud_top_asl || 0;
            
            // Format values with proper handling of 0/null values
            const probDisplay = probability > 0 ? `${(probability * 100).toFixed(1)}%` : 'N/A';
            const qualityDisplay = quality > 0 ? quality.toFixed(4) : 'N/A';
            const cloudTopDisplay = cloudTop > 0 ? `${cloudTop}m` : 'N/A';
            
            // Determine color class based on probability
            let colorClass = '';
            if (probability > 0) {
                const probPercent = probability * 100;
                if (probPercent >= 70) {
                    colorClass = 'high-probability';
                } else if (probPercent >= 40) {
                    colorClass = 'medium-probability';
                } else {
                    colorClass = 'low-probability';
                }
            }
            
            html += `
                <div class="hourly-stat ${colorClass}">
                    <div class="time">${time}</div>
                    <div class="data-content">
                        <div>P: ${probDisplay}</div>
                        <div>Q: ${qualityDisplay}</div>
                        <div>H: ${cloudTopDisplay}</div>
                    </div>
                </div>
            `;
        });

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
