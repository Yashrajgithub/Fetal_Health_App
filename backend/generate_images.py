import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import json
import os

# Load dataset
df = pd.read_csv('../fetal_health.csv')

# Create folder
os.makedirs('images', exist_ok=True)

mapping = {}

# Take only 10 samples
sample_df = df

for i, row in sample_df.iterrows():
    features = row.iloc[:-1].values
    label = int(row.iloc[-1])

    # ---- Create smooth signal ----
    x = np.arange(len(features))
    x_dense = np.linspace(0, len(features)-1, 300)
    signal = np.interp(x_dense, x, features)

    # ---- Normalize safely ----
    signal = (signal - np.min(signal)) / (np.max(signal) - np.min(signal) + 1e-6)

    # ---- Scale to CTG range ----
    signal = 110 + signal * 40   # ~110–150 bpm

    # ---- Add slight noise ----
    signal += np.random.normal(0, 0.5, len(signal))

    # ---- Plot ----
    plt.figure(figsize=(12, 4), facecolor='white')
    ax = plt.gca()

    # CTG paper background
    ax.set_facecolor('#f4fff8')

    # Plot waveform
    plt.plot(signal, color='black', linewidth=1)

    # ---- CTG GRID (FINAL FIXED SQUARE STYLE) ----
    ax.set_aspect(0.5)  # makes boxes square-like

    # Major ticks (big boxes)
    ax.set_yticks(np.arange(60, 201, 20))
    ax.set_xticks(np.arange(0, len(signal), 40))

    # Minor ticks (small boxes)
    ax.set_yticks(np.arange(60, 201, 5), minor=True)
    ax.set_xticks(np.arange(0, len(signal), 5), minor=True)

    # Grid styling
    ax.grid(which='major', color='#00cc99', linewidth=0.5, alpha=0.6)
    ax.grid(which='minor', color='#99e6cc', linewidth=0.3, alpha=0.4)

    # ---- Axis labels ----
    ax.set_yticklabels(np.arange(60, 201, 20), fontsize=8, color='#008060')

    time_labels = np.arange(0, len(signal), 40)
    ax.set_xticklabels([f"{int(t/10)} min" for t in time_labels],
                       fontsize=8, color='#008060')

    # Remove tick marks (clean)
    ax.tick_params(length=0)

    plt.ylabel("FHR (bpm)", fontsize=9, color='#006644')
    plt.xlabel("Time", fontsize=9, color='#006644')

    # Title
    plt.title("CTG Signal", fontsize=10)

    # Save
    filename = f"images/CTG_Report_{i+1}.png"
    plt.savefig(filename, dpi=150, bbox_inches='tight')
    plt.close()


    mapping[f"CTG_Report_{i+1}.png"] = {
        "features": features.tolist(),
        "label": label
    }

# Save mapping
with open('image_feature_map_v6.json', 'w') as f:
    json.dump(mapping, f)

print("🔥 FINAL CTG-style images (square grid) generated successfully!")

