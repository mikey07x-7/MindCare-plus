# MindCare+

MindCare+ is an AI-powered mental health companion designed to assist users with mood tracking, emotional awareness, stress monitoring, and intelligent insights. It leverages machine learning, natural language processing, and a fully integrated full-stack architecture to provide personalized mental wellness support.

## 🚀 Features

* **Emotion & Sentiment Analysis** – Uses an AI model to evaluate user input and provide emotional insights.
* **User Dashboard** – Displays personalized statistics, trends, and wellness insights.
* **Daily Check-ins** – Allows users to record daily moods and journal entries.
* **Backend Predict API** – FastAPI-based inference service for ML predictions.
* **Secure Authentication** – Robust login and signup flows with protected routes.
* **Full-Stack Integration** – Smooth communication between frontend, backend, and ML microservices.

## 🏗️ Project Architecture

```
MindCare+
│
├── frontend/            # React + TypeScript frontend UI
├── backend/             # FastAPI backend services
├── docker-compose.yaml
```

## 🖥️ Frontend (React + TypeScript)

* Built with **React**, **TypeScript**, **TailwindCSS**, and **Shadcn UI**.
* Uses **React Router** and **Axios** for API communication.
* Offers an intuitive dashboard and user-friendly mental health tools.

### Key Pages

* Login & Signup
* Dashboard
* Check-in screen
* Analytics & Insights

## ⚙️ Backend (FastAPI)

* Serves user authentication, dashboard data, and ML inference requests.
* Organized modularly with routers and services.
* Includes logging, middleware, and environment-based configs.

### Start Backend

```
cd backend
uvicorn api.main:app --reload --port 8000
```

## 🤖 Machine Learning Model

* A microservice that runs the emotion detection model.
* Connected via FastAPI Predict API.

### Start Predict API

```
cd backend
python -m uvicorn api.predict_api:app --reload --port 8001
```

## 🛠️ Installation & Setup

### 1. Clone the repository

```
git clone https://github.com/<your-repo>/mindcare-plus.git
cd mindcare-plus
```

### 2. Install Frontend

```
cd frontend
npm install
npm run dev
```

### 3. Install Backend

```
cd ../backend
pip install -r requirements.txt
```

### 4. Environment Variables

Create `.env` files in both frontend and backend as needed.

## 📡 API Endpoints (Examples)

| Endpoint        | Method | Description               |
| --------------- | ------ | ------------------------- |
| `/auth/login`   | POST   | User login                |
| `/auth/signup`  | POST   | Create new account        |
| `/predict`      | POST   | Emotion prediction        |
| `/dashboard/me` | GET    | Fetch user dashboard data |

## 📊 Tech Stack

* **Frontend:** React, TypeScript, TailwindCSS, Shadcn UI
* **Backend:** FastAPI, Python
* **ML:** Scikit-learn / TensorFlow / PyTorch (depending on setup)
* **Database:** PostgreSQL / SQLite (project dependent)

## 🤝 Contributing

Contributions are welcome! Feel free to submit pull requests or report issues.

.
---

**MindCare+ — Empowering mental wellness with intelligent technology.**

