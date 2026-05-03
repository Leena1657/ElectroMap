# ⚡ ElectroMap

A full-stack web application for discovering and navigating **EV (Electric Vehicle) charging stations** across major Indian cities. ElectroMap provides an interactive map interface, real-time station availability, route planning, and an admin dashboard for efficient management.

---

## 📌 Problem Statement

With the rapid adoption of electric vehicles in India, users face key challenges:

- ❌ Difficulty in locating nearby EV charging stations
- ❌ Lack of real-time availability information
- ❌ Inefficient route planning for long-distance travel
- ❌ Limited centralized platforms for EV infrastructure management

### ✅ Solution

**ElectroMap** solves these problems by providing:

- A centralized platform to discover EV charging stations
- Real-time availability tracking
- Smart route planning to stations
- Admin tools for managing stations and users

---

## 🏗️ System Architecture

ElectroMap follows a **3-tier architecture**:

```
Frontend (Client)
       ↓
Backend (API Server)
       ↓
Database (MongoDB)
```

### 🔹 Architecture Breakdown

- **Frontend (React + Vite)** — Handles UI, displays map via Leaflet, communicates with backend via REST APIs
- **Backend (Node.js + Express)** — Handles business logic, RESTful APIs, and JWT authentication
- **Database (MongoDB)** — Stores users and station data using Mongoose schemas
- **External Services** — TomTom API for geocoding & search, Leaflet for map rendering

---

## 🚀 Features

- 🗺️ Interactive map with EV charging stations
- 🔍 Search & filter by availability and charging speed
- 📍 Auto-detect nearby stations using GPS
- 🛣️ Route planning to any charging station
- 👤 JWT-based authentication system
- 🛡️ Admin dashboard with full CRUD operations
- 📱 Fully responsive UI

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| Vite | Build tool & dev server |
| React Router v7 | Client-side routing |
| React Leaflet + Leaflet | Interactive map |
| Tailwind CSS v4 | Styling |
| Lucide React | Icons |
| TomTom API | Location search & geocoding |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express 5 | REST API server |
| MongoDB + Mongoose | Database & ODM |
| JSON Web Tokens (JWT) | Authentication |
| bcryptjs | Password hashing |
| dotenv | Environment config |

---

## 📁 Project Structure

```
ElectroMap/
├── src/
│   ├── App.jsx                  # Root component & routing
│   ├── context/
│   │   └── AuthContext.jsx      # Global auth state
│   ├── components/
│   │   ├── Layout.jsx           # App shell / navigation
│   │   └── StationCard.jsx      # Reusable station card
│   └── pages/
│       ├── MapPage.jsx          # Interactive map + filters
│       ├── RoutePage.jsx        # Route planning
│       ├── ProfilePage.jsx      # User profile
│       ├── AuthPage.jsx         # Login / Register
│       └── AdminPage.jsx        # Admin dashboard
├── backend/
│   └── src/
│       ├── index.js             # Express server + DB seed
│       └── models/
│           ├── User.js          # User schema
│           └── Station.js       # Station schema
├── public/
├── index.html
├── vite.config.js
└── package.json
```

---

## ⚙️ Getting Started

### Prerequisites

- Node.js v18+
- MongoDB running locally or MongoDB Atlas URI
- TomTom API Key (free at [developer.tomtom.com](https://developer.tomtom.com))

---

### 🔧 Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:

```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/electromap
JWT_SECRET=your_jwt_secret_here
```

Start the backend:

```bash
npm run dev
```

---

### 💻 Frontend Setup

```bash
# From project root
npm install
```

Create a `.env` file in the project root:

```env
VITE_TOMTOM_API_KEY=your_tomtom_api_key_here
```

Start the frontend:

```bash
npm run dev
```

## 🔌 API Overview

### Auth Routes
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT |
| GET | `/api/auth/me` | Get current user info |

### Station Routes
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/stations` | List all stations |
| GET | `/api/stations/:id` | Get a single station |

### Admin Routes
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/stats` | Dashboard stats |
| GET | `/api/admin/users` | List all users |
| DELETE | `/api/admin/users/:id` | Delete a user |
| POST | `/api/admin/stations` | Create a station |
| PUT | `/api/admin/stations/:id` | Update a station |
| DELETE | `/api/admin/stations/:id` | Delete a station |

---

## 🔐 Default Credentials

| Role | Email | Password |
|---|---|---|
| User | `test@example.com` | `password123` |
| Admin | `admin@electromap.com` | `admin123` |

> ⚠️ Change these credentials before deploying to production.

---

## 🌱 Future Improvements

- Real-time charging slot booking
- Payment integration
- AI-based route optimization
- Mobile app version

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to your branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [ISC License](LICENSE).

---

> Built with ❤️ for a greener future 🌱
"# ElectroMap-" 
