/* ============================================================
   main.js — Shared: Navigation, transitions, language selection,
              particles canvas, scroll reveals, tilt effect
   ============================================================ */

// ── Language Data ────────────────────────────────────────────
const LANG = {
  en: {
    'nav.home': 'Home', 'nav.dashboard': 'Dashboard',
    'nav.advisor': 'Crop Advisor', 'nav.risk': 'Climate Risk', 'nav.chatbot': 'AI Chatbot',
    'lang.label': '🌐 हिंदी', 'hero.badge': '🛰️ AI Climate Intelligence',
    'hero.title': '<span class="gradient-text">Hyper-Local Climate</span><br>Intelligence for<br>Every Farmer',
    'hero.subtitle': 'Bridging satellite data, weather forecasts, and AI crop models to deliver actionable, localized advisories for smallholder farmers in Uttarakhand and climate-sensitive regions.',
    'hero.cta': 'Explore Dashboard →', 'hero.cta2': 'Get Crop Advice',
    'hero.info': 'Live data • 13 Uttarakhand districts • Updated every 30min',
    'hero.scroll': 'Scroll to explore',
    'index.stat1.label': 'Districts Covered', 'index.stat2.label': 'Crop Varieties', 'index.stat3.label': 'Risk Alerts Issued', 'index.stat4.label': 'Advisory Accuracy', 'index.stat5.label': 'Farmers Served',
    'index.features.tag': '🚀 Platform Features', 'index.features.title': 'Six Pillars of Climate-Smart Farming', 'index.features.desc': 'Designed around the six key innovation areas of the AgriTech challenge',
    'index.feat1.title': 'AI Crop Forecasting', 'index.feat1.desc': 'ML-powered suitability scoring for 35 major crops. Matches soil type, season, and climate data to recommend the best variety for your farm.',
    'index.feat2.title': 'Satellite Risk Prediction', 'index.feat2.desc': 'Real-time NDVI, soil moisture, and flood probability from satellite feeds. Instant risk alerts for landslide, drought, and extreme rainfall.',
    'index.feat3.title': 'Climate Finance & Insurance', 'index.feat3.desc': 'Integrated PMFBY, WBCIS, and RWBCIS scheme advisor. District-wise insurance eligibility and claim guidance at your fingertips.',
    'index.feat4.title': 'Voice Advisory', 'index.feat4.desc': 'Multilingual voice advisories in Hindi and English. Crop recommendations spoken aloud for farmers with low literacy or visual impairments.',
    'index.feat5.title': 'Offline-First Architecture', 'index.feat5.desc': 'PWA-enabled platform with offline data caching. Core advisories function without internet — crucial for remote Himalayan villages.',
    'index.feat6.title': 'Hyper-Local Analytics', 'index.feat6.desc': 'Down to district-level climate granularity. 7-day forecasts, crop calendars, and soil health dashboards for 13 Uttarakhand districts.',
    'index.how.tag': '⚙️ How It Works', 'index.how.title': 'From Satellite to Farm Advisory', 'index.how.desc': 'Three-step intelligence pipeline delivering real-time insights',
    'index.step1.title': '🌍 Data Ingestion', 'index.step1.desc': 'Satellite imagery (NDVI, moisture), NOAA/IMD weather feeds, and government soil health card data are aggregated in real-time.',
    'index.step2.title': '🧠 AI Analysis', 'index.step2.desc': 'ML models compute crop suitability, climate risk scores, and predictive advisories using geospatial intelligence and crop phenology models.',
    'index.step3.title': '📲 Farmer Advisory', 'index.step3.desc': 'Hyper-localized recommendations delivered via dashboard, voice advisory (Hindi/English), and offline-capable PWA for remote areas.',
    'index.districts.tag': '📍 Coverage', 'index.districts.title': 'All 13 Uttarakhand Districts', 'index.districts.desc': 'Complete climate intelligence across every district of Uttarakhand',
    'index.cta.title': 'Ready to Protect Your Farm?', 'index.cta.desc': 'Join thousands of farmers using AI-powered climate intelligence to make smarter decisions.',
    'index.cta.btn1': 'View Dashboard →', 'index.cta.btn2': 'Get Crop Advice',
    'badge.free': '✅ Free for Farmers', 'badge.offline': '📱 Offline Capable', 'badge.voice': '🎙️ Hindi Voice Support',
    'advisor.title': 'AI Crop Suitability Advisor',
    'advisor.subtitle': 'Our trained Gaussian Naive Bayes model (<strong class="text-green">89% accuracy</strong>) analyses your district\'s climate, soil type, and water availability to recommend the best crops for maximum yield.',
    'wizard.step1': 'Location & Soil', 'wizard.step2': 'Season & Water', 'wizard.step3': 'Get Report',
    'model.loading': '⏳ Loading AI model...', 'model.crops': '🌾 35 Crop Classes', 'model.samples': '📊 7,000 Training Samples', 'model.features': '7 Features',
    'step1.title': '📍 Step 1: Location & Soil Type', 'step1.desc': 'Select your district and soil type for climate-matched recommendations',
    'form.district.label': 'District', 'form.district.placeholder': 'Select district...',
    'form.soil.label': 'Soil Type', 'form.soil.placeholder': 'Select soil type...',
    'soil.loamy': '🌿 Loamy — Best for most crops', 'soil.clay': '🏺 Clay — High moisture retention', 'soil.sandy': '🏜️ Sandy — Fast draining', 'soil.alluvial': '🌊 Alluvial — Highly fertile', 'soil.silty': '💧 Silty — Smooth, water-retaining', 'soil.rocky': '⛰️ Rocky — Mountain terrain',
    'step2.title': '🌦️ Step 2: Season & Water Availability', 'step2.desc': 'Current sowing season and your irrigation capacity',
    'form.season.label': 'Sowing Season', 'form.season.placeholder': 'Select season...', 'season.kharif': '🌧️ Kharif — Jun to Nov (Monsoon)', 'season.rabi': '❄️ Rabi — Nov to Apr (Winter)',
    'form.water.label': 'Water / Irrigation', 'form.water.placeholder': 'Select availability...', 'water.high': '💧💧💧 High — Canal / tube well', 'water.medium': '💧💧 Medium — Rain + partially irrigated', 'water.low': '💧 Low — Rain-fed only',
    'btn.next1': 'Next: Season & Water →', 'btn.next2': 'Next: Get Report →', 'btn.back': '← Back', 'btn.report': 'Generate AI Analysis →',
    'step3.title': '🤖 Step 3: AI Analysis Ready', 'step3.desc': 'Our AI engine is ready to generate your personalised crop advisory',
    'summary.title': 'Your Farm Profile Summary',
    'dash.title': 'Climate Dashboard', 'dash.weather': '7-Day Climate Trend', 'dash.risk': '⚡ Risk Alerts',
    'dash.ndvi.title': '🛰️ NDVI & Vegetation', 'dash.ndvi.label': 'Vegetation Health Index',
    'dash.ndvi.success': '✅ Healthy vegetation detected in monitoring zone',
    'dash.metrics.cover': 'Crop Cover', 'dash.metrics.soil': 'Soil Type', 'dash.metrics.irrigation': 'Irrigation',
    'dash.calendar.title': '📅 Crop Calendar', 'dash.calendar.subtitle': 'Recommended crops for current season in your district:',
    'dash.tip.title': '💡 Seasonal Tip', 'dash.tip.text': 'March is ideal for Rabi harvest & early Kharif preparation. Check soil moisture before sowing.',
    'dash.quick.title': '🔗 Quick Actions',
    'dash.quick.advice': '🤖 Get AI Crop Advice', 'dash.quick.risk': '⚠️ View Risk Map', 'dash.quick.chatbot': '💬 Ask AI Chatbot',
    'dash.quick.pmfby': '🛡️ Apply for PMFBY', 'dash.quick.kcc': '💳 Kisan Credit Card', 'dash.quick.helpline': '📞 Kisan Helpline (1800)',
    'nav.cta': 'Open Dashboard →',
    'risk.title': 'District Risk Intelligence Map', 'risk.map': '🗺️ Uttarakhand Risk Map', 'risk.desc': 'Real-time climate risk assessment for all 13 Uttarakhand districts using satellite data, weather feeds, and geological surveys.',
    'risk.badge.high': '🔴 High Risk Districts', 'risk.badge.medium': '🟡 Medium Risk', 'risk.badge.low': '🟢 Low Risk', 'risk.badge.sat': '🛰️ Last satellite pass: 2h ago',
    'risk.hint': 'Click any district to view detailed risk breakdown',
    'footer.copy': '© 2026 KrishiMitra',    'footer.stats': '🤖 GNB Model v2.5 · 89.00% accuracy · 7,000 training samples · 35 crop classes',
    'footer.brand.desc': 'AI-powered climate intelligence platform for smallholder farmers in climate-sensitive regions.',
    'dash.label.temp': 'Temperature', 'dash.label.humidity': 'Humidity', 'dash.label.rainfall': 'Rainfall', 'dash.label.wind': 'Wind Speed',
    'dash.sub.temp': 'Current Avg', 'dash.sub.humidity': 'Relative %', 'dash.sub.rainfall': '7-day avg mm', 'dash.sub.wind': 'km/h',
    'dash.weather.sub': 'Temperature & Rainfall forecast', 'dash.status.live': '✅ Live', 'dash.status.updating': '🔄 Updating...', 'dash.status.active': 'Active',
    'dash.risk.low': '🟢 Low Risk', 'dash.risk.medium': '🟡 Medium Risk', 'dash.risk.high': '🔴 High Risk',
    'dash.label.satellite': 'Satellite',
    'alert.low.t1': 'Favorable Conditions', 'alert.low.m1': 'Weather patterns are stable. Ideal for sowing and irrigation.',
    'alert.low.t2': 'Soil Moisture Optimal', 'alert.low.m2': 'Soil moisture at 68% — optimal for current crop stage.',
    'alert.med.t1': 'Moderate Rainfall Alert', 'alert.med.m1': 'Above-average rainfall predicted this week. Delay fertilizer application.',
    'alert.med.t2': 'Temperature Fluctuation', 'alert.med.m2': 'Diurnal variation of 12°C detected. Protect heat-sensitive crops at night.',
    'alert.med.t3': 'Satellite NDVI Update', 'alert.med.m3': 'Vegetation index shows healthy crop growth in 76% of farm zones.',
    'alert.high.t1': 'Extreme Rainfall Warning', 'alert.high.m1': 'Heavy rainfall (>50mm) forecast in 36 hrs. Drain fields immediately.',
    'alert.high.t2': 'Landslide Risk Alert', 'alert.high.m2': 'Geological survey indicates elevated landslide probability this week.',
    'alert.high.t3': 'Flood Advisory', 'alert.high.m3': 'River levels rising. Keep livestock away from low-lying areas.',
    'alert.high.t4': 'Strong Wind Advisory', 'alert.high.m4': 'Wind speeds up to 45km/h expected. Secure crop covers and polytunnels.',
    'chart.temp': 'Temperature (°C)', 'chart.rain': 'Rainfall (mm)',
    'unit.temp': '°C', 'unit.hum': '%', 'unit.rain': 'mm', 'unit.wind': ' km/h',
    'crop.Wheat': 'Wheat', 'crop.Rice': 'Rice', 'crop.Sugarcane': 'Sugarcane', 'crop.Vegetables': 'Vegetables',
    'crop.Potato': 'Potato', 'crop.Mustard': 'Mustard', 'crop.Apple': 'Apple', 'crop.Peach': 'Peach',
    'crop.Barley': 'Barley', 'crop.Mandua': 'Mandua/Ragi', 'crop.Jhangora': 'Jhangora', 'crop.Rajma': 'Rajma',
    'crop.Ginger': 'Ginger', 'crop.Kidney Beans': 'Kidney Beans', 'crop.Buckwheat': 'Buckwheat', 'crop.Soybean': 'Soybean',
    'crop.Turmeric': 'Turmeric', 'crop.Garlic': 'Garlic', 'crop.Tomato': 'Tomato',
    'dist.Dehradun': 'Dehradun', 'dist.Haridwar': 'Haridwar', 'dist.Nainital': 'Nainital', 'dist.Almora': 'Almora',
    'dist.Uttarkashi': 'Uttarkashi', 'dist.Chamoli': 'Chamoli', 'dist.Pithoragarh': 'Pithoragarh', 'dist.Pauri': 'Pauri',
    'dist.Tehri': 'Tehri', 'dist.Rudraprayag': 'Rudraprayag', 'dist.Bageshwar': 'Bageshwar', 'dist.Champawat': 'Champawat', 'dist.US Nagar': 'US Nagar',
    'cat.Cereal': 'Cereal', 'cat.Legume': 'Legume', 'cat.Fruit': 'Fruit', 'cat.Vegetable': 'Vegetable', 'cat.Spice': 'Spice', 'cat.Oilseed': 'Oilseed', 'cat.Cash Crop': 'Cash Crop', 'cat.Fiber': 'Fiber',
    'label.Match': 'Match', 'label.confidence': 'confidence', 'label.IdealMatch': 'Ideal conditions match:', 'label.InIdeal': 'features in ideal range', 'label.accuracy': 'accuracy',
    'model.ready': 'AI Model Ready', 'model.failed': 'Model load failed',
    'footer.h.platform': 'Platform', 'footer.h.coverage': 'Coverage', 'footer.h.schemes': 'Schemes',
    'footer.l.uttarakhand': 'Uttarakhand', 'footer.l.districts': '13 Districts', 'footer.l.satellite': 'Satellite Data',
    'footer.l.pmfby': 'PMFBY', 'footer.l.wbcis': 'WBCIS', 'footer.l.kisan': 'Kisan Credit',
    'dash.footer.update': '🛰️ Data updates every 30 minutes',
    'hazard.landslide': 'Landslide', 'hazard.flood': 'Flood', 'hazard.drought': 'Drought', 'hazard.frost': 'Frost',
    'hazard.districts': 'Districts', 'hazard.level.high': 'HIGH level', 'hazard.level.low': 'Low levels', 'hazard.all': 'All districts',
    'advisor.how.title': '💡 How AI Scoring Works', 'advisor.how.climate': '📍 District Climate', 'advisor.how.soil': '🌿 Soil Match',
    'advisor.how.temp': '🌡️ Temperature', 'advisor.how.rain': '🌧️ Rainfall', 'advisor.how.water': '💧 Water Need',
    'advisor.voice.title': '🎙️ Voice Advisory', 'advisor.voice.desc': 'After getting your report, listen to recommendations in Hindi or English.',
    'advisor.offline.title': '📱 Offline Access', 'advisor.offline.desc': 'This page works offline. Once loaded, advisory data is cached for 24 hours.',
    'advisor.results.title': '🌾 AI Crop Recommendations for', 'advisor.results.desc': 'Ranked by Gaussian NB model confidence. Top 5 crops for your exact conditions.',
    'risk.overall': 'Overall', 'risk.status.low': 'LOW', 'risk.status.med': 'MED', 'risk.status.high': 'HIGH',
    'risk.badge.multi': 'Multi-hazard', 'risk.sat.title': '🛰️ Satellite Reading — ',
    'risk.sat.acquiring': 'Acquiring satellite data for ', 'risk.sat.ndvi': 'NDVI Index', 'risk.sat.moisture': 'Soil Moisture',
    'risk.sat.flood': 'Flood Likelihood', 'risk.sat.landslide': 'Landslide Risk', 'risk.sat.updated': 'Last updated: ',
    'index.feat.sat': 'Satellite', 'index.feat.api': 'Weather API', 'index.feat.soil': 'Soil Data',
    'index.feat.ml': 'ML Engine', 'index.feat.risk': 'Risk Scoring', 'index.feat.forecast': 'Forecasting',
    'index.feat.dash': 'Dashboard', 'index.feat.voice': 'Voice', 'index.feat.offline': 'Offline',
    'risk.radar.title': '📊 Risk Radar', 'risk.sat.hint': '👆 Select a district to view satellite data',
    'risk.ins.pmfby.full': 'Pradhan Mantri Fasal Bima Yojana', 'risk.ins.pmfby.desc': 'Comprehensive crop insurance for kharif and rabi seasons. Premium as low as 1.5%.',
    'risk.ins.wbcis.full': 'Weather Based Crop Insurance Scheme', 'risk.ins.wbcis.desc': 'Triggered by weather thresholds (rainfall, temp). Covers all weather risks.',
    'risk.ins.rwbcis.full': 'Restructured WBCIS (Horticulture)', 'risk.ins.rwbcis.desc': 'For fruit and vegetable growers. Covers apple, potato, ginger and other horticultural crops.',
    'risk.ins.kcc.full': 'Kisan Credit Card', 'risk.ins.kcc.desc': 'Credit facility for all farming needs. Linked to PMFBY for seamless insurance.',
    'soil.Loamy': 'Loamy', 'soil.Sandy': 'Sandy', 'soil.Clay': 'Clay', 'soil.Rocky': 'Rocky', 'soil.Silty': 'Silty', 'soil.Alluvial': 'Alluvial',
    'bot.sidebar.desc': 'Your 24/7 Digital Crop Doctor. Expert advice in your language.',
    'bot.sidebar.select': 'Select Language', 'bot.sidebar.topics': 'Quick Topics',    'bot.sidebar.status': 'AI Engine: Active (v2.5)',
    'bot.header.name': 'Agriculture Assistant', 'bot.header.status': 'Online • Multi-District Support',
    'bot.welcome.title': 'Welcome to KrishiMitra Chat',
    'bot.welcome.desc': 'Expert agriculture advice tailored for Uttarakhand farmers. Upload images of your crops to detect diseases instantly.',
    'bot.input.hint': 'AI results are for advisory purposes. Consult local experts for critical decisions.',
    'bot.topic.pest': 'Pest problems', 'bot.topic.yellow': 'Yellow leaves', 'bot.topic.irrigation': 'Irrigation help', 'bot.topic.schemes': 'Govt Schemes', 'bot.topic.calendar': 'Crop Calendar',
    'bot.suggest.yellow': '"My wheat leaves are turning yellow"', 'bot.suggest.pest': '"Pests in my rice field"', 'bot.suggest.irrigation': '"When to irrigate apple trees?"',
    'weather.rain.title': 'Heavy Rainfall Detected', 'weather.rain.msg': 'Heavy rainfall likely in next 48 hours. Avoid fertilizer spraying to prevent runoff.',
    'weather.heat.title': 'High Temperature Risk', 'weather.heat.msg': 'Heat stress detected. Increase irrigation frequency to protect sensitive crops like Wheat.',
    'weather.cold.title': 'Cold Stress Warning', 'weather.cold.msg': 'Low temperature detected. Potential frost risk. Consider using crop covers.',
    'weather.hum.title': 'High Humidity Risk', 'weather.hum.msg': 'Atmospheric humidity >85%. High risk of fungal disease (e.g., Late Blight). Monitor fields closely.',
    'hazard.landslide': 'Landslide', 'hazard.flood': 'Flood', 'hazard.drought': 'Drought', 'hazard.frost': 'Frost',
    'risk.overall': 'Overall Risk', 'risk.radar.title': '📊 Risk Radar', 'risk.badge.multi': 'Multi-hazard',
    'risk.sat.hint': '👆 Select a district to view satellite data', 'risk.sat.acquiring': 'Acquiring satellite data', 'risk.sat.title': '🛰️ Satellite Data -',
    'risk.sat.ndvi': 'Vegetation health (NDVI)', 'risk.sat.moisture': 'Soil moisture', 'risk.sat.flood': 'Inundation risk', 'risk.sat.landslide': 'Slope instability',
    'risk.sat.updated': 'Last updated:', 'risk.status.high': 'High', 'risk.status.med': 'Medium', 'risk.status.low': 'Low',
    'risk.ins.pmfby.full': 'Pradhan Mantri Fasal Bima Yojana', 'risk.ins.pmfby.desc': 'Comprehensive insurance cover for crop loss due to unforeseen events.',
    'risk.ins.wbcis.full': 'Weather Based Crop Insurance Scheme', 'risk.ins.wbcis.desc': 'Protection against losses due to adverse weather parameters like rainfall/temp.',
    'risk.ins.rwbcis.full': 'Restructured WBCIS', 'risk.ins.rwbcis.desc': 'Specialized insurance cover for horticulture and specific crops.',
    'risk.ins.kcc.full': 'Kisan Credit Card', 'risk.ins.kcc.desc': 'Short-term credit for cultivation expenses and emergency farm needs.',
    'risk.insurance.desc': 'Available protection schemes for climate-risk farmers in Uttarakhand',
    'dash.quick.finance': 'Climate Finance & Insurance'
  },
  hi: {
    'nav.home': 'होम', 'nav.dashboard': 'डैशबोर्ड', 'nav.advisor': 'फसल सलाहकार', 'nav.risk': 'जलवायु जोखिम', 'nav.chatbot': 'एआई चैटबॉट',
    'lang.label': '🌐 English', 'hero.badge': '🛰️ AI जलवायु बुद्धिमत्ता',
    'hero.title': 'हर किसान के लिए<br><span class="gradient-text">अति-स्थानीय जलवायु</span><br>बुद्धिमत्ता',
    'hero.subtitle': 'उत्तराखंड और जलवायु-संवेदनशील क्षेत्रों के लघु किसानों के लिए सटीक सलाह देने के लिए उपग्रह डेटा, मौसम पूर्वानुमान और एआई फसल मॉडल का उपयोग।',
    'hero.cta': 'डैशबोर्ड देखें →', 'hero.cta2': 'फसल सलाह लें',
    'hero.info': 'लाइव डेटा • 13 उत्तराखंड जिले • हर 30 मिनट में अपडेट', 'hero.scroll': 'खोजने के लिए स्क्रॉल करें',
    'index.stat1.label': 'जिलों को कवर किया', 'index.stat2.label': 'फसल की किस्में', 'index.stat3.label': 'जोखिम अलर्ट जारी', 'index.stat4.label': 'सलाह सटीकता', 'index.stat5.label': 'किसानों की सेवा की',
    'index.features.tag': '🚀 प्लेटफॉर्म की विशेषताएं', 'index.features.title': 'जलवायु-स्मार्ट खेती के छह स्तंभ', 'index.features.desc': 'एग्रीटेक चुनौती के छह प्रमुख नवाचार क्षेत्रों के आसपास डिज़ाइन किया गया',
    'index.feat1.title': 'एआई फसल पूर्वानुमान', 'index.feat1.desc': '35 प्रमुख फसलों के लिए एमएल-पावर्ड उपयुक्तता स्कोरिंग। आपके खेत के लिए सर्वोत्तम किस्म की सिफारिश करने के लिए मिट्टी के प्रकार, मौसम और जलवायु डेटा का मिलान करता है।',
    'index.feat2.title': 'उपग्रह जोखिम भविष्यवाणी', 'index.feat2.desc': 'उपग्रह फीड से वास्तविक समय एनडीवीआई, मिट्टी की नमी और बाढ़ की संभावना। भूस्खलन, सूखा और अत्यधिक वर्षा के लिए त्वरित जोखिम अलर्ट।',
    'index.feat3.title': 'जलवायु वित्त और बीमा', 'index.feat3.desc': 'एकीकृत PMFBY, WBCIS, और RWBCIS योजना सलाहकार। जिला-वार बीमा पात्रता और दावा मार्गदर्शन आपकी उंगलियों पर।',
    'index.feat4.title': 'आवाज सलाह', 'index.feat4.desc': 'हिंदी और अंग्रेजी में बहुभाषी आवाज सलाह। कम साक्षरता या दृश्य हानि वाले किसानों के लिए फसल की सिफारिशें जोर से बोली जाती हैं।',
    'index.feat5.title': 'ऑफलाइन-फर्स्ट आर्किटेक्चर', 'index.feat5.desc': 'ऑफलाइन डेटा कैशिंग के साथ PWA-सक्षम प्लेटफॉर्म। मुख्य सलाह इंटरनेट के बिना काम करती है - दूरस्थ हिमालयी गाँवों के लिए महत्वपूर्ण।',
    'index.feat6.title': 'हाइपर-लोकल एनालिटिक्स', 'index.feat6.desc': 'जिला-स्तर की जलवायु ग्रैन्युलैरिटी तक। उत्तराखंड के 13 जिलों के लिए 7-दिवसीय पूर्वानुमान, फसल कैलेंडर और मिट्टी स्वास्थ्य डैशबोर्ड।',
    'index.how.tag': '⚙️ यह कैसे काम करता है', 'index.how.title': 'उपग्रह से कृषि सलाह तक', 'index.how.desc': 'वास्तविक समय की अंतर्दृष्टि प्रदान करने वाला तीन-चरणीय इंटेलिजेंस पाइपलाइन',
    'index.step1.title': '🌍 डेटा अंतर्ग्रहण', 'index.step1.desc': 'उपग्रह इमेजरी (NDVI, नमी), NOAA/IMD मौसम फीड, और सरकारी मिट्टी स्वास्थ्य कार्ड डेटा वास्तविक समय में एकत्रित किए जाते हैं।',
    'index.step2.title': '🧠 एआई विश्लेषण', 'index.step2.desc': 'एमएल मॉडल भू-स्थानिक इंटेलिजेंस और फसल फेनोलॉजी मॉडल का उपयोग करके फसल उपयुक्तता, जलवायु जोखिम स्कोर और पूर्वानुमानित सलाह की गणना करते हैं।',
    'index.step3.title': '📲 किसान सलाह', 'index.step3.desc': 'डैशबोर्ड, आवाज सलाह (हिंदी/अंग्रेजी), और दूरस्थ क्षेत्रों के लिए ऑफलाइन-सक्षम PWA के माध्यम से दी जाने वाली हाइपर-लोकलाइज्ड सिफारिशें।',
    'index.districts.tag': '📍 कवरेज', 'index.districts.title': 'उत्तराखंड के सभी 13 जिले', 'index.districts.desc': 'उत्तराखंड के हर जिले में पूर्ण जलवायु इंटेलिजेंस',
    'index.cta.title': 'अपने खेत की रक्षा के लिए तैयार हैं?', 'index.cta.desc': 'होशियार निर्णय लेने के लिए एआई-पावर्ड जलवायु इंटेलिजेंस का उपयोग करने वाले हजारों किसानों से जुड़ें।',
    'index.cta.btn1': 'डैशबोर्ड देखें →', 'index.cta.btn2': 'फसल सलाह लें',
    'badge.free': '✅ किसानों के लिए मुफ्त', 'badge.offline': '📱 ऑफलाइन सक्षम', 'badge.voice': '🎙️ हिंदी आवाज समर्थन',
    'advisor.title': 'एआई फसल उपयुक्तता सलाहकार',
    'advisor.subtitle': 'हमारा प्रशिक्षित गॉसियन नेव बेयस मॉडल (<strong class="text-green">89% सटीकता</strong>) आपके जिले की जलवायु, मिट्टी और पानी का विश्लेषण करके सर्वोत्तम फसलों की सिफारिश करता है।',
    'wizard.step1': 'स्थान और मिट्टी', 'wizard.step2': 'सीजन और पानी', 'wizard.step3': 'रिपोर्ट प्राप्त करें',
    'model.loading': '⏳ एआई मॉडल लोड हो रहा है...', 'model.crops': '🌾 35 फसल श्रेणियां', 'model.samples': '📊 7,000 ट्रेनिंग सैंपल', 'model.features': '7 विशेषताएं',
    'step1.title': '📍 चरण 1: स्थान और मिट्टी का प्रकार', 'step1.desc': 'जलवायु-मिलान सिफारिशों के लिए अपने जिले और मिट्टी के प्रकार का चयन करें',
    'form.district.label': 'जिला', 'form.district.placeholder': 'जिला चुनें...',
    'form.soil.label': 'मिट्टी का प्रकार', 'form.soil.placeholder': 'मिट्टी का प्रकार चुनें...',
    'soil.loamy': '🌿 दोमट (Loamy) — अधिकांश फसलों के लिए सर्वोत्तम', 'soil.clay': '🏺 चिकनी मिट्टी (Clay) — उच्च नमी धारण क्षमता', 'soil.sandy': '🏜️ रेतीली (Sandy) — तेजी से जल निकासी', 'soil.alluvial': '🌊 जलोढ़ (Alluvial) — अत्यधिक उपजाऊ', 'soil.silty': '💧 गाद वाली मिट्टी (Silty) — चिकनी, पानी रोकने वाली', 'soil.rocky': '⛰️ पथरीली (Rocky) — पहाड़ी इलाका',
    'step2.title': '🌦️ चरण 2: सीजन और पानी की उपलब्धता', 'step2.desc': 'वर्तमान बुवाई का मौसम और आपकी सिंचाई क्षमता',
    'form.season.label': 'बुवाई का मौसम', 'form.season.placeholder': 'सीजन चुनें...', 'season.kharif': '🌧️ खरीफ — जून से नवंबर (मानसून)', 'season.rabi': '❄️ रबी — नवंबर से अप्रैल (सर्दी)',
    'form.water.label': 'पानी / सिंचाई', 'form.water.placeholder': 'उपलब्धता चुनें...', 'water.high': '💧💧💧 उच्च — नहर / ट्यूबवेल', 'water.medium': '💧💧 मध्यम — वर्षा + आंशिक सिंचित', 'water.low': '💧 निम्न — केवल वर्षा आधारित',
    'btn.next1': 'अगला: सीजन और पानी →', 'btn.next2': 'अगला: रिपोर्ट प्राप्त करें →', 'btn.back': '← पीछे', 'btn.report': 'एआई विश्लेषण उत्पन्न करें →',
    'step3.title': '🤖 चरण 3: एआई विश्लेषण तैयार है', 'step3.desc': 'हमारा एआई इंजन आपकी व्यक्तिगत फसल सलाह उत्पन्न करने के लिए तैयार है',
    'summary.title': 'आपका फार्म प्रोफाइल सारांश',
    'dash.title': 'जलवायु डैशबोर्ड', 'dash.weather': '7-दिवसीय जलवायु प्रवृत्ति', 'dash.risk': '⚡ जोखिम अलर्ट',
    'dash.ndvi.title': '🛰️ एनडीवीआई और वनस्पति', 'dash.ndvi.label': 'वनस्पति स्वास्थ्य सूचकांक',
    'dash.ndvi.success': '✅ निगरानी क्षेत्र में स्वस्थ वनस्पति का पता चला',
    'dash.metrics.cover': 'फसल आवरण', 'dash.metrics.soil': 'मिट्टी का प्रकार', 'dash.metrics.irrigation': 'सिंचाई',
    'dash.calendar.title': '📅 फसल कैलेंडर', 'dash.calendar.subtitle': 'आपके जिले में वर्तमान सीजन के लिए अनुशंसित फसलें:',
    'dash.tip.title': '💡 मौसमी सुझाव', 'dash.tip.text': 'मार्च रबी की कटाई और शुरुआती खरीफ की तैयारी के लिए आदर्श है। बुवाई से पहले मिट्टी की नमी की जांच करें।',
    'dash.quick.title': '🔗 त्वरित कार्य',
    'dash.quick.advice': '🤖 एआई फसल सलाह लें', 'dash.quick.risk': '⚠️ जोखिम मानचित्र देखें',
    'dash.quick.pmfby': '🛡️ PMFBY के लिए आवेदन करें', 'dash.quick.kcc': '💳 किसान क्रेडिट कार्ड', 'dash.quick.helpline': '📞 किसान हेल्पलाइन (1800)',
    'nav.cta': 'डैशबोर्ड खोलें →',
    'risk.title': 'जिला जोखिम खुफिया मानचित्र', 'risk.map': '🗺️ उत्तराखंड जोखिम मानचित्र', 'risk.desc': 'सैटेलाइट डेटा, मौसम फीड और भूगर्भीय सर्वेक्षणों का उपयोग करके उत्तराखंड के सभी 13 जिलों के लिए वास्तविक समय जलवायु जोखिम मूल्यांकन।',
    'risk.badge.high': '🔴 उच्च जोखिम वाले जिले', 'risk.badge.medium': '🟡 मध्यम जोखिम', 'risk.badge.low': '🟢 कम जोखिम', 'risk.badge.sat': '🛰️ अंतिम उपग्रह पास: 2 घंटे पहले',
    'risk.hint': 'विस्तृत जोखिम विवरण देखने के लिए किसी भी जिले पर क्लिक करें',
    'footer.copy': '© 2026 कृषि-मित्र', 'footer.stats': '🤖 जीएनबी मॉडल v2.0 · 89% सटीकता · 7,000 ट्रेनिंग सैंपल · 35 फसलें',
    'footer.brand.desc': 'जलवायु-संवेदनशील क्षेत्रों में छोटे किसानों के लिए एआई-पावर्ड जलवायु इंटेलिजेंस प्लेटफॉर्म।',
    'dash.label.temp': 'तापमान', 'dash.label.humidity': 'नमी', 'dash.label.rainfall': 'वर्षा', 'dash.label.wind': 'हवा की गति',
    'dash.sub.temp': 'वर्तमान औसत', 'dash.sub.humidity': 'सापेक्ष %', 'dash.sub.rainfall': '7-दिवसीय औसत (मिमी)', 'dash.sub.wind': 'किमी/घंटा',
    'dash.weather.sub': 'तापमान और वर्षा पूर्वानुमान', 'dash.status.live': '✅ लाइव', 'dash.status.updating': '🔄 अपडेट हो रहा है...', 'dash.status.active': 'सक्रिय',
    'dash.risk.low': '🟢 कम जोखिम', 'dash.risk.medium': '🟡 मध्यम जोखिम', 'dash.risk.high': '🔴 उच्च जोखिम',
    'dash.label.satellite': 'सैटेलाइट',
    'alert.low.t1': 'अनुकूल परिस्थितियाँ', 'alert.low.m1': 'मौसम का मिजाज स्थिर है। बुवाई और सिंचाई के लिए आदर्श।',
    'alert.low.t2': 'मिट्टी की नमी इष्टतम', 'alert.low.m2': 'मिट्टी की नमी 68% है — वर्तमान फसल चरण के लिए इष्टतम।',
    'alert.med.t1': 'मध्यम वर्षा अलर्ट', 'alert.med.m1': 'इस सप्ताह औसत से अधिक वर्षा की भविष्यवाणी। उर्वरक आवेदन में देरी करें।',
    'alert.med.t2': 'तापमान में उतार-चढ़ाव', 'alert.med.m2': '12°C की दैनिक भिन्नता का पता चला। रात में गर्मी के प्रति संवेदनशील फसलों की रक्षा करें।',
    'alert.med.t3': 'सैटेलाइट NDVI अपडेट', 'alert.med.m3': 'वनस्पति सूचकांक 76% कृषि क्षेत्रों में स्वस्थ फसल वृद्धि दर्शाता है।',
    'alert.high.t1': 'भारी वर्षा की चेतावनी', 'alert.high.m1': '36 घंटों में भारी वर्षा (>50मिमी) का पूर्वानुमान। खेतों की तुरंत निकासी करें।',
    'alert.high.t2': 'भूस्खलन जोखिम अलर्ट', 'alert.high.m2': 'भूगर्भीय सर्वेक्षण इस सप्ताह भूस्खलन की बढ़ी हुई संभावना दर्शाता है।',
    'alert.high.t3': 'बाढ़ सलाह', 'alert.high.m3': 'नदी का स्तर बढ़ रहा है। पशुओं को निचले इलाकों से दूर रखें।',
    'alert.high.t4': 'तेज हवा की सलाह', 'alert.high.m4': '45 किमी/घंटा तक की हवा की गति की उम्मीद है। फसल कवर और पॉलीटनल सुरक्षित करें।',
    'chart.temp': 'तापमान (°C)', 'chart.rain': 'वर्षा (मिमी)',
    'unit.temp': '°C', 'unit.hum': '%', 'unit.rain': 'मिमी', 'unit.wind': ' किमी/घंटा',
    'crop.Wheat': 'गेहूं', 'crop.Rice': 'धान', 'crop.Sugarcane': 'गन्ना', 'crop.Vegetables': 'सब्जियां',
    'crop.Potato': 'आलू', 'crop.Mustard': 'सरसों', 'crop.Apple': 'सेब', 'crop.Peach': 'आड़ू',
    'crop.Barley': 'जौ', 'crop.Mandua': 'मंडुआ/रागी', 'crop.Jhangora': 'झंगोरा', 'crop.Rajma': 'राजमा',
    'crop.Ginger': 'अदरक', 'crop.Kidney Beans': 'राजमा (Red Beans)', 'crop.Buckwheat': 'कुट्टू', 'crop.Soybean': 'सोयाबीन',
    'crop.Turmeric': 'हल्दी', 'crop.Garlic': 'लहसुन', 'crop.Tomato': 'टमाटर',
    'dist.Dehradun': 'देहरादून', 'dist.Haridwar': 'हरिद्वार', 'dist.Nainital': 'नैनीताल', 'dist.Almora': 'अल्मोड़ा',
    'dist.Uttarkashi': 'उत्तरकाशी', 'dist.Chamoli': 'चमोली', 'dist.Pithoragarh': 'पिथौरागढ़', 'dist.Pauri': 'पौड़ी',
    'dist.Tehri': 'टिहरी', 'dist.Rudraprayag': 'रुद्रप्रयाग', 'dist.Bageshwar': 'बागेश्वर', 'dist.Champawat': 'चम्पावत', 'dist.US Nagar': 'यूएस नगर',
    'cat.Cereal': 'अनाज (Cereal)', 'cat.Legume': 'दलहन (Legume)', 'cat.Fruit': 'फल (Fruit)', 'cat.Vegetable': 'सब्जी (Vegetable)', 'cat.Spice': 'मसाला (Spice)', 'cat.Oilseed': 'तिलहन (Oilseed)', 'cat.Cash Crop': 'नकदी फसल (Cash Crop)', 'cat.Fiber': 'रेशा (Fiber)',
    'label.Match': 'मैच', 'label.confidence': 'विश्वास', 'label.IdealMatch': 'आदर्श परिस्थितियों का मिलान:', 'label.InIdeal': 'विशेषताएं आदर्श सीमा में', 'label.accuracy': 'सटीकता',
    'model.ready': 'एआई मॉडल तैयार है', 'model.failed': 'मॉडल लोड विफल',
    'footer.h.platform': 'प्लेटफॉर्म', 'footer.h.coverage': 'कवरेज', 'footer.h.schemes': 'योजनाएं',
    'footer.l.uttarakhand': 'उत्तराखंड', 'footer.l.districts': '13 जिले', 'footer.l.satellite': 'उपग्रह डेटा',
    'footer.l.pmfby': 'पीएमएफबीवाई', 'footer.l.wbcis': 'डब्लूबीसीआईएस', 'footer.l.kisan': 'किसान क्रेडिट',
    'dash.footer.update': '🛰️ डेटा हर 30 मिनट में अपडेट होता है',
    'hazard.landslide': 'भूस्खलन', 'hazard.flood': 'बाढ़', 'hazard.drought': 'सूखा', 'hazard.frost': 'पाला',
    'hazard.districts': 'जिले', 'hazard.level.high': 'उच्च स्तर', 'hazard.level.low': 'निम्न स्तर', 'hazard.all': 'सभी जिले',
    'advisor.how.title': '💡 एआई स्कोरिंग कैसे काम करती है', 'advisor.how.climate': '📍 जिला जलवायु', 'advisor.how.soil': '🌿 मिट्टी मिलान',
    'advisor.how.temp': '🌡️ तापमान', 'advisor.how.rain': '🌧️ वर्षा', 'advisor.how.water': '💧 पानी की आवश्यकता',
    'advisor.voice.title': '🎙️ आवाज सलाह', 'advisor.voice.desc': 'अपनी रिपोर्ट प्राप्त करने के बाद, हिंदी या अंग्रेजी में सिफारिशें सुनें।',
    'advisor.offline.title': '📱 ऑफलाइन एक्सेस', 'advisor.offline.desc': 'यह पेज ऑफलाइन काम करता है। लोड होने के बाद, सलाह डेटा 24 घंटे के लिए कैश्ड रहता है।',
    'advisor.results.title': '🌾 एआई फसल सिफारिशें - ', 'advisor.results.desc': 'गॉसियन एनबी मॉडल विश्वास द्वारा रैंक किया गया। आपकी सटीक स्थितियों के लिए शीर्ष 5 फसलें।',
    'risk.radar.title': '📊 जोखिम रडार', 'risk.sat.hint': '👆 उपग्रह डेटा देखने के लिए किसी जिले का चयन करें',
    'risk.ins.pmfby.full': 'प्रधानमंत्री फसल बीमा योजना', 'risk.ins.pmfby.desc': 'खरीफ और रबी सीजन के लिए व्यापक फसल बीमा। प्रीमियम 1.5% तक कम।',
    'risk.ins.wbcis.full': 'मौसम आधारित फसल बीमा योजना', 'risk.ins.wbcis.desc': 'मौसम की सीमा (बारिश, तापमान) द्वारा ट्रिगर। सभी मौसम जोखिमों को कवर करता है।',
    'risk.ins.rwbcis.full': 'पुनर्गठित WBCIS (बागवानी)', 'risk.ins.rwbcis.desc': 'फल और सब्जी उत्पादकों के लिए। सेब, आलू, अदरक और अन्य बागवानी फसलों को कवर करता है।',
    'risk.ins.kcc.full': 'किसान क्रेडिट कार्ड', 'risk.ins.kcc.desc': 'सभी कृषि आवश्यकताओं के लिए ऋण सुविधा। निर्बाध बीमा के लिए PMFBY से जुड़ा है।',
    'soil.Loamy': 'दोमट (Loamy)', 'soil.Sandy': 'रेतीली (Sandy)', 'soil.Clay': 'चीकनी (Clay)', 'soil.Rocky': 'पथरीली (Rocky)', 'soil.Silty': 'गाद (Silty)', 'soil.Alluvial': 'जलोढ़ (Alluvial)',
    'bot.sidebar.desc': 'आपका 24/7 डिजिटल क्रॉप डॉक्टर। आपकी भाषा में विशेषज्ञ सलाह।',
    'bot.sidebar.select': 'भाषा चुनें', 'bot.sidebar.topics': 'त्वरित विषय', 'bot.sidebar.status': 'एआई इंजन: सक्रिय (v2.4)',
    'bot.header.name': 'कृषि सहायक', 'bot.header.status': 'ऑनलाइन • बहु-जिला समर्थन',
    'bot.welcome.title': 'कृषि-मित्र चैट में आपका स्वागत है',
    'bot.welcome.desc': 'उत्तराखंड के किसानों के लिए विशेषज्ञ कृषि सलाह। रोगों का तुरंत पता लगाने के लिए अपनी फसलों की तस्वीरें अपलोड करें।',
    'bot.input.hint': 'एआई परिणाम केवल सलाहकार उद्देश्यों के लिए हैं। महत्वपूर्ण निर्णयों के लिए स्थानीय विशेषज्ञों से परामर्श लें।',
    'bot.topic.pest': 'कीट समस्या', 'bot.topic.yellow': 'पीली पत्तियाँ', 'bot.topic.irrigation': 'सिंचाई सहायता', 'bot.topic.schemes': 'सरकारी योजनाएं', 'bot.topic.calendar': 'फसल कैलेंडर',
    'bot.suggest.yellow': '"मेरे गेहूं की पत्तियां पीली हो रही हैं"', 'bot.suggest.pest': '"मेरे धान के खेत में कीड़े हैं"', 'bot.suggest.irrigation': '"सेब के पेड़ों की सिंचाई कब करें?"',
    'weather.rain.title': 'भारी वर्षा की सूचना', 'weather.rain.msg': 'अगले 48 घंटों में भारी बारिश की संभावना। बहाव को रोकने के लिए उर्वरक के छिड़काव से बचें।',
    'weather.heat.title': 'उच्च तापमान जोखिम', 'weather.heat.msg': 'गर्मी का तनाव (Heat stress) पाया गया। गेहूं जैसी संवेदनशील फसलों की रक्षा के लिए सिंचाई की आवृत्ति बढ़ाएं।',
    'weather.cold.title': 'शीत तनाव की चेतावनी', 'weather.cold.msg': 'कम तापमान पाया गया। पाले (Frost) का संभावित जोखिम। फसल कवर का उपयोग करने पर विचार करें।',
    'weather.hum.title': 'उच्च आर्द्रता जोखिम', 'weather.hum.msg': 'वायुमंडलीय आर्द्रता >85%। कवक रोग (जैसे पछेती झुलसा) का उच्च जोखिम। खेतों की बारीकी से निगरानी करें।',
    'hazard.landslide': 'भूस्खलन', 'hazard.flood': 'बाढ़', 'hazard.drought': 'सूखा', 'hazard.frost': 'पाला',
    'risk.overall': 'कुल जोखिम', 'risk.radar.title': '📊 जोखिम रडार', 'risk.badge.multi': 'बहु-जोखिम',
    'risk.sat.hint': '👆 उपग्रह डेटा देखने के लिए एक जिला चुनें', 'risk.sat.acquiring': 'उपग्रह डेटा प्राप्त किया जा रहा है', 'risk.sat.title': '🛰️ उपग्रह डेटा -',
    'risk.sat.ndvi': 'वनस्पति स्वास्थ्य (NDVI)', 'risk.sat.moisture': 'मिट्टी की नमी', 'risk.sat.flood': 'बाढ़ का खतरा', 'risk.sat.landslide': 'ढलान अस्थिरता',
    'risk.sat.updated': 'अंतिम अपडेट:', 'risk.status.high': 'उच्च', 'risk.status.med': 'मध्यम', 'risk.status.low': 'कम',
    'risk.ins.pmfby.full': 'प्रधानमंत्री फसल बीमा योजना', 'risk.ins.pmfby.desc': 'अप्रत्याशित घटनाओं के कारण फसल के नुकसान के लिए व्यापक बीमा कवर।',
    'risk.ins.wbcis.full': 'मौसम आधारित फसल बीमा योजना', 'risk.ins.wbcis.desc': 'बारिश/तापमान जैसे प्रतिकूल मौसम मापदंडों के कारण होने वाले नुकसान से सुरक्षा।',
    'risk.ins.rwbcis.full': 'पुनर्गठित WBCIS', 'risk.ins.rwbcis.desc': 'बागवानी और विशिष्ट फसलों के लिए विशेष बीमा कवर।',
    'risk.ins.kcc.full': 'किसान क्रेडिट कार्ड', 'risk.ins.kcc.desc': 'खेती के खर्च और आपातकालीन जरूरतों के लिए अल्पकालिक क्रेडिट।',
    'risk.insurance.desc': 'उत्तराखंड के किसानों के लिए उपलब्ध सुरक्षा योजनाएं',
    'dash.quick.finance': 'जलवायु वित्त और बीमा'
  }
};

