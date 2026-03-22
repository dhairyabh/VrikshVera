# 👨‍🌾 VrikshVera (वृक्षवेरा)
### *Empowering Uttarakhand's Farmers with AI Climate Intelligence*

**VrikshVera** is a next-generation, offline-capable Progressive Web App (PWA) designed to provide hyper-local agriculture advisories to smallholder farmers in the Himalayan region. By combining satellite telemetry with on-device Machine Learning, it bridges the gap between complex climate data and actionable farm-level decisions.

---

## 🌟 The Six Pillars of VrikshVera

1.  **🤖 AI Crop Advisor**: A Gaussian Naive Bayes ML model (89% accuracy) that recommends the optimal of 35+ crops based on soil, season, and climate.
2.  **🛰️ Satellite Risk Monitoring**: Real-time NDVI (Vegetation Index) and soil moisture tracking for precise farm health monitoring.
3.  **⛈️ Weather Risk Engine**: Rule-based logic system that triggers instant alerts for Heavy Rain, Heat Stress (>35°C), and Cold Stress (<5°C).
4.  **🗺️ Geo-Spatial Hazards**: Advanced risk mapping for Landslides, Floods, and Droughts across all 13 districts of Uttarakhand.
5.  **💬 AI Chatbot (Groq-Powered)**: A multilingual, warm, and empathetic digital assistant that answers farming queries and provides immediate support.
6.  **📱 Offline First (PWA)**: Full functionality in remote areas with zero internet coverage using Service Worker caching and local ML execution.

---

## 🛠️ Technology Stack

-   **Frontend**: Vanilla JavaScript (ES6+), Modern CSS3 (Glassmorphism), Semantic HTML5.
-   **Intelligence**: 
    -   **Gaussian Naive Bayes**: Local inference for crop recommendations.
    -   **Groq Cloud API**: LLM-powered chatbot for complex queries.
    -   **Rule Engines**: Specialized logic for weather and climate alerts.
-   **Deployment**: Docker & Nginx.
-   **PWA**: Service Workers & Manifest.json for native-like experience and offline access.

---

## 🚀 Getting Started

### Method 1: Local Development
Simply open `home.html` in any modern browser or use a simple HTTP server:
```bash
# Using Python
python -m http.server 8001
```

### Method 2: Using Docker (Recommended)
The project is fully containerized for easy deployment.
```bash
docker-compose up --build
```
The app will be available at: `http://localhost:8001`

---

## 🌍 Multilingual Support
KrishiMitra supports **Hindi (हिन्दी)** and **English**. The entire UI, including dynamic AI alerts and advice, switches instantly using a reactive `MutationObserver` system without requiring a page refresh.

## 📄 License
© 2026 KrishiMitra Project. All rights reserved. 🏔️🇮🇳
