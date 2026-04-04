# backend/app.py
import os
from datetime import datetime, timedelta
from functools import wraps
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
import numpy as np
import joblib
from pymongo import MongoClient
from flask_bcrypt import Bcrypt
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity
)

# Load .env
load_dotenv()

# ---------------------------
# Config
# ---------------------------
MONGO_URI = os.getenv("MONGO_URI")  # set in .env
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-secret-key")

# ---------------------------
# App init
# ---------------------------
# app = Flask(__name__, static_folder="../frontend_react/build", static_url_path="/")
app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = JWT_SECRET_KEY
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=8)

CORS(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# ---------------------------
# MongoDB init
# ---------------------------
if not MONGO_URI:
    raise RuntimeError("MONGO_URI is not set in environment variables")

client = MongoClient(MONGO_URI)
db = client.get_default_database()  # uses database from URI or fallback

users_col = db["users"]        # store doctors
patients_col = db["patients"]  # store patient records

# ---------------------------
# Load model & scaler (existing)
# ---------------------------
try:
    model = joblib.load('fetal_health_model.joblib')
    scaler = joblib.load('fetal_health_scaler.joblib')
    print("✅ Model and scaler loaded successfully!")
except Exception as e:
    print("❌ Error loading model/scaler:", e)
    model = None
    scaler = None

features_order = [
    "baseline_value",
    "abnormal_short_term_variability",
    "mean_value_of_short_term_variability",
    "percentage_of_time_with_abnormal_long_term_variability",
    "mean_value_of_long_term_variability",
    "accelerations",
    "fetal_movement",
    "uterine_contractions",
    "light_decelerations",
    "severe_decelerations",
    "prolongued_decelerations",
    "histogram_width",
    "histogram_min",
    "histogram_max",
    "histogram_number_of_peaks",
    "histogram_number_of_zeroes",
    "histogram_mode",
    "histogram_mean",
    "histogram_median",
    "histogram_variance",
    "histogram_tendency"
]

# ---------------------------
# Load image-feature mapping
# ---------------------------
import json

try:
    with open('image_feature_map.json', 'r') as f:
        image_map = json.load(f)
    print("✅ Image-feature mapping loaded!")
except Exception as e:
    print("❌ Error loading image mapping:", e)
    image_map = {}

# ---------------------------
# Helpers
# ---------------------------
def run_prediction_from_features(features_dict):
    """Return (label, num) or raise"""
    if model is None or scaler is None:
        raise RuntimeError("Model or scaler not loaded")
    input_data = []
    for feature in features_order:
        if feature not in features_dict:
            raise ValueError(f"Missing feature: {feature}")
        input_data.append(float(features_dict[feature]))
    arr = np.array([input_data])
    arr_scaled = scaler.transform(arr)
    pred_num = int(model.predict(arr_scaled)[0])
    mapping = {1: "Normal", 2: "Suspect", 3: "Pathologic"}
    return mapping.get(pred_num, "Unknown"), pred_num

# ---------------------------
# Routes: health + serve react
# ---------------------------
@app.route("/health")
def health_check():
    return jsonify({"status": "ok", "message": "Backend running"}), 200

# @app.route("/", defaults={"path": ""})
# @app.route("/<path:path>")
# def serve_react(path):
#     build_dir = app.static_folder
#     full_path = os.path.join(build_dir, path)
#     if path != "" and os.path.exists(full_path):
#         return send_from_directory(build_dir, path)
#     else:
#         return send_from_directory(build_dir, "index.html")

# ---------------------------
# Auth: register & login
# ---------------------------
@app.route("/api/auth/register", methods=["POST"])
def register():
    """
    Expected JSON: { "username": "...", "email": "...", "password": "..." }
    Will check if email or username exists and return 400 if so.
    """
    data = request.get_json(force=True)
    username = data.get("username", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not username or not email or not password:
        return jsonify({"error": "username, email and password are required"}), 400

    # check existence
    if users_col.find_one({"email": email}) or users_col.find_one({"username": username}):
        return jsonify({"error": "User with that email or username already exists"}), 400

    pw_hash = bcrypt.generate_password_hash(password).decode("utf-8")
    user_doc = {
        "username": username,
        "email": email,
        "password": pw_hash,
        "created_at": datetime.utcnow()
    }
    res = users_col.insert_one(user_doc)
    return jsonify({"message": "User registered", "user_id": str(res.inserted_id)}), 201

@app.route("/api/auth/login", methods=["POST"])
def login():
    """
    Expected JSON: { "email": "...", "password": "..." } or username
    Returns access token and username
    """
    data = request.get_json(force=True)
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "email and password required"}), 400

    user = users_col.find_one({"email": email})
    if not user:
        return jsonify({"error": "Invalid credentials"}), 401

    if not bcrypt.check_password_hash(user["password"], password):
        return jsonify({"error": "Invalid credentials"}), 401

    access_token = create_access_token(identity=str(user["_id"]))
    return jsonify({"access_token": access_token, "username": user["username"]}), 200