// ── Global Translation Helper ──────────────────────────────
window.t = function(key) {
  const lang = localStorage.getItem('km-lang') || 'en';
  return (LANG[lang] && LANG[lang][key]) ? LANG[lang][key] : key;
};

let currentLang = 'en';

function applyLanguage(lang) {
  console.log('[i18n] Applying language:', lang);
  currentLang = lang;
  localStorage.setItem('km-lang', lang);
  document.querySelectorAll('[data-lang]').forEach(el => {
    const key = el.dataset.lang;
    if (LANG[lang] && LANG[lang][key]) {
      el.innerHTML = LANG[lang][key];
    }
  });

  // Update active state for ALL language chips (Navbar + Sidebar)
  document.querySelectorAll('.lang-chip').forEach(chip => {
    chip.classList.toggle('active', chip.dataset.lang === lang);
  });

  // Signal other components (Dashboard, Chatbot) that language has changed
  window.dispatchEvent(new CustomEvent('langChanged', { detail: { lang } }));
}

// ── Mutation Observer for Dynamic Content ───────────────────
function initTranslationObserver() {
  const observer = new MutationObserver((mutations) => {
    const lang = localStorage.getItem('km-lang') || 'en';
    
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1) { // Element
          // 1. Check node itself
          if (node.hasAttribute('data-lang')) translateElement(node, lang);
          // 2. Check children
          node.querySelectorAll('[data-lang]').forEach(el => translateElement(el, lang));
        }
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

function translateElement(el, lang) {
  const key = el.dataset.lang;
  if (LANG[lang] && LANG[lang][key]) {
    el.innerHTML = LANG[lang][key];
  }
}

// ── Navigation ──────────────────────────────────────────────
function initNavbar() {
  const nav = document.querySelector('.navbar');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });

  const page = window.location.pathname.split('/').pop() || 'home.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === page);
  });
}

