// stargazing.js - Stargazing prediction model frontend
document.addEventListener('DOMContentLoaded', () => {
    let allStargazingData = {};
    let userSelection = {
        location: null
    };

    // --- DOM Element References ---
    const locationToggle = document.getElementById('location-toggle');
    const locationDropdown = document.getElementById('location-dropdown');
    const searchButton = document.getElementById('search-button');
    const emptyButton = document.getElementById('empty-button');
    
    const selectedLocationEl = document.getElementById('selected-location');
    const selectedDateEl = document.getElementById('selected-date');
    const selectedConditionsEl = document.getElementById('selected-conditions');
    
    // Astronomical Info Elements
    const darkStartTimeEl = document.getElementById('dark-start-time');
    const darkEndTimeEl = document.getElementById('dark-end-time');
    const milkyWayRiseEl = document.getElementById('milky-way-rise');
    const milkyWaySetEl = document.getElementById('milky-way-set');
    const moonPhaseEl = document.getElementById('moon-phase');
    const moonIlluminationEl = document.getElementById('moon-illumination');
    const moonRiseTimeEl = document.getElementById('moon-rise-time');
    const moonSetTimeEl = document.getElementById('moon-set-time');
    const bortleClassEl = document.getElementById('bortle-class');
    const optimalTimeRangeEl = document.getElementById('optimal-time-range');
    
    // Weather Condition Elements
    const cloudRatingEl = document.getElementById('cloud-rating');
    const cloudDetailEl = document.getElementById('cloud-detail');
    const transparencyRatingEl = document.getElementById('transparency-rating');
    const transparencyDetailEl = document.getElementById('transparency-detail');
    const seeingRatingEl = document.getElementById('seeing-rating');
    const seeingDetailEl = document.getElementById('seeing-detail');
    const dewRatingEl = document.getElementById('dew-rating');
    const dewDetailEl = document.getElementById('dew-detail');
    
    // Overall Rating Elements
    const overallPercentageEl = document.getElementById('overall-percentage');
    const overallDescriptionEl = document.getElementById('overall-description');
    const recommendationTextEl = document.getElementById('recommendation-text');
    
    // Initialize the application
    async function init() {
        console.log("🚀 Stargazing page initialization started...");
        console.log("📍 DOM elements check:");
        console.log("- selectedLocationEl:", selectedLocationEl);
        console.log("- optimalTimeRangeEl:", optimalTimeRangeEl);
        console.log("- moonRiseTimeEl:", moonRiseTimeEl);
        console.log("- moonSetTimeEl:", moonSetTimeEl);
        
        await loadStargazingData();
        setupEventListeners();
        updateButtonTexts();
        console.log("✅ Stargazing page initialization completed!");
    }

    async function loadStargazingData() {
        console.log("Loading stargazing_daily.json...");
        try {
            const response = await fetch('../data/stargazing_daily.json?v=' + new Date().getTime());
            console.log("📡 Fetch response status:", response.status, response.statusText);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            allStargazingData = await response.json();
            console.log("✅ Stargazing data loaded successfully:");
            console.log("📊 Number of locations:", Object.keys(allStargazingData).length);
            console.log("📍 First few locations:", Object.keys(allStargazingData).slice(0, 3));
            console.log("🔍 Sample data structure:", allStargazingData[Object.keys(allStargazingData)[0]]);
            populateLocationDropdown();
        } catch (error) {
            console.error("❌ Failed to load stargazing data:", error);
            alert("Error: Unable to load stargazing prediction data.");
        }
    }

    function populateLocationDropdown() {
        console.log("🏗️ Populating location dropdown...");
        console.log("📋 locationDropdown element:", locationDropdown);
        locationDropdown.innerHTML = '';
        const locations = Object.keys(allStargazingData);
        console.log("📍 Available locations:", locations.length);
        if (locations.length === 0) {
            locationDropdown.innerHTML = '<div class="dropdown-item">No available locations</div>';
            return;
        }
        
        // Add search box
        const searchBox = document.createElement('div');
        searchBox.className = 'dropdown-search';
        searchBox.innerHTML = '<input type="text" placeholder="Search dark sky locations..." id="location-search-stargazing">';
        locationDropdown.appendChild(searchBox);
        
        // Sort locations alphabetically for better UX and add them
        locations.sort().forEach(location => {
            const item = document.createElement('div');
            item.className = 'dropdown-item';
            item.setAttribute('data-value', location);
            item.textContent = location;
            locationDropdown.appendChild(item);
        });
        
        // Add search functionality
        const searchInput = document.getElementById('location-search-stargazing');
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
        
        console.log("✅ Location dropdown populated with:", locations.length, "locations");
    }

    function setupEventListeners() {
        // Location Toggle
        locationToggle.addEventListener('click', (e) => {
            e.preventDefault();
            toggleDropdown(locationDropdown);
        });

        // Location dropdown items
        locationDropdown.addEventListener('click', (e) => {
            if (e.target.classList.contains('dropdown-item')) {
                const value = e.target.getAttribute('data-value');
                userSelection.location = value;
                document.getElementById('location-text').textContent = value;
                closeAllDropdowns();
                console.log("Location selected:", value);
            }
        });

        // Search button
        searchButton.addEventListener('click', () => {
            searchStargazingReports();
        });

        // Empty button
        emptyButton.addEventListener('click', () => {
            resetSelection();
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.control-button')) {
                closeAllDropdowns();
            }
        });
    }

    function toggleDropdown(dropdown) {
        closeAllDropdowns();
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    }

    function closeAllDropdowns() {
        [locationDropdown].forEach(dropdown => {
            if (dropdown) dropdown.style.display = 'none';
        });
    }

    function updateButtonTexts() {
        document.getElementById('location-text').textContent = userSelection.location || 'Choose Dark Sky Location';
    }

    function searchStargazingReports() {
        if (!userSelection.location) {
            alert("Please select a dark sky location first.");
            return;
        }

        console.log("Searching stargazing data for:", userSelection.location);

        const locationData = allStargazingData[userSelection.location];
        if (!locationData) {
            console.error("No data found for location:", userSelection.location);
            displayNoData();
            return;
        }

        console.log("Found stargazing data:", locationData);
        displayStargazingData(locationData);
    }

    function displayStargazingData(data) {
        // Update header information
        selectedLocationEl.textContent = data.locationName || userSelection.location;
        selectedDateEl.textContent = data.date || 'Unknown';
        selectedConditionsEl.textContent = `${data.overallRating.description || 'Unknown'} (${data.overallRating.percentage || '--'}%)`;
        
        // Update observation window
        if (data.astronomicalInfo.darkStart && data.astronomicalInfo.darkEnd) {
            darkStartTimeEl.textContent = data.astronomicalInfo.darkStart;
        } else {
            darkStartTimeEl.textContent = '--:--';
        }

        // Update astronomical info
        darkStartTimeEl.textContent = data.astronomicalInfo.darkStart || '--:--';
        darkEndTimeEl.textContent = data.astronomicalInfo.darkEnd || '--:--';
        milkyWayRiseEl.textContent = data.astronomicalInfo.milkyWayRise || '--:--';
        milkyWaySetEl.textContent = data.astronomicalInfo.milkyWaySet || '--:--';
        moonPhaseEl.textContent = data.astronomicalInfo.moonPhase || '--';
        moonIlluminationEl.textContent = data.astronomicalInfo.moonIllumination !== undefined ? 
            `${data.astronomicalInfo.moonIllumination}%` : '--%';
        moonRiseTimeEl.textContent = data.astronomicalInfo.moonrise || '--:--';
        moonSetTimeEl.textContent = data.astronomicalInfo.moonset || '--:--';
        bortleClassEl.textContent = data.bortleClass !== undefined ? 
            `Class ${data.bortleClass}` : '--';
        optimalTimeRangeEl.textContent = data.astronomicalInfo.optimalTimeRange || '--';

        // Update weather conditions
        updateWeatherCondition(cloudRatingEl, cloudDetailEl, 
            data.weatherConditions.cloudCover.rating,
            `${data.weatherConditions.cloudCover.averagePercentage || '--'}% average`);
        
        updateWeatherCondition(transparencyRatingEl, transparencyDetailEl,
            data.weatherConditions.transparency.rating,
            `${data.weatherConditions.transparency.visibilityKm || '--'} km visibility`);
        
        updateWeatherCondition(seeingRatingEl, seeingDetailEl,
            data.weatherConditions.seeing.rating,
            `CAPE: ${data.weatherConditions.seeing.maxCape || '--'}`);
        
        updateWeatherCondition(dewRatingEl, dewDetailEl,
            data.weatherConditions.dewRisk.rating,
            `${data.weatherConditions.dewRisk.minTemperatureSpread || '--'}°C spread`);

        // Update overall rating
        overallPercentageEl.textContent = data.overallRating.percentage !== undefined ? 
            `${data.overallRating.percentage}%` : '--%';
        overallDescriptionEl.textContent = data.overallRating.description || '--';
        recommendationTextEl.textContent = data.overallRating.recommendation || 
            'No recommendation available.';

        // Update rating circle color based on percentage
        updateRatingCircleColor(data.overallRating.percentage);

        console.log("Stargazing data displayed successfully");
    }

    function updateWeatherCondition(ratingEl, detailEl, rating, detail) {
        ratingEl.textContent = rating || '--';
        detailEl.textContent = detail || '--';
        
        // Update rating color class
        ratingEl.className = 'condition-rating';
        if (rating) {
            const ratingClass = rating.toLowerCase().replace(/\s+/g, '');
            if (ratingClass.includes('excellent')) {
                ratingEl.classList.add('excellent');
            } else if (ratingClass.includes('good')) {
                ratingEl.classList.add('good');
            } else if (ratingClass.includes('fair') || ratingClass.includes('moderate')) {
                ratingEl.classList.add('fair');
            } else {
                ratingEl.classList.add('poor');
            }
        }
    }

    function updateRatingCircleColor(percentage) {
        const ratingCircle = document.querySelector('.rating-circle');
        if (!ratingCircle || percentage === undefined) return;

        // Remove existing color classes
        ratingCircle.className = 'rating-circle';
        
        // Add color class based on percentage
        if (percentage >= 85) {
            ratingCircle.style.background = 'linear-gradient(135deg, #00ff88, #00cc6a)';
            ratingCircle.style.boxShadow = '0 0 30px rgba(0, 255, 136, 0.4)';
        } else if (percentage >= 70) {
            ratingCircle.style.background = 'linear-gradient(135deg, #4c90ff, #6b5aed)';
            ratingCircle.style.boxShadow = '0 0 30px rgba(76, 144, 255, 0.4)';
        } else if (percentage >= 55) {
            ratingCircle.style.background = 'linear-gradient(135deg, #ffaa00, #ff8c00)';
            ratingCircle.style.boxShadow = '0 0 30px rgba(255, 170, 0, 0.4)';
        } else {
            ratingCircle.style.background = 'linear-gradient(135deg, #ff6b6b, #ee5a52)';
            ratingCircle.style.boxShadow = '0 0 30px rgba(255, 107, 107, 0.4)';
        }
    }

    function displayNoData() {
        selectedLocationEl.textContent = 'Dark Sky Location';
        selectedDateEl.textContent = 'Date';
        selectedConditionsEl.textContent = 'Stargazing Conditions';
        
        // Reset astronomical info
        darkStartTimeEl.textContent = '--:--';
        darkEndTimeEl.textContent = '--:--';
        milkyWayRiseEl.textContent = '--:--';
        milkyWaySetEl.textContent = '--:--';
        moonPhaseEl.textContent = '--';
        moonIlluminationEl.textContent = '--%';
        moonRiseTimeEl.textContent = '--:--';
        moonSetTimeEl.textContent = '--:--';
        bortleClassEl.textContent = '--';
        optimalTimeRangeEl.textContent = '--';
        
        // Reset weather conditions
        [cloudRatingEl, transparencyRatingEl, seeingRatingEl, dewRatingEl].forEach(el => {
            el.textContent = '--';
            el.className = 'condition-rating';
        });
        
        [cloudDetailEl, transparencyDetailEl, seeingDetailEl, dewDetailEl].forEach(el => {
            el.textContent = '--';
        });
        
        // Reset overall rating
        overallPercentageEl.textContent = '--%';
        overallDescriptionEl.textContent = '--';
        recommendationTextEl.textContent = 'Select a location to view stargazing conditions.';
        
        // Reset rating circle
        const ratingCircle = document.querySelector('.rating-circle');
        if (ratingCircle) {
            ratingCircle.style.background = 'linear-gradient(135deg, #4c90ff, #6b5aed)';
            ratingCircle.style.boxShadow = '0 0 30px rgba(76, 144, 255, 0.4)';
        }
        
        alert("We don't have data for this location. Please try a different selection.");
    }

    function resetSelection() {
        userSelection = {
            location: null
        };
        
        updateButtonTexts();
        displayNoData();
        console.log("Selection reset");
    }

    // Interactive buttons functionality
    function initInteractiveButtons() {
        const buttons = document.querySelectorAll('.info-btn');
        const contentPanels = document.querySelectorAll('.content-panel');

        buttons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons and panels
                buttons.forEach(btn => btn.classList.remove('active'));
                contentPanels.forEach(panel => panel.classList.remove('active'));

                // Add active class to clicked button
                button.classList.add('active');

                // Show corresponding content panel
                const contentType = button.getAttribute('data-content');
                const targetPanel = document.getElementById(`${contentType}-content`);
                if (targetPanel) {
                    targetPanel.classList.add('active');
                }

                // Initialize workflow diagram if workflow button is clicked
                if (contentType === 'workflow') {
                    setTimeout(() => {
                        initWorkflowDiagram();
                    }, 100);
                }
            });
        });

        // Initialize workflow diagram on page load
        setTimeout(() => {
            initWorkflowDiagram();
        }, 500);
    }

    // Initialize Mermaid workflow diagram
    function initWorkflowDiagram() {
        const workflowContainer = document.getElementById('workflow-mermaid');
        if (!workflowContainer || workflowContainer.querySelector('svg')) {
            return; // Already initialized
        }

        // Initialize Mermaid with dark theme configuration
        mermaid.initialize({
            startOnLoad: true,
            theme: 'dark',
            flowchart: {
                useMaxWidth: true,
                htmlLabels: true,
                curve: 'basis'
            },
            themeVariables: {
                primaryColor: '#1a1a2e',
                primaryTextColor: '#e6e6ff',
                primaryBorderColor: '#4c90ff',
                lineColor: '#4c90ff',
                secondaryColor: '#16213e',
                tertiaryColor: '#0a0a1a',
                background: 'transparent',
                mainBkg: '#1a1a2e',
                secondBkg: '#16213e',
                tertiaryColor: '#0a0a1a'
            }
        });

        // Define the stargazing observation workflow diagram
        const workflowDefinition = `
        flowchart LR
            A["Check Weather<br/>Forecast<br/>🌤️"] --> B["Evaluate<br/>Dark Sky Site<br/>🏞️"]
            
            B --> C["Cloud Cover<br/>< 15%<br/>✨"]
            B --> D["Cloud Cover<br/>15-50%<br/>⛅"]
            B --> E["Cloud Cover<br/>> 50%<br/>☁️"]
            
            C --> F["Check<br/>Transparency<br/>👁️"]
            D --> G["Partial Viewing<br/>Possible<br/>⚠️"]
            E --> H["Consider<br/>Postponing<br/>❌"]
            
            F --> I["Seeing<br/>Conditions<br/>🔭"]
            I --> J["Excellent Seeing<br/>Planetary Work<br/>🪐"]
            I --> K["Good Seeing<br/>Deep Sky<br/>🌌"]
            
            G --> L["Weather Gaps<br/>Quick Setup<br/>⚡"]
            
            J --> M["High Magnification<br/>Double Stars<br/>⭐"]
            K --> N["Wide Field<br/>Galaxies & Nebulae<br/>🌠"]
            L --> O["Bright Objects<br/>Moon & Planets<br/>🌙"]
            
            M --> P["Perfect Night<br/>for Astronomy<br/>🎯"]
            N --> P
            O --> Q["Limited Session<br/>Enjoy What's Visible<br/>✅"]
        `;

        // Render the diagram
        try {
            mermaid.render('stargazing-workflow-graph', workflowDefinition).then(result => {
                workflowContainer.innerHTML = result.svg;
            }).catch(error => {
                console.error('Error rendering Mermaid diagram:', error);
                workflowContainer.innerHTML = '<p style="color: #4c90ff; text-align: center; padding: 2rem;">Error loading workflow diagram. Please refresh the page.</p>';
            });
        } catch (error) {
            console.error('Mermaid initialization error:', error);
            workflowContainer.innerHTML = '<p style="color: #4c90ff; text-align: center; padding: 2rem;">Workflow diagram temporarily unavailable.</p>';
        }
    }

    // Helper function to format time for display
    function formatTime(timeString) {
        if (!timeString) return '--:--';
        
        try {
            // Assume timeString is in HH:MM format
            const [hours, minutes] = timeString.split(':');
            const hour24 = parseInt(hours, 10);
            const ampm = hour24 >= 12 ? 'PM' : 'AM';
            const hour12 = hour24 % 12 || 12;
            return `${hour12}:${minutes} ${ampm}`;
        } catch (error) {
            console.error('Error formatting time:', error);
            return timeString; // Return original if formatting fails
        }
    }

    // Helper function to get moon phase emoji
    function getMoonPhaseEmoji(phase) {
        const phases = {
            'New Moon': '🌑',
            'Waxing Crescent': '🌒',
            'First Quarter': '🌓',
            'Waxing Gibbous': '🌔',
            'Full Moon': '🌕',
            'Waning Gibbous': '🌖',
            'Last Quarter': '🌗',
            'Waning Crescent': '🌘'
        };
        return phases[phase] || '🌙';
    }

    // Helper function to get Bortle class description
    function getBortleDescription(bortleClass) {
        const descriptions = {
            1: 'Pristine Dark Sky',
            2: 'Typical Dark Sky',
            3: 'Rural Sky',
            4: 'Rural/Suburban Transition',
            5: 'Suburban Sky'
        };
        return descriptions[bortleClass] || 'Dark Sky';
    }

    // --- Weather Condition Detail Modal Functions ---
    
    // Condition details data
    const conditionDetails = {
        cloudCover: {
            title: "Cloud Cover",
            icon: "☁️",
            description: `
                <h4>Understanding Cloud Cover</h4>
                <p>Cloud cover is the fraction of the sky covered by clouds when viewed from a particular location. It's one of the most critical factors for successful stargazing.</p>
                
                <h4>Impact on Stargazing:</h4>
                <p><strong>Clear skies (0-15% clouds)</strong> provide the best viewing conditions. Even light wispy clouds can block faint deep-sky objects.</p>
                <p><strong>Partly cloudy (15-50%)</strong> may still allow observation between cloud gaps, but you'll need to be patient and flexible.</p>
                <p><strong>Mostly cloudy (50%+)</strong> significantly limits observation opportunities.</p>
                
                <h4>Best Practices:</h4>
                <p>• Check real-time satellite imagery before heading out</p>
                <p>• Learn to identify different cloud types and their movement patterns</p>
                <p>• Use cloud gaps strategically for specific observations</p>
            `
        },
        transparency: {
            title: "Atmospheric Transparency",
            icon: "👁️",
            description: `
                <h4>What is Atmospheric Transparency?</h4>
                <p>Atmospheric transparency measures how clear the air is and how far you can see through the atmosphere. It directly affects your ability to observe faint deep-sky objects.</p>
                
                <h4>Factors Affecting Transparency:</h4>
                <p><strong>Humidity:</strong> Water vapor scatters light and reduces transparency</p>
                <p><strong>Aerosols:</strong> Dust, pollution, and smoke particles block starlight</p>
                <p><strong>Temperature inversions:</strong> Can trap pollutants near the surface</p>
                
                <h4>Visibility Ranges:</h4>
                <p><strong>Excellent (40+ km):</strong> Perfect for faint galaxies and nebulae</p>
                <p><strong>Good (20-40 km):</strong> Most objects visible with proper equipment</p>
                <p><strong>Fair (10-20 km):</strong> Bright objects only, limited deep-sky viewing</p>
                <p><strong>Poor (<10 km):</strong> Only brightest stars and planets visible</p>
            `
        },
        seeing: {
            title: "Atmospheric Seeing",
            icon: "🎯",
            description: `
                <h4>Understanding Atmospheric Seeing</h4>
                <p>Seeing measures atmospheric stability and how steady celestial objects appear. It's crucial for high-magnification observations like planetary viewing and double star separation.</p>
                
                <h4>What Causes Poor Seeing?</h4>
                <p><strong>Thermal turbulence:</strong> Temperature differences create air pockets that distort starlight</p>
                <p><strong>Wind shear:</strong> Different wind speeds at various altitudes cause instability</p>
                <p><strong>Local heating:</strong> Buildings, parking lots, and warm surfaces create heat plumes</p>
                
                <h4>CAPE Values:</h4>
                <p><strong>0-250 J/kg:</strong> Excellent seeing, stable atmosphere</p>
                <p><strong>250-1000 J/kg:</strong> Good seeing, minor turbulence</p>
                <p><strong>1000+ J/kg:</strong> Poor seeing, significant atmospheric instability</p>
                
                <h4>Optimizing for Good Seeing:</h4>
                <p>• Observe from elevated locations away from heat sources</p>
                <p>• Wait for air temperature to stabilize after sunset</p>
                <p>• Use lower magnifications on nights with poor seeing</p>
            `
        },
        dewRisk: {
            title: "Dew Point Risk",
            icon: "💧",
            description: `
                <h4>Dew Formation and Equipment Protection</h4>
                <p>Dew forms when the air temperature drops to the dew point, causing water vapor to condense on surfaces. This can fog up telescopes, eyepieces, and camera lenses.</p>
                
                <h4>Temperature Spread Indicator:</h4>
                <p><strong>Large spread (>15°C):</strong> Low dew risk, dry conditions</p>
                <p><strong>Medium spread (5-15°C):</strong> Moderate risk, monitor equipment</p>
                <p><strong>Small spread (<5°C):</strong> High risk, active dew prevention needed</p>
                
                <h4>Dew Prevention Strategies:</h4>
                <p><strong>Dew heaters:</strong> Gentle heating elements for telescope optics</p>
                <p><strong>Dew shields:</strong> Extend lens hoods to slow radiative cooling</p>
                <p><strong>Lens warmers:</strong> Battery-powered heaters for camera lenses</p>
                
                <h4>Natural Prevention:</h4>
                <p>• Choose elevated, breezy locations when possible</p>
                <p>• Point equipment away from open water sources</p>
                <p>• Allow gradual temperature equilibration</p>
            `
        }
    };

    // Show condition detail modal
    window.showConditionDetail = function(conditionType) {
        const modal = document.getElementById('conditionModal');
        const title = document.getElementById('modalTitle');
        const icon = document.getElementById('modalIcon');
        const description = document.getElementById('modalDescription');
        
        const condition = conditionDetails[conditionType];
        if (condition) {
            title.textContent = condition.title;
            icon.textContent = condition.icon;
            description.innerHTML = condition.description;
            modal.classList.add('show');
            
            // Prevent body scrolling when modal is open
            document.body.style.overflow = 'hidden';
        }
    };

    // Hide condition detail modal
    window.hideConditionDetail = function() {
        const modal = document.getElementById('conditionModal');
        modal.classList.remove('show');
        
        // Restore body scrolling
        document.body.style.overflow = 'auto';
    };

    // Close modal with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            hideConditionDetail();
        }
    });

    // Start the application
    init();
    initInteractiveButtons();
}); 