# ---------------------------
# Patient routes (protected)
# ---------------------------
@app.route("/api/patients", methods=["POST"])
@jwt_required()
def create_patient():
    """
    Saves patient info and runs prediction.
    Expects JSON:
    {
      patient: { name, age, gender, hospital, doctor, date },
      features: { ...21 features... }   // either frontend provides features OR we can run predict with features
    }
    """
    doctor_id = get_jwt_identity()
    payload = request.get_json(force=True)
    patient = payload.get("patient")
    features = payload.get("features")

    if not patient:
        return jsonify({"error": "Missing patient info"}), 400

    # run prediction if features provided else reject
    if not features:
        return jsonify({"error": "Missing CTG features for prediction"}), 400

    try:
        label, pred_num = run_prediction_from_features(features)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

    patient_doc = {
        "doctor_id": doctor_id,
        "patient_name": patient.get("name"),
        "age": patient.get("age"),
        "gender": patient.get("gender"),
        "hospital": patient.get("hospital"),
        "doctor_name": patient.get("doctor"),
        "report_date": patient.get("date"),
        "features": features,
        "prediction_label": label,
        "prediction_num": pred_num,
        "created_at": datetime.utcnow()
    }

    res = patients_col.insert_one(patient_doc)
    return jsonify({
        "message": "Patient saved and predicted",
        "patient_id": str(res.inserted_id),
        "prediction_label": label
    }), 201

@app.route("/api/patients", methods=["GET"])
@jwt_required()
def list_patients():
    """
    Returns patients for logged-in doctor
    Query params optional: ?limit=20
    """
    doctor_id = get_jwt_identity()
    limit = int(request.args.get("limit", 50))
    docs = patients_col.find({"doctor_id": doctor_id}).sort("created_at", -1).limit(limit)
    out = []
    for d in docs:
        out.append({
            "id": str(d.get("_id")),
            "patient_name": d.get("patient_name"),
            "report_date": d.get("report_date"),
            "prediction_label": d.get("prediction_label"),
            "prediction_num": d.get("prediction_num"),
            "created_at": d.get("created_at").isoformat()
        })
    return jsonify({"patients": out}), 200

