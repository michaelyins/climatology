// models.js - Updated to work with new backend data structure and fixed dropdown functionality
document.addEventListener('DOMContentLoaded', () => {
    let allPredictionData = {};
    let userSelection = {
        location: null,
        dataSource: 'ECMWF',
        timeType: 'sunset'
    };

    // --- DOM Element References ---
    const timeToggle = document.getElementById('time-toggle');
    const timeDropdown = document.getElementById('time-dropdown');
    const locationToggle = document.getElementById('location-toggle');
    const locationDropdown = document.getElementById('location-dropdown');
    const dataToggle = document.getElementById('data-toggle');
    const dataDropdown = document.getElementById('data-dropdown');
    const searchButton = document.getElementById('search-button');
    const emptyButton = document.getElementById('empty-button');
    
    const selectedLocationEl = document.getElementById('selected-location');
    const selectedDateEl = document.getElementById('selected-date');
    const sunsetDisplayEl = document.getElementById('sunset-display');
    const recommendLevelEl = document.getElementById('recommend-level');
    const recommendDescEl = document.getElementById('recommend-description');
    const qualityLevelEl = document.getElementById('quality-level');
    const qualityDescEl = document.getElementById('quality-description');
    const airQualityEl = document.getElementById('air-quality');
    const airDescEl = document.getElementById('air-description');
    
    // Initialize the application
    async function init() {
        await loadPredictionData();
        setupEventListeners();
        updateButtonTexts();
    }

    async function loadPredictionData() {
        console.log("Loading daily_results.json...");
        try {
            const response = await fetch('../data/firesky_daily.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            allPredictionData = await response.json();
            console.log("✅ Prediction data loaded successfully:", allPredictionData);
            populateLocationDropdown();
        } catch (error) {
            console.error("❌ Failed to load prediction data:", error);
            alert("Error: Unable to load prediction data.");
        }
    }

    function populateLocationDropdown() {
        locationDropdown.innerHTML = '';
        const locations = Object.keys(allPredictionData);
        if (locations.length === 0) {
            locationDropdown.innerHTML = '<div class="dropdown-item">No available locations</div>';
            return;
        }
        
        locations.forEach(location => {
            const item = document.createElement('div');
            item.className = 'dropdown-item';
            item.setAttribute('data-value', location);
            item.textContent = location;
            locationDropdown.appendChild(item);
        });
        console.log("Location dropdown populated with:", locations);
    }

    function setupEventListeners() {
        // Time Type Toggle
        timeToggle.addEventListener('click', (e) => {
            e.preventDefault();
            toggleDropdown(timeDropdown);
        });

        // Data Source Toggle
        dataToggle.addEventListener('click', (e) => {
            e.preventDefault();
            toggleDropdown(dataDropdown);
        });

        // Location Toggle
        locationToggle.addEventListener('click', (e) => {
            e.preventDefault();
            toggleDropdown(locationDropdown);
        });

        // Time dropdown items
        timeDropdown.addEventListener('click', (e) => {
            if (e.target.classList.contains('dropdown-item')) {
                const value = e.target.getAttribute('data-value');
                userSelection.timeType = value;
                document.getElementById('time-text').textContent = value.charAt(0).toUpperCase() + value.slice(1);
                closeAllDropdowns();
                console.log("Time type selected:", value);
            }
        });

        // Data dropdown items
        dataDropdown.addEventListener('click', (e) => {
            if (e.target.classList.contains('dropdown-item')) {
                const value = e.target.getAttribute('data-value');
                userSelection.dataSource = value;
                document.getElementById('data-text').textContent = value;
                closeAllDropdowns();
                console.log("Data source selected:", value);
            }
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
            searchReports();
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
        [timeDropdown, dataDropdown, locationDropdown].forEach(dropdown => {
            if (dropdown) dropdown.style.display = 'none';
        });
    }

    function updateButtonTexts() {
        document.getElementById('time-text').textContent = userSelection.timeType.charAt(0).toUpperCase() + userSelection.timeType.slice(1);
        document.getElementById('data-text').textContent = userSelection.dataSource;
        document.getElementById('location-text').textContent = userSelection.location || 'Choose Location';
    }

    function searchReports() {
        if (!userSelection.location) {
            alert("Please select a location first.");
            return;
        }

        console.log("Searching with selection:", userSelection);

        // Access data using three-level structure: location -> dataSource -> timeType
        const locationData = allPredictionData[userSelection.location];
        if (!locationData) {
            console.error("No data found for location:", userSelection.location);
            displayNoData();
            return;
        }

        const modelData = locationData[userSelection.dataSource];
        if (!modelData) {
            console.error("No data found for model:", userSelection.dataSource);
            displayNoData();
            return;
        }

        const eventData = modelData[userSelection.timeType];
        if (!eventData) {
            console.error("No data found for event type:", userSelection.timeType);
            displayNoData();
            return;
        }

        console.log("Found data:", eventData);
        displayData(eventData);
    }

    // Function to get quality description based on score
    function getQualityDescription(qualityScore, recommendPercentage) {
        let qualityDesc = '';
        
        // Get base description based on quality score range
        if (qualityScore >= 0 && qualityScore < 2) {
            qualityDesc = 'Plain';
        } else if (qualityScore >= 2 && qualityScore < 4) {
            qualityDesc = 'Kinda Good';
        } else if (qualityScore >= 4 && qualityScore < 6) {
            qualityDesc = 'Very Good';
        } else if (qualityScore >= 6 && qualityScore <= 10) {
            qualityDesc = 'Never Miss It';
        } else {
            qualityDesc = 'No evaluation';
        }
        
        // Add accuracy indicator based on recommendation percentage
        let accuracyNote = '';
        if (recommendPercentage !== undefined) {
            if (recommendPercentage > 70) {
                accuracyNote = ' - Accurate when recommendation probability is above 70%';
            } else {
                accuracyNote = ' - For reference only when probability is below 70%';
            }
        }
        
        return qualityDesc + accuracyNote;
    }

    function displayData(data) {
        // Update header information
        selectedLocationEl.textContent = data.locationName || userSelection.location;
        selectedDateEl.textContent = data.date || 'Unknown';
        sunsetDisplayEl.textContent = data.localEventTime || '--:--';

        // Update metrics - show percentage instead of raw score
        if (data.recommendPercentage !== undefined) {
            recommendLevelEl.textContent = `${data.recommendPercentage}%`;
        } else {
            // Fallback to old format if percentage not available
            recommendLevelEl.textContent = data.recommendLevel !== undefined ? data.recommendLevel : '--';
        }
        recommendDescEl.textContent = data.recommendDescription || 'No description available';
        
        // Update quality level with enhanced description
        qualityLevelEl.textContent = data.qualityLevel || '--';
        if (data.qualityLevel !== undefined && data.qualityLevel !== '--') {
            qualityDescEl.textContent = getQualityDescription(parseFloat(data.qualityLevel), data.recommendPercentage);
        } else {
            qualityDescEl.textContent = 'No description available';
        }
        
        // Display only AOD numerical value
        airQualityEl.textContent = data.airQualityValue !== undefined ? data.airQualityValue.toFixed(3) : '--';
        airDescEl.textContent = data.airDescription || 'No description available';

        console.log("Data displayed successfully");
    }

    function displayNoData() {
        selectedLocationEl.textContent = 'Location';
        selectedDateEl.textContent = 'Date';
        sunsetDisplayEl.textContent = '--:--';
        
        recommendLevelEl.textContent = '--';
        recommendDescEl.textContent = 'No data available for the selected combination';
        
        qualityLevelEl.textContent = '--';
        qualityDescEl.textContent = 'No data available for the selected combination';
        
        airQualityEl.textContent = '--';
        airDescEl.textContent = 'No data available for the selected combination';
        
        alert("We don't have data for this combination. Please try different selections.");
    }

    function resetSelection() {
        userSelection = {
            location: null,
            dataSource: 'ECMWF',
            timeType: 'sunset'
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

        // Initialize Mermaid with configuration
        mermaid.initialize({
            startOnLoad: true,
            theme: 'neutral',
            flowchart: {
                useMaxWidth: true,
                htmlLabels: true,
                curve: 'basis'
            },
            themeVariables: {
                primaryColor: '#f8f9fa',
                primaryTextColor: '#333',
                primaryBorderColor: '#333',
                lineColor: '#666',
                secondaryColor: '#f8f9fa',
                tertiaryColor: '#fff'
            }
        });

        // Define the workflow diagram
        const workflowDefinition = `
        flowchart LR
            A["Check Both Models<br/>To Predict<br/>Firesky"] --> B["Check<br/>Recommendation<br/>Level(Possibility)"]
            
            B --> C["40% < RL < 70%<br/>Reference Only<br/>Quality Index"]
            B --> D["Rec Level > 70%<br/>Valid<br/>Quality Index"]
            B --> E["RL < 40%<br/>Reference Only<br/>Quality Index"]
            
            C --> F["View Satellites<br/>Images and See<br/>Cloud Condition"]
            D --> G["Check AOD Level<br/>0.15 - 0.4<br/>Best for Firesky"]
            E --> H["It's Not Safe To<br/>Conclude There<br/>Will Be Firesky"]
            
            F --> I["If prerequisites<br/>Are Met<br/>Still Have chance"]
            G --> J["It's Pretty Safe To<br/>Estimate There<br/>WILL BE Firesky ⭐"]
        `;

        // Render the diagram
        try {
            mermaid.render('workflow-graph', workflowDefinition).then(result => {
                workflowContainer.innerHTML = result.svg;
            }).catch(error => {
                console.error('Error rendering Mermaid diagram:', error);
                workflowContainer.innerHTML = '<p style="color: #ff6b47; text-align: center; padding: 2rem;">Error loading workflow diagram. Please refresh the page.</p>';
            });
        } catch (error) {
            console.error('Mermaid initialization error:', error);
            workflowContainer.innerHTML = '<p style="color: #ff6b47; text-align: center; padding: 2rem;">Workflow diagram temporarily unavailable.</p>';
        }
    }

    // Start the application
    init();
    initInteractiveButtons();
});
