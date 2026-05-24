import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import pickle

datasets = {
    'diabetes': 'data/diabetes.csv',
    'heart': 'data/heart_disease.csv',
    'lung': 'data/lung_cancer.csv',
    'parkinsons': 'data/parkinson.csv',
    'thyroid': 'data/thyroid.csv',
}

model_paths = {
    'diabetes': 'model/diabetes_model.sav',
    'heart': 'model/heart_model.sav',
    'lung': 'model/lung_model.sav',
    'parkinsons': 'model/parkinsons_model.sav',
    'thyroid': 'model/thyroid_model.sav',
}

for name, path in datasets.items():
    df = pd.read_csv(path)
    X = df.iloc[:, :-1]
    y = df.iloc[:, -1]
    model = RandomForestClassifier()
    model.fit(X, y)
    pickle.dump(model, open(model_paths[name], 'wb'))
    print(f"✅ {name} model trained and saved!")