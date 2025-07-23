# 🛠️ Developer Guide

## System Architecture

### Backend Components
```
src/
├── data_fetcher.py      # Weather data acquisition from ECMWF/GFS
├── probability_model.py # Core prediction algorithms
├── quality_model.py     # Quality assessment algorithms  
├── shared_utils.py      # Utility functions and constants
└── __init__.py
```

### Frontend Components
```
public/
├── css/
│   ├── common.css       # Shared styles
│   └── firesky.css      # Fire sky model specific styles
├── js/
│   ├── common.js        # Shared JavaScript functionality
│   └── firesky.js       # Fire sky model interactions
├── models/
│   └── firesky.html     # Fire sky prediction interface
└── data/
    └── firesky_daily.json # Daily prediction results
```

## Development Setup

### Prerequisites
- Python 3.8+
- Required packages: `pandas`, `numpy`, `requests`, `pyproj`
- Modern web browser for frontend testing

### Backend Development

#### Environment Setup
```bash
# Clone the repository
git clone https://github.com/michaelyins/climatology.git
cd climatology

# Install dependencies
pip install pandas numpy requests pyproj

# Download ephemeris data (for astronomical calculations)
# Ensure de421.bsp is in project root
```

#### Configuration
Edit `config/settings.py` for:
- API endpoints and keys
- Model parameters
- Output formatting options
- Recommendation thresholds

Edit `config/locations.json` for:
- Target locations and coordinates
- Time zone information
- Local horizon data

#### Running Predictions
```bash
# Generate daily predictions
python run_daily_predictions.py

# Output saved to public/data/firesky_daily.json
```

### Frontend Development

#### Local Server
```bash
# Navigate to public directory
cd public

# Start simple HTTP server
python -m http.server 8000

# Access at http://localhost:8000
```

#### File Structure
- `index.html` - Main landing page
- `models/firesky.html` - Fire sky prediction interface
- `css/firesky.css` - Styling for fire sky model
- `js/firesky.js` - Interactive functionality

## Algorithm Architecture

### Prediction Pipeline
1. **Data Acquisition** (`data_fetcher.py`)
   - Fetches ECMWF/GFS model data
   - Processes atmospheric profiles
   - Extracts relevant meteorological parameters

2. **Geometric Analysis** (`probability_model.py`)
   - Earth curvature calculations
   - Light path obstruction detection
   - Continuous band analysis (100km threshold)

3. **Atmospheric Modeling** (`probability_model.py`)
   - Cloud boundary detection via humidity analysis
   - Dewpoint spread cloud layer identification
   - Dynamics analysis (convection, wind shear, advection)

4. **Quality Assessment** (`quality_model.py`)
   - Spectacle potential scoring
   - AOD (Aerosol Optical Depth) analysis
   - Visual impact predictions

### Core Functions

#### `find_cloud_boundaries()`
- Uses humidity profiles to detect cloud layers
- Identifies altitude ranges with >80% relative humidity
- Groups adjacent layers within 500m

#### `analyze_sounding_for_clouds()`
- Precise cloud detection using dewpoint spread
- Temperature-dewpoint difference < 2°C indicates clouds
- More accurate than humidity-only methods

#### `analyze_dynamics()`
- Convection analysis via temperature lapse rates
- Wind shear calculation (0-25 m/s range)
- Cloud advection pattern detection

#### `check_light_path_by_geometric_model()`
- Earth curvature-based geometric calculations
- Light path obstruction analysis
- Continuous obstruction band logic

#### `predict_sunset_quality_ultimate()`
- Tournament-style elimination scoring
- Multi-factor integration
- Percentage-based probability output

## Data Flow

### Input Data Structure
```json
{
  "location": "New York",
  "date": "2025-01-22",
  "model": "ECMWF",
  "atmospheric_data": {
    "temperature": [...],
    "humidity": [...],
    "pressure": [...],
    "wind_speed": [...],
    "wind_direction": [...]
  }
}
```

### Output Data Structure
```json
{
  "locationName": "New York",
  "date": "2025-01-22",
  "localEventTime": "17:32",
  "recommendLevel": 3,
  "recommendPercentage": 75,
  "recommendDescription": "Excellent conditions predicted",
  "qualityLevel": 6.8,
  "qualityDescription": "High-quality display expected",
  "airQualityValue": 0.23,
  "airDescription": "Optimal AOD levels for brilliant colors"
}
```

## Advanced Configuration

### Model Parameters
In `config/settings.py`:
```python
# Scoring thresholds
RECOMMENDATION_PERCENTAGES = {
    1: 20, 2: 25, 3: 40, 4: 50, 5: 75, 6: 90
}

# Quality assessment weights
CLOUD_COVERAGE_WEIGHT = 0.3
ATMOSPHERIC_CLARITY_WEIGHT = 0.25
AEROSOL_SCATTERING_WEIGHT = 0.25
GEOMETRIC_FACTORS_WEIGHT = 0.2

# Detection thresholds
CLOUD_HUMIDITY_THRESHOLD = 0.8
DEWPOINT_SPREAD_THRESHOLD = 2.0
OBSTRUCTION_BAND_THRESHOLD = 100  # km
```

### Adding New Locations
Edit `config/locations.json`:
```json
{
  "New Location": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "timezone": "America/New_York",
    "elevation": 10,
    "horizon_data": {...}
  }
}
```

## API Integration

### Weather Data Sources
- **ECMWF**: Primary high-resolution model
- **GFS**: Secondary global model for comparison
- **Real-time updates**: 1 AM (sunrise), 3 PM (sunset)
- **Final updates**: 1 hour before event

### Data Processing Pipeline
1. Raw meteorological data acquisition
2. Quality control and validation
3. Atmospheric profile analysis
4. Geometric modeling application
5. Probability calculation
6. Output formatting and storage

## Testing & Validation

### Unit Testing
```bash
# Test core prediction functions
python -m pytest tests/

# Test specific modules
python -m pytest tests/test_probability_model.py
```

### Integration Testing
```bash
# Full prediction pipeline test
python tests/test_full_pipeline.py

# Data validation
python tests/validate_outputs.py
```

### Performance Monitoring
- Prediction accuracy tracking
- Processing time optimization
- Memory usage profiling
- API response time monitoring

## Security Considerations

### Algorithm Protection
- Core prediction logic obfuscation
- Proprietary parameter protection
- API key security management
- Rate limiting implementation

### Data Privacy
- No personal data collection
- Anonymous usage analytics only
- Secure data transmission
- Regular security audits

## Deployment

### Production Environment
```bash
# Server requirements
- CPU: 4+ cores
- RAM: 8GB+
- Storage: 100GB+
- Network: High-speed internet for data feeds

# Dependencies
pip install -r requirements.txt

# Service configuration
systemctl enable climatology-predictions
systemctl start climatology-predictions
```

### Monitoring
- Application health checks
- Data feed validation
- Prediction quality metrics
- User experience analytics

## Contributing

### Code Standards
- Python: PEP 8 compliance
- JavaScript: ES6+ standards
- HTML/CSS: W3C validation
- Documentation: Comprehensive inline comments

### Pull Request Process
1. Feature branch creation
2. Code review requirement
3. Testing validation
4. Documentation updates
5. Staging deployment test
6. Production deployment

---

For technical support or advanced configuration questions, refer to the main README.md or contact the development team. 