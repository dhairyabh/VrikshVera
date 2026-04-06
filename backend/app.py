import os
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
from models_inference import VrikshInference

# Load environment variables
load_dotenv()

app = Flask(__name__, static_folder='../', static_url_path='')
CORS(app)  # Enable CORS for all routes

# API Keys from .env
GROQ_API_KEY = os.getenv('GROQ_API_KEY')
OPENWEATHER_API_KEY = os.getenv('OPENWEATHER_API_KEY')

# Weather Cache: { (lat, lon): { 'data': ..., 'expiry': ... } }
weather_cache = {}
CACHE_DURATION_SEC = 600  # 10 minutes

# Initialize Inference Engine
inference = VrikshInference()

# Configuration
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "healthy", 
        "message": "VrikshVera AI Backend is running",
        "features": {
            "chat": bool(GROQ_API_KEY),
            "weather": bool(OPENWEATHER_API_KEY)
        }
    })

@app.route('/predict/crop', methods=['POST'])
def predict_crop():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"status": "error", "message": "No JSON payload provided"}), 400
            
        print(f"--- Recv Crop Prediction Request ---")
        # Extract features (handling both short and long keys from frontend)
        n = float(data.get('n', 0))
        p = float(data.get('p', 0))
        k = float(data.get('k', 0))
        temp = float(data.get('temp', 0))
        # Handle 'hum' or 'humidity'
        humidity = float(data.get('humidity', data.get('hum', 0)))
        ph = float(data.get('ph', 0))
        # Handle 'rain' or 'rainfall'
        rainfall = float(data.get('rainfall', data.get('rain', 0)))
        
        print(f"Inputs: N={n}, P={p}, K={k}, T={temp}, H={humidity}, pH={ph}, R={rainfall}")
        
        # Get predictions
        predictions = inference.predict_crop(n, p, k, temp, humidity, ph, rainfall)
        
        if predictions:
            print(f"Result: {predictions[0]['crop']} ({predictions[0]['confidence']}%)")
            return jsonify({
                "status": "success",
                "predictions": predictions
            })
        else:
            return jsonify({
                "status": "error",
                "message": "Model failed to generate predictions"
            }), 500
            
    except Exception as e:
        print(f"Prediction Error: {str(e)}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 400

@app.route('/api/chat', methods=['POST'])
def chat():
    if not GROQ_API_KEY:
        return jsonify({"status": "error", "message": "GROQ_API_KEY not configured"}), 503
        
    try:
        data = request.json
        # Proxy request to Groq SDK / API
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }
        res = requests.post(url, headers=headers, json=data)
        return jsonify(res.json()), res.status_code
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/weather', methods=['GET'])
def get_weather():
    if not OPENWEATHER_API_KEY:
        # Fallback if no API key
        return jsonify({"status": "error", "message": "OPENWEATHER_API_KEY not configured"}), 503
        
    try:
        lat = request.args.get('lat')
        lon = request.args.get('lon')
        if not lat or not lon:
            return jsonify({"status": "error", "message": "Latitude and Longitude are required"}), 400
            
        # Check Cache
        cache_key = (lat, lon)
        import time
        now = time.time()
        if cache_key in weather_cache:
            entry = weather_cache[cache_key]
            if now < entry['expiry']:
                print(f"--- Cache HIT for Weather ({lat}, {lon}) ---")
                return jsonify(entry['data']), 200

        print(f"--- Cache MISS for Weather ({lat}, {lon}) ---")
        url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={OPENWEATHER_API_KEY}&units=metric"
        res = requests.get(url)
        data = res.json()
        
        if res.status_code == 200:
            weather_cache[cache_key] = {
                'data': data,
                'expiry': now + CACHE_DURATION_SEC
            }
            
        return jsonify(data), res.status_code
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/predict/soil', methods=['POST'])
def predict_soil():
    if 'image' not in request.files:
        return jsonify({"status": "error", "message": "No image uploaded"}), 400
        
    file = request.files['image']
    if file.filename == '':
        return jsonify({"status": "error", "message": "No selected file"}), 400
        
    if file:
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Get soil prediction
        result = inference.predict_soil(filepath)
        
        # Clean up the file after prediction
        if os.path.exists(filepath):
            os.remove(filepath)
            
        if result:
            return jsonify({
                "status": "success",
                "predictions": [result] # Return as list for compatibility
            })
        else:
            return jsonify({
                "status": "error",
                "message": "Soil prediction failed"
            }), 500

@app.route('/predict/fertilizer', methods=['POST'])
def predict_fertilizer():
    try:
        data = request.json
        crop = data.get('crop_type', '').lower()
        n = float(data.get('n', 0))
        p = float(data.get('p', 0))
        k = float(data.get('k', 0))
        
        recommendations = []
        if n < 30: recommendations.append("Apply High Nitrogen fertilizer (Urea)")
        if p < 20: recommendations.append("Use Phosphorus-rich fertilizer (DAP)")
        if k < 20: recommendations.append("Add Potassium supplement (MOP)")
        if not recommendations: recommendations.append("Balanced soil nutrients. Continue regular composting.")
            
        return jsonify({
            "status": "success",
            "recommendation": " | ".join(recommendations)
        })
        
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

# ── Frontend Routes ─────────────────────────────────────────────

@app.route('/')
def index():
    """Serve the landing page."""
    return app.send_static_file('index.html')

@app.route('/<path:path>')
def serve_any(path):
    """Serve any other static files or fallback to index for SPA behavior."""
    if path and os.path.exists(os.path.join(app.static_folder, path)):
        return app.send_static_file(path)
    # If not found, fallback to index (helpful for navigation)
    return app.send_static_file('index.html')

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('DEBUG', 'True') == 'True'
    app.run(host='0.0.0.0', port=port, debug=debug, threaded=True)