# ---------------------------
# Old predict route kept for compatibility (optional)
# ---------------------------
@app.route("/predict", methods=["POST"])
def predict_only():
    # Keep for compatibility with existing front-end direct /predict route
    try:
        data = request.get_json(force=True)
        label, pred_num = run_prediction_from_features(data)
        return jsonify({"status_label": label, "prediction": pred_num}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# ---------------------------
# Image-based prediction route
# ---------------------------
@app.route("/api/predict-image", methods=["POST"])
def predict_image():
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No image uploaded"}), 400

        file = request.files['image']
        filename = os.path.basename(file.filename)
        # Check if image exists in mapping
        if filename not in image_map:
            return jsonify({
                "error": "Image not recognized. Please upload a proper report image."
            }), 400

        # Get stored features
        features_list = image_map[filename]["features"]

        # Convert to dict format (VERY IMPORTANT)
        features_dict = {
            features_order[i]: features_list[i]
            for i in range(len(features_order))
        }

        # Use existing function
        label, pred_num = run_prediction_from_features(features_dict)

        # Confidence
        arr = np.array([features_list])
        arr_scaled = scaler.transform(arr)
        confidence = float(max(model.predict_proba(arr_scaled)[0]))

        # 🔥 ADD THIS BLOCK (TOP FEATURES LOGIC)
        feature_values = dict(zip(features_order, features_list))

        # Get top 4 contributing features (highest values)
        top_features = sorted(
            feature_values.items(),
            key=lambda x: x[1],
            reverse=True
            )[:4]

        # Convert to clean format (optional but better for frontend)
        top_features_formatted = [
            {"name": k, "value": round(v, 2)}
            for k, v in top_features
            ]

        return jsonify({
            "prediction_label": label,
            "prediction_num": pred_num,
            "confidence": round(confidence * 100, 2),
            "top_features": top_features_formatted   # 🔥 NEW FIELD
            }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image as RLImage
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.pagesizes import A4
from datetime import datetime
import base64
from io import BytesIO

@app.route("/api/download-report", methods=["POST"])
def download_report():
    try:
        data = request.json

        prediction = data.get("prediction")
        confidence = data.get("confidence")
        features = data.get("top_features", [])
        image_base64 = data.get("image")  # ✅ NEW

        file_path = "report.pdf"

        doc = SimpleDocTemplate(file_path, pagesize=A4)
        styles = getSampleStyleSheet()
        elements = []

        # -------------------
        # TITLE
        # -------------------
        elements.append(Paragraph("CTG Medical Report", styles["Title"]))
        elements.append(Spacer(1, 12))

        # Date
        elements.append(
            Paragraph(
                f"<b>Date:</b> {datetime.now().strftime('%d-%m-%Y %H:%M')}",
                styles["Normal"]
            )
        )
        elements.append(Spacer(1, 12))

        # -------------------
        # PREDICTION
        # -------------------
        elements.append(Paragraph(f"<b>Prediction:</b> {prediction}", styles["Normal"]))
        elements.append(Paragraph(f"<b>Confidence:</b> {confidence}%", styles["Normal"]))

        # Risk Level
        if prediction == "Normal":
            risk = "Low Risk"
        elif prediction == "Suspect":
            risk = "Medium Risk"
        else:
            risk = "High Risk"

        elements.append(Paragraph(f"<b>Risk Level:</b> {risk}", styles["Normal"]))
        elements.append(Spacer(1, 12))

        # -------------------
        # FEATURES
        # -------------------
        name_map = {
            "baseline_value": "Fetal Heart Rate",
            "histogram_mean": "Histogram Mean",
            "histogram_max": "Histogram Max",
            "histogram_median": "Histogram Median",
            "abnormal_short_term_variability": "Short-term Variability",
            "prolongued_decelerations": "Prolonged Decelerations",
        }

        elements.append(Paragraph("<b>Key Parameters:</b>", styles["Heading3"]))

        for f in features:
            display_name = name_map.get(f['name'], f['name'])
            elements.append(
                Paragraph(f"{display_name}: {f['value']}", styles["Normal"])
            )

        elements.append(Spacer(1, 15))

        # -------------------
        # MEDICAL ADVICE
        # -------------------
        if prediction == "Normal":
            advice = "Fetal condition is normal. Continue routine monitoring."
        elif prediction == "Suspect":
            advice = "Irregular patterns detected. Recommend continuous monitoring and further clinical evaluation."
        else:
            advice = "⚠ Severe abnormalities detected. Immediate medical intervention required."

        elements.append(Paragraph("<b>Medical Advice:</b>", styles["Heading3"]))
        elements.append(Paragraph(advice, styles["Normal"]))
        elements.append(Spacer(1, 20))

        # -------------------
        # IMAGE (FIXED)
        # -------------------
        if image_base64:
            image_data = base64.b64decode(image_base64.split(",")[1])
            image_buffer = BytesIO(image_data)

            elements.append(Paragraph("<b>CTG Image:</b>", styles["Heading3"]))
            elements.append(Spacer(1, 10))

            elements.append(RLImage(image_buffer, width=450, height=250))

        # Build PDF
        doc.build(elements)

        return send_from_directory(".", "report.pdf", as_attachment=True)

    except Exception as e:
        return jsonify({"error": str(e)}), 500



# ---------------------------
# Run server
# ---------------------------
if __name__ == "__main__":
    print("🚀 Starting Flask server on http://127.0.0.1:5000")
    app.run()
