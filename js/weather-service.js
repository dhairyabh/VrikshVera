/* ============================================================
   weather-service.js — OpenWeatherMap Live Integration
   Handles data fetching, caching, and coordinate mapping
   ============================================================ */

const WeatherService = {
    BASE_URL: 'http://localhost:5000/api/weather',
    CACHE_EXPIRY: 30 * 60 * 1000, // 30 minutes in ms

    // Geographic Coordinates for Uttarakhand Districts
    COORDS: {
        'Dehradun':    { lat: 30.3165, lon: 78.0322 },
        'Haridwar':    { lat: 29.9457, lon: 78.1642 },
        'Nainital':    { lat: 29.3803, lon: 79.4635 },
        'Almora':      { lat: 29.5971, lon: 79.6591 },
        'Uttarkashi':  { lat: 30.7268, lon: 78.4354 },
        'Chamoli':     { lat: 30.4150, lon: 79.3300 },
        'Pithoragarh': { lat: 29.5829, lon: 80.2182 },
        'Pauri':       { lat: 30.1510, lon: 78.7770 },
        'Tehri':       { lat: 30.3800, lon: 78.4800 },
        'Rudraprayag': { lat: 30.2844, lon: 78.9811 },
        'Bageshwar':   { lat: 29.8400, lon: 79.7700 },
        'Champawat':   { lat: 29.3361, lon: 80.0910 },
        'US Nagar':    { lat: 29.0275, lon: 79.5235 }
    },

    /**
     * Fetch weather for a specific district (with caching)
     */
    async getWeather(district) {
        const coords = this.COORDS[district];
        if (!coords) {
            console.error(`Coords not found for ${district}`);
            return null;
        }

        // 1. Check Cache
        const cached = this._getCache(district);
        if (cached) return cached;

        // 2. Fetch Live Data
        try {
            const response = await fetch(`${this.BASE_URL}?lat=${coords.lat}&lon=${coords.lon}`);
            if (!response.ok) throw new Error(`Weather API failed: ${response.statusText}`);
            
            const data = await response.json();
            
            // Transform to VrikshVera format
            const result = {
                temp: Math.round(data.main.temp),
                humidity: data.main.humidity,
                rainfall: data.rain ? (data.rain['1h'] || data.rain['3h'] || 0) : 0,
                wind: Math.round(data.wind.speed * 3.6), // m/s to km/h
                timestamp: new Date().getTime(),
                isLive: true
            };

            // 3. Save to Cache
            this._setCache(district, result);
            return result;
        } catch (error) {
            console.warn(`Falling back to static data for ${district}:`, error);
            return null; // Signals caller to use fallback
        }
    },

    _getCache(district) {
        const key = `weather_cache_${district}`;
        const cached = localStorage.getItem(key);
        if (!cached) return null;

        const { data, timestamp } = JSON.parse(cached);
        if (new Date().getTime() - timestamp > this.CACHE_EXPIRY) {
            localStorage.removeItem(key);
            return null;
        }
        return data;
    },

    _setCache(district, data) {
        const key = `weather_cache_${district}`;
        localStorage.setItem(key, JSON.stringify({
            data: data,
            timestamp: new Date().getTime()
        }));
    }
};

window.WeatherService = WeatherService;
