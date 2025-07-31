// sea-of-clouds.js - Sea of Clouds prediction interface
document.addEventListener('DOMContentLoaded', () => {
    let allPredictionData = {};
    let currentForecastData = null; // Store current forecast data for detailed view
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
        await loadPredictionData();
        setupEventListeners();
        updateButtonTexts();
        initInteractiveButtons();
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
        
        locations.forEach(location => {
            const item = document.createElement('div');
            item.className = 'dropdown-item';
            item.textContent = location;
            item.addEventListener('click', () => selectLocation(location));
            locationDropdown.appendChild(item);
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
    }

    // Start the application
    init();
}); 