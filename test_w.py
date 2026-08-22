import urllib.request, json
def t(n, p, k, t_val, h, ph, r):
    req = urllib.request.Request(
        'http://localhost:5000/predict/crop', 
        data=json.dumps({'n':n, 'p':p, 'k':k, 'temp':t_val, 'humidity':h, 'ph':ph, 'rainfall':r}).encode('utf-8'), 
        headers={'Content-Type': 'application/json'}
    )
    res = json.loads(urllib.request.urlopen(req).read().decode('utf-8'))
    top = res['predictions'][0]
    return f"{top['crop']} ({top['confidence']}%)"

# Tehri default temp=18, hum=74. Water Low = hum-12 = 62. Rain = 96
print('Tehri with Low Water:', t(101, 44, 40, 18, 62, 6.6, 96))
# Dehradun default temp=26, hum=72. Water Low = 60. Rain = 64
print('Dehradun with Low Water:', t(101, 44, 40, 26, 60, 6.6, 64))
