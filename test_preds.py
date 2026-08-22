import sys
import os
import urllib.request
import json
import random

def test_inference(n, p, k, ph):
    url = "http://localhost:5000/predict/crop"
    data = {"n": n, "p": p, "k": k, "ph": ph}
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'))
    req.add_header('Content-Type', 'application/json')
    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            top = result['predictions'][0]
            print(f"Inputs (N={n}, P={p}, K={k}, pH={ph}) -> Top: {top['crop']} ({top['confidence']}%)")
    except Exception as e:
        print(f"Error: {e}")

print("Testing default UI values:")
test_inference(40, 45, 50, 6.5)

