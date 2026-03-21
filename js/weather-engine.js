/* ============================================================
   weather-engine.js — Rule-based Agricultural Risk Analysis
   Input: Weather metrics (temp, humidity, rainfall)
   Output: Specific actionable advisories
   ============================================================ */

const WeatherEngine = {
    // Thresholds
    THRESHOLDS: {
        HEAVY_RAIN: 15,    // mm
        HEAT_STRESS: 35,   // °C
        COLD_STRESS: 5,    // °C
        HUMIDITY_RISK: 85  // %
    },

    /**
     * Analyze weather data and return a list of specific alerts
     * @param {Object} data - { temp, humidity, rainfall, wind }
     * @returns {Array} - List of alert objects { type, title, msg, level }
     */
    analyze(data) {
        const alerts = [];

        // 1. Heavy Rain Detection
        if (data.rainfall > this.THRESHOLDS.HEAVY_RAIN) {
            alerts.push({
                type: 'rain',
                level: 'red',
                icon: '🌧️',
                title: window.t('weather.rain.title'),
                msg: window.t('weather.rain.msg')
            });
        }

        // 2. Heat Stress Detection
        if (data.temp > this.THRESHOLDS.HEAT_STRESS) {
            alerts.push({
                type: 'heat',
                level: 'amber',
                icon: '🌡️',
                title: window.t('weather.heat.title'),
                msg: window.t('weather.heat.msg')
            });
        }

        // 3. Cold Stress Detection
        if (data.temp < this.THRESHOLDS.COLD_STRESS) {
            alerts.push({
                type: 'cold',
                level: 'amber',
                icon: '❄️',
                title: window.t('weather.cold.title'),
                msg: window.t('weather.cold.msg')
            });
        }

        // 4. Humidity Risk (Fungal Disease)
        if (data.humidity > this.THRESHOLDS.HUMIDITY_RISK) {
            alerts.push({
                type: 'humidity',
                level: 'amber',
                icon: '💧',
                title: window.t('weather.hum.title'),
                msg: window.t('weather.hum.msg')
            });
        }

        return alerts;
    }
};

// Export for browser use
window.WeatherEngine = WeatherEngine;
