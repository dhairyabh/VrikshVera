from flask import Flask, request, jsonify
from flask_cors import CORS
from models_inference import VrikshInference
import os
import uuid
import requests
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize Inference Engine
# Expects models in 'models' directory relative to app.py
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, 'models')
inference = VrikshInference(model_dir=MODEL_DIR)

UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/')
def home():
    return """
    <html>
        <body style='font-family: sans-serif; text-align: center; padding-top: 50px;'>
            <h1 style='color: #2e7d32;'>🌿 VrikshVera AI Server is Active</h1>
            <p>API endpoints are ready for inference:</p>
            <ul style='list-style: none; padding: 0;'>
                <li><b>/predict/crop</b> - Crop Recommendation (MLP)</li>
                <li><b>/predict/soil</b> - Soil Vision (MobileNetV3)</li>
                <li><b>/predict/fertilizer</b> - Fertilizer Advice (GB)</li>
            </ul>
        </body>
    </html>
    """

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "models_loaded": True})

@app.route('/predict/crop', methods=['POST'])
def predict_crop():
    data = request.json
    try:
        # Features: N, P, K, ph (Matching trained checkpoint shape)
        n  = float(data.get('n'))
        p  = float(data.get('p'))
        k  = float(data.get('k'))
        ph = float(data.get('ph'))
        
        results = inference.predict_crop(n, p, k, ph)
        return jsonify({"status": "success", "predictions": results})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

@app.route('/predict/soil', methods=['POST'])
def predict_soil():
    if 'image' not in request.files:
        return jsonify({"status": "error", "message": "No image uploaded"}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({"status": "error", "message": "No file selected"}), 400
    
    # Save temp file
    filename = str(uuid.uuid4()) + "_" + file.filename
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)
    
    try:
        results = inference.predict_soil(filepath)
        # Cleanup
        os.remove(filepath)
        return jsonify({"status": "success", "predictions": results})
    except Exception as e:
        if os.path.exists(filepath): os.remove(filepath)
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/predict/fertilizer', methods=['POST'])
def predict_fertilizer():
    data = request.json
    try:
        soil_type = data.get('soil_type')
        crop_type = data.get('crop_type')
        n = float(data.get('n'))
        p = float(data.get('p'))
        k = float(data.get('k'))
        
        result = inference.predict_fertilizer(soil_type, crop_type, n, p, k)
        return jsonify({"status": "success", "recommendation": result})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

@app.route('/api/weather', methods=['GET'])
def get_weather():
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    api_key = os.environ.get('OPENWEATHERMAP_API_KEY')
    if not api_key:
        return jsonify({"status": "error", "message": "API key missing from environment"}), 500
    
    url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={api_key}&units=metric"
    try:
        response = requests.get(url)
        return jsonify(response.json()), response.status_code
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    api_key = os.environ.get('GROQ_API_KEY')
    if not api_key:
        return jsonify({"status": "error", "message": "API key missing from environment"}), 500
        
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {api_key}'
    }
    try:
        response = requests.post(url, headers=headers, json=request.json)
        return jsonify(response.json()), response.status_code
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    # Running on 5000 by default
    app.run(host='0.0.0.0', port=5000, debug=True)
