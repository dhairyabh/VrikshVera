import os
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
from models_inference import VrikshInference

# Load environment variables
load_dotenv()

# Calculate absolute root path (parent of backend/)
ROOT_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
print(f"--- Unified Server Root: {ROOT_PATH} ---")

app = Flask(__name__, static_folder=ROOT_PATH, static_url_path='')
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
        crop = data.get('crop_type', 'unknown').capitalize()
        soil = data.get('soil_type', 'unknown').capitalize()
        n = float(data.get('n', 0))
        p = float(data.get('p', 0))
        k = float(data.get('k', 0))

        print(f"--- AI Fertilizer Advisory: {crop} in {soil} (N:{n}, P:{p}, K:{k}) ---")

        # 1. Try AI-Powered Advice (Groq)
        if GROQ_API_KEY:
            try:
                url = "https://api.groq.com/openai/v1/chat/completions"
                headers = {
                    "Authorization": f"Bearer {GROQ_API_KEY}",
                    "Content-Type": "application/json"
                }
                
                system_prompt = "You are a senior agronomist at an agricultural research institute. You provide precise, scientific, and actionable fertilizer advice based on soil nutrient levels (N, P, K), soil type, and crop type. Keep responses to 2-3 short sentences. Use standard fertilizer names like Urea (46-0-0), DAP (18-46-0), and MOP (0-0-60) where applicable."
                
                user_msg = f"Provide a concise fertilizer recommendation for growing {crop} in {soil} soil. The current soil nutrient levels are Nitrogen (N): {n}, Phosphorus (P): {p}, and Potassium (K): {k}. What fertilizers should be applied and in what focus?"
                
                payload = {
                    "model": "llama-3.1-70b-versatile",
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_msg}
                    ],
                    "temperature": 0.5,
                    "max_tokens": 150
                }
                
                res = requests.post(url, headers=headers, json=payload, timeout=5)
                if res.status_code == 200:
                    ai_advice = res.json()['choices'][0]['message']['content'].strip()
                    print(f"AI Success: {ai_advice[:50]}...")
                    return jsonify({
                        "status": "success",
                        "recommendation": ai_advice,
                        "engine": "AI (Groq)"
                    })
                else:
                    print(f"AI API Error: {res.status_code}")
            except Exception as ai_err:
                print(f"AI Advisory Failure: {ai_err}")

        # 2. Robust Rule-Based Fallback
        print("Using Rule-Based Fallback...")
        recs = []
        if n < 40: recs.append(f"Soil is low in Nitrogen ({n}). Apply Urea to support vegetative growth for {crop}.")
        elif n > 150: recs.append(f"Nitrogen level ({n}) is high; avoid excessive Urea to prevent lodging.")
        
        if p < 25: recs.append(f"Phosphorus is deficient ({p}). Use DAP (18-46-0) to boost root development.")
        
        if k < 20: recs.append(f"Potassium is low ({k}). Apply MOP (Muriate of Potash) for better {crop} quality.")
        
        if not recs:
            recs.append(f"Nutrient levels (N:{n}, P:{p}, K:{k}) are well-balanced for {crop} in {soil} soil. Maintain health with organic compost.")
        
        return jsonify({
            "status": "success",
            "recommendation": " ".join(recs),
            "engine": "Rule-Based Engine"
        })
        
    except Exception as e:
        print(f"Fertilizer Route Error: {e}")
        return jsonify({"status": "error", "message": str(e)}), 400

# ── Frontend Routes ─────────────────────────────────────────────
from flask import send_from_directory

@app.route('/')
def index():
    """Serve the landing page from the absolute root."""
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    """Serve any other static files from the absolute root or fallback to index."""
    if path and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    
    # Fallback for SPA behavior
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('DEBUG', 'True') == 'True'
    app.run(host='0.0.0.0', port=port, debug=debug, threaded=True)
