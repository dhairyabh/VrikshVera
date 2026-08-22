import pickle
import numpy as np
import warnings
warnings.filterwarnings('ignore')

model = pickle.load(open('backend/models/crop_rf_model.pkl','rb'))
scaler = pickle.load(open('backend/models/crop_scaler.pkl','rb'))
le = pickle.load(open('backend/models/crop_label_encoder.pkl','rb'))

districts = [
    (26, 72, 64, 'Dehradun'),
    (29, 68, 40, 'Haridwar'),
    (19, 82, 112, 'Nainital'),
    (22, 75, 88, 'Almora'),
    (14, 65, 144, 'Uttarkashi'),
    (12, 60, 176, 'Chamoli'),
    (11, 58, 128, 'Pithoragarh'),
    (20, 70, 80, 'Pauri'),
    (18, 74, 96, 'Tehri'),
    (16, 78, 160, 'Rudraprayag'),
    (17, 76, 104, 'Bageshwar'),
    (21, 69, 72, 'Champawat'),
    (28, 73, 56, 'US Nagar')
]

for t, h, r, d in districts:
    for w_adj, w_name in [(12, 'High'), (0, 'Medium'), (-12, 'Low')]:
        hum = min(100, max(10, h + w_adj))
        X = scaler.transform(np.array([[101, 44, 40, t, hum, 6.6, r]]))
        p = model.predict_proba(X)[0]
        top_idx = np.argmax(p)
        top_crop = le.classes_[top_idx]
        
        if top_crop == 'wheat':
            print(f"BINGO! District: {d}, Water: {w_name}, Conf: {np.max(p)*100:.1f}%")
