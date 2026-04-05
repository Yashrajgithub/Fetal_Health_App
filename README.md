# 🧠 Fetal Health Prediction System (CTG Analysis)

A full-stack AI-powered healthcare application that predicts fetal health status using Cardiotocography (CTG) data. The system supports both manual parameter input and image-based prediction, with real-time results and automated report generation.

---

## 🚀 Live Demo

* 🌐 Frontend (Vercel): https://fetalsense.vercel.app
  
---

## 🏗️ Tech Stack

### Frontend

* React.js
* CSS (Custom UI)
* Vercel (Deployment)

### Backend

* Flask (Python)
* Flask-JWT-Extended (Authentication)
* Flask-CORS

### Database

* MongoDB Atlas

### Machine Learning

* Scikit-learn
* NumPy
* Joblib

### Other

* ReportLab (PDF generation)

---

## ✨ Features

### 🔐 Authentication

* User Registration & Login (JWT-based)

### 📊 CTG Prediction

* Input 21 CTG parameters
* Predict fetal health:

  * 🟢 Normal
  * 🟠 Suspect
  * 🔴 Pathologic

### 🖼️ Image-Based Prediction

* Upload CTG report image
* AI extracts features & predicts outcome

### 📄 Report Generation

* Download PDF report with:

  * Prediction result
  * Confidence score
  * Key parameters
  * CTG image

### 🧾 Patient Management

* Save patient records
* View recent predictions

---

## 🧠 How It Works

```text
User Input / Image
        ↓
React Frontend (Vercel)
        ↓
Flask API (Render)
        ↓
ML Model (Scikit-learn)
        ↓
MongoDB Atlas (store data)
        ↓
Prediction Response → UI
```

---

## ⚙️ Installation (Local Setup)

### 1️⃣ Clone Repository

```bash
git clone https://github.com/Yashrajgithub/Fetal_Health_App.git
cd Fetal_Health_App
```

---

### 2️⃣ Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

Create `.env` file:

```env
MONGO_URI=your_mongodb_uri
JWT_SECRET_KEY=your_secret_key
```

Run server:

```bash
python app.py
```

---

### 3️⃣ Frontend Setup

```bash
cd frontend_react
npm install
npm start
```

---

## 🌍 Environment Variables

### Backend (.env)

```env
MONGO_URI=your_mongodb_uri
JWT_SECRET_KEY=your_secret
```

---

### Frontend (Vercel)

```env
REACT_APP_API_URL=https://your-backend-url.onrender.com
```

---

## 📊 Machine Learning Model

* Algorithm: Classification Model (Scikit-learn)
* Input: 21 CTG features
* Output:

  * Normal
  * Suspect
  * Pathologic

---

## 🧪 API Endpoints

| Method | Endpoint             | Description         |
| ------ | -------------------- | ------------------- |
| POST   | /api/auth/register   | Register user       |
| POST   | /api/auth/login      | Login user          |
| POST   | /api/patients        | Save + Predict      |
| GET    | /api/patients        | Get patient history |
| POST   | /predict             | Predict (no auth)   |
| POST   | /api/predict-image   | Image prediction    |
| POST   | /api/download-report | Generate PDF        |

---

## ⚠️ Challenges Faced

* Handling CORS between frontend & backend
* Environment variable configuration
* Model loading in cloud deployment
* Fixing API routing (localhost vs production)
* Managing Render cold-start delays
* Collecting CTG images dataset

---

## 📈 Future Improvements

* Add dashboard with analytics
* Improve model accuracy
* Add real-time monitoring
* Dockerize application
* Role-based access (Doctor/Admin)

---

## ⭐ If you like this project

Give it a ⭐ on GitHub!
