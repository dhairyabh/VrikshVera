import pandas as pd
import numpy as np

df = pd.read_csv('data/Crop_and_Soil.csv')
print("Dataset Shape:", df.shape)
print("\nFirst 5 rows:")
print(df.head())

print("\nValue Counts for Target (Fertilizer Name):")
print(df['Fertilizer Name'].value_counts())

print("\nValue Counts for Soil Type:")
print(df['Soil Type'].value_counts())

print("\nValue Counts for Crop Type:")
print(df['Crop Type'].value_counts())

print("\nDuplicate Rows:", df.duplicated().sum())

# Check for rows with same features but different labels
features = ['Moisture', 'Soil Type', 'Crop Type', 'Nitrogen', 'Potassium', 'Phosphorous']
grouped = df.groupby(features).size().reset_index(name='counts')
redundant_configs = grouped[grouped['counts'] > 1]
print("\nRedundant Feature Configurations (multiple rows):", len(redundant_configs))

# Check for rows with same features but DIFFERENT labels
grouped_diff = df.groupby(features)['Fertilizer Name'].nunique().reset_index(name='nunique_labels')
conflicting_configs = grouped_diff[grouped_diff['nunique_labels'] > 1]
print("\nConflicting Configurations (same features, different labels):", len(conflicting_configs))
