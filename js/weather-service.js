/* ============================================================
   weather-service.js — OpenWeatherMap Live Integration
   Handles data fetching, caching, and coordinate mapping
   ============================================================ */

const WeatherService = {
    BASE_URL: (typeof BACKEND_URL !== 'undefined' ? BACKEND_URL : 'http://localhost:5000') + '/api/weather/location',
    CACHE_EXPIRY: 5 * 60 * 1000, // 5 minutes in ms

    /**
     * Fetch weather for a specific district (with caching)
     */
    async getWeather(district) {
        if (!district) return null;

        // 1. Check Cache
        const cached = this._getCache(district);
        if (cached) return cached;

        // 2. Fetch Live Data
        try {
            const response = await fetch(`${this.BASE_URL}?district=${encodeURIComponent(district)}`);
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