// ── Transitions ─────────────────────────────────────────────
function initPageTransitions() {
  const overlay = document.getElementById('page-overlay');
  if (!overlay) return;
  overlay.classList.remove('active');

  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') ||
        href.startsWith('mailto') || link.hasAttribute('data-no-transition')) return;

    link.addEventListener('click', (e) => {
      e.preventDefault();
      overlay.classList.add('active');
      setTimeout(() => { window.location.href = href; }, 380);
    });
  });
}

// ── Scroll Reveal ────────────────────────────────────────────
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const delay = e.target.dataset.delay || 0;
        setTimeout(() => e.target.classList.add('visible'), delay);
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  els.forEach(el => observer.observe(el));
}

// ── Counter ──────────────────────────────────────────────────
function animateCounter(el, target, duration = 1800, suffix = '') {
  let start = 0;
  const step = timestamp => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(ease * target).toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animateCounter(e.target, parseInt(e.target.dataset.count), 1800, e.target.dataset.suffix || '');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => observer.observe(c));
}

// ── 3D Tilt ──────────────────────────────────────────────────
function initTiltCards() {
  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `perspective(800px) rotateX(${-y * 10}deg) rotateY(${x * 10}deg) scale(1.02)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale(1)';
    });
  });
}

// ── Particles ────────────────────────────────────────────────
function initParticleCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
  resize();
  window.addEventListener('resize', resize);

  const particles = [];
  for (let i = 0; i < 80; i++) {
    particles.push({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 1.8 + 0.3,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.6 + 0.15,
      color: Math.random() > 0.6 ? '#00e571' : Math.random() > 0.5 ? '#f5a623' : '#4a9eff'
    });
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
    });
    requestAnimationFrame(loop);
  }
  loop();
}

// ── Language Selector (Chips) ───────────────────────────────
function initLangSelector() {
  document.addEventListener('click', (e) => {
    // 1. Single Toggle Button Support (Navbar)
    const toggle = e.target.closest('#lang-btn');
    if (toggle) {
      const next = currentLang === 'en' ? 'hi' : 'en';
      applyLanguage(next);
      return;
    }

    // 2. Chip Support (Chatbot Sidebar)
    const chip = e.target.closest('.lang-chip');
    if (chip && chip.dataset.lang) {
      applyLanguage(chip.dataset.lang);
    }
  });
}

// ── Utils ───────────────────────────────────────────────────
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
    });
  });
}

function initMobileNav() {
  const toggle = document.getElementById('mobile-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (toggle && navLinks) toggle.addEventListener('click', () => navLinks.classList.toggle('open'));
}

// ── Initialization ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initPageTransitions();
  initScrollReveal();
  initCounters();
  initTiltCards();
  initParticleCanvas();
  initLangSelector();
  initSmoothScroll();
  initMobileNav();

  const savedLang = localStorage.getItem('km-lang') || 'en';
  applyLanguage(savedLang);
  initTranslationObserver();

  document.body.style.opacity = '0';
  requestAnimationFrame(() => {
    document.body.style.transition = 'opacity 0.5s ease';
    document.body.style.opacity = '1';
  });
});
