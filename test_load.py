import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

try:
    from flask import Flask, request, jsonify
    from flask_cors import CORS
    print("Flask and CORS imports successful")
    from models_inference import VrikshInference
    print("Inference engine import successful")
    
    BASE_DIR = os.path.join(os.getcwd(), 'backend')
    MODEL_DIR = os.path.join(BASE_DIR, 'models')
    print(f"Loading models from {MODEL_DIR}")
    
    inference = VrikshInference(model_dir=MODEL_DIR)
    print("Models loaded successfully")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
