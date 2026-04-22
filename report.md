# Real-Time Bus Tracking System
### Project Report — Mini Project (2nd Year)

---

## Table of Contents

1. Project Overview
2. Objectives
3. Tech Stack
4. System Architecture
5. Project Folder Structure
6. Module-wise Description
7. Firebase Integration
8. Data Flow
9. Role-Based Access
10. Key Features Implemented
11. Challenges Faced & Solutions
12. Limitations
13. Future Scope
14. How to Run the Project
15. Conclusion

---

## 1. Project Overview

The **Real-Time Bus Tracking System** is a web-based application developed as a mini project. It allows a bus driver to share their live GPS location, which is then displayed on an interactive map for students, parents, and staff in real time.

The system is built entirely without a traditional backend server. Firebase handles both authentication and live data storage, making the architecture simple, fast to build, and easy to demonstrate.

The application is designed to be practical, demo-ready, and beginner-friendly — focused on core functionality rather than enterprise-level complexity.

---

## 2. Objectives

- Allow a driver to share their live GPS location from any device with a browser.
- Allow students, parents, and staff to view the bus location on a live map.
- Display available bus routes as cards on the home page.
- Show route details including all stops in order when a route card is clicked.
- Update the bus marker on the map in real time as the driver moves.
- Keep the user logged in after a page refresh.
- Implement a simple role-based flow: Driver view and User view.

---

## 3. Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend Framework | React 19 (Vite) | UI and component rendering |
| Map Library | Leaflet 1.9 | Interactive map display |
| Authentication | Firebase Auth | Email/password login |
| Live Database | Firebase Realtime Database | Live location storage and sync |
| Styling | Plain CSS | UI styling |
| Build Tool | Vite 8 | Development server and bundler |
| Runtime | Node.js (ESM) | Package management |

No traditional backend server (Node/Express) is used. Firebase replaces the need for one entirely.

---

## 4. System Architecture

```
┌─────────────────────────────────────────────────────┐
│                    React Frontend                    │
│                                                      │
│  ┌──────────┐   ┌──────────┐   ┌─────────────────┐  │
│  │  Login   │   │   Home   │   │ DriverDashboard │  │
│  │  (Auth)  │   │  (Cards) │   │  (GPS + Write)  │  │
│  └──────────┘   └────┬─────┘   └────────┬────────┘  │
│                      │                  │            │
│               ┌──────▼──────┐           │            │
│               │ RouteDetail │           │            │
│               │  + MapView  │           │            │
│               └──────┬──────┘           │            │
└──────────────────────┼──────────────────┼────────────┘
                       │  onValue()       │  set()
                       ▼                  ▼
              ┌────────────────────────────────┐
              │     Firebase Realtime DB        │
              │   live_locations / {route-id}   │
              │   { lat, lng, timestamp }        │
              └────────────────────────────────┘
                       ▲
              ┌────────┴───────┐
              │  Firebase Auth  │
              │  (Session mgmt) │
              └────────────────┘
```

The driver writes to Firebase. The user's map reads from Firebase. Both happen independently in real time — no server in between.

---

## 5. Project Folder Structure

```
bus-tracker/
│
├── public/
│   ├── favicon.svg
│   └── icons.svg
│
├── src/
│   ├── App.jsx                    ← Root component, auth state, routing
│   ├── main.jsx                   ← React entry point
│   ├── firebase.js                ← Firebase config and exports
│   │
│   ├── components/
│   │   ├── Login.jsx              ← Login form with role selector
│   │   ├── NavBar.jsx             ← Top navigation bar with logout
│   │   ├── Home.jsx               ← Route cards grid page
│   │   ├── RouteCard.jsx          ← Single route card component
│   │   ├── RouteDetail.jsx        ← Route info + live map page
│   │   ├── MapView.jsx            ← Leaflet map with live bus marker
│   │   └── DriverDashboard.jsx    ← Driver GPS sharing dashboard
│   │
│   ├── data/
│   │   └── routes.js              ← Static route and landmark data
│   │
│   └── styles/
│       ├── main.css               ← All application styles
│       └── login.css              ← (reserved for login-specific styles)
│
├── index.html                     ← HTML entry point
├── vite.config.js                 ← Vite configuration
├── package.json                   ← Dependencies and scripts
└── .gitignore
```

---

## 6. Module-wise Description

### 6.1 `firebase.js`
Initializes the Firebase app with the project configuration. Exports two instances:
- `auth` — Firebase Authentication instance used for login and logout.
- `db` — Firebase Realtime Database instance used for reading and writing live location data.

The `databaseURL` field is required for Realtime Database to connect correctly.

---

### 6.2 `App.jsx`
The root component of the application. It manages two things:

**Authentication state** — Uses Firebase's `onAuthStateChanged` listener inside a `useEffect`. This listener fires automatically when the page loads and checks if a Firebase session already exists. If it does, the user is restored without needing to log in again. This solves the login persistence problem.

**Role routing** — After login, the selected role (`driver` or `user`) is saved to `localStorage`. On refresh, the role is read back from `localStorage` and the correct dashboard is shown.

```
authChecked = false  →  Show "Loading..."
authChecked = true, user = null  →  Show Login
authChecked = true, user.role = "driver"  →  Show DriverDashboard
authChecked = true, user.role = "user"  →  Show Home
```

---

### 6.3 `Login.jsx`
A form component with:
- Email and password fields with show/hide password toggle.
- A role selector with two buttons: Student/Parent and Driver.
- Firebase `signInWithEmailAndPassword` for authentication.
- Error handling with a user-friendly message.

The selected role is passed up to `App.jsx` via the `onLogin(role)` callback.

---

### 6.4 `NavBar.jsx`
A fixed top navigation bar showing the app name and a Logout button. On logout, it calls Firebase `signOut()` and clears the role from `localStorage`.

---

### 6.5 `Home.jsx`
The landing page for student/parent/staff users. It renders a grid of `RouteCard` components from the static `routes.js` data. When a card is clicked, it switches to the `RouteDetail` view by setting `selectedRoute` in state.

---

### 6.6 `RouteCard.jsx`
A presentational card component that displays:
- Route name and bus icon.
- Source location.
- Number of stops.
- A preview of the first 3 landmark names as chips.
- A "Track Live →" button.

Clicking anywhere on the card triggers the `onClick` callback.

---

### 6.7 `RouteDetail.jsx`
Shown when a user clicks a route card. It does two things:

**Displays route information** — Route name, source, and an ordered list of all landmarks/stops.

**Listens for live location** — Uses Firebase `onValue()` to subscribe to `live_locations/{routeId}` in the Realtime Database. Every time the driver writes a new location, this listener fires and updates `busLocation` state, which is passed to `MapView`. The listener is cleaned up when the component unmounts.

It also shows a live status badge:
- 🟢 Bus is Live — when `busLocation` has data.
- 🔴 Bus not sharing location — when no data exists yet.

---

### 6.8 `MapView.jsx`
An interactive map component built with Leaflet. It receives two props:
- `landmarks` — array of stop coordinates to place numbered markers and draw the route line.
- `busLocation` — live coordinates from Firebase to move the bus marker.

**Initialization (runs once):**
- Creates a Leaflet map centered on the first landmark.
- Adds OpenStreetMap tiles (free, no API key required).
- Places a numbered marker at each landmark with a popup.
- Draws a dashed polyline connecting all stops.

**Live update (runs on every `busLocation` change):**
- If the bus marker does not exist yet, it creates one with a 🚌 emoji icon.
- If it already exists, it moves it to the new coordinates using `setLatLng()`.
- Pans the map to follow the bus.

A `useRef` is used for the map instance and bus marker to avoid re-initialization on re-renders.

---

### 6.9 `DriverDashboard.jsx`
The driver's control panel. It allows the driver to:
1. Select a route from a dropdown (disabled while sharing is active).
2. Click "Start Sharing Location" to begin GPS tracking.
3. Click "Stop Sharing Location" to end the session.

**GPS logic:**
- Uses the browser's `navigator.geolocation.getCurrentPosition()` API.
- On start, it sends the location immediately and then every 5 seconds using `setInterval`.
- Each update writes `{ lat, lng, timestamp, routeId }` to `live_locations/{routeId}` in Firebase.

**Stale closure fix:**
A `useRef` (`selectedRouteRef`) is used to hold the current route inside the interval callback. If `selectedRoute` state was used directly, the interval would capture a stale (old) value due to JavaScript's closure behavior. The ref always holds the latest value.

---

### 6.10 `routes.js`
Static data file containing 3 demo routes. Each route has:
- `id` — unique identifier used as the Firebase database key.
- `name` — display name.
- `source` — starting point.
- `landmarks` — ordered array of stops, each with a name, latitude, and longitude.

Route 1 (North Campus) uses road-snapped coordinates verified against the OSRM routing API to ensure stop markers appear on actual roads.

---

## 7. Firebase Integration

### Firebase Authentication
- Provider: Email/Password
- Used for: Login and logout
- Session persistence: Firebase Auth automatically persists the session in the browser. `onAuthStateChanged` in `App.jsx` reads this session on every page load.

### Firebase Realtime Database
- Used for: Storing and syncing live bus location
- Database path: `live_locations/{routeId}`
- Data written by driver:
```json
{
  "lat": 22.312131,
  "lng": 73.172300,
  "timestamp": 1745123456789,
  "routeId": "route-1"
}
```
- Data read by user: `onValue()` listener in `RouteDetail.jsx` subscribes to this path and fires on every change.

### Why Realtime Database over Firestore?
Realtime Database is simpler to set up for a single-value live location use case. It has a flat JSON structure, lower latency for frequent small writes, and requires fewer lines of code.

---

## 8. Data Flow

### Driver sharing location:
```
Driver clicks "Start Sharing"
        ↓
navigator.geolocation.getCurrentPosition()
        ↓
Gets { latitude, longitude }
        ↓
firebase/database set()
        ↓
live_locations/route-1 = { lat, lng, timestamp }
```

### User viewing live location:
```
User opens RouteDetail
        ↓
useEffect → onValue(live_locations/route-1)
        ↓
Firebase fires callback with new data
        ↓
setBusLocation({ lat, lng })
        ↓
MapView receives new busLocation prop
        ↓
busMarkerRef.setLatLng(new position)
        ↓
Map pans to follow the bus
```

---

## 9. Role-Based Access

The application implements a simple two-role system:

| Role | Access | Dashboard |
|---|---|---|
| Driver | Login with driver role selected | DriverDashboard — GPS sharing controls |
| Student / Parent / Staff | Login with user role selected | Home — route cards and live map |

Role is selected on the login screen and stored in `localStorage`. There is no server-side role enforcement — this is intentional for a mini project demo. In a production system, roles would be stored in Firestore and verified server-side.

---

## 10. Key Features Implemented

| Feature | Status | Implementation |
|---|---|---|
| Email/Password Login | ✅ Done | Firebase Auth |
| Login Persistence (refresh) | ✅ Done | `onAuthStateChanged` + `localStorage` |
| Role-based routing | ✅ Done | `localStorage` role + conditional render |
| Route cards on home page | ✅ Done | Static data + `RouteCard` component |
| Route detail with stop list | ✅ Done | `RouteDetail` component |
| Interactive map | ✅ Done | Leaflet + OpenStreetMap tiles |
| Stop markers on map | ✅ Done | Leaflet markers with popups |
| Route polyline on map | ✅ Done | Leaflet dashed polyline |
| Driver GPS sharing | ✅ Done | `navigator.geolocation` + Firebase write |
| Live bus marker on map | ✅ Done | Firebase `onValue` + `setLatLng` |
| Live status badge | ✅ Done | Conditional render in `RouteDetail` |
| Last updated timestamp | ✅ Done | `Date` from Firebase timestamp |
| Logout | ✅ Done | Firebase `signOut` + `localStorage` clear |

---

## 11. Challenges Faced & Solutions

### Challenge 1: Login lost on page refresh
**Problem:** React `useState` resets to `null` on every page load. The app was showing the login page even when the user was already authenticated.

**Solution:** Added `onAuthStateChanged` listener in `App.jsx`. Firebase Auth persists the session token in the browser automatically. The listener reads it back on load and restores the user state before rendering anything. A loading screen is shown while this check happens to prevent a flash of the login page.

---

### Challenge 2: Bus location not appearing on map
**Problem:** The Firebase Realtime Database was not receiving any data. The driver dashboard showed success messages but nothing appeared in the database.

**Root cause:** The `databaseURL` field was missing from `firebaseConfig` in `firebase.js`. Without it, `getDatabase()` does not know which database to connect to, and all writes silently fail.

**Solution:** Added the correct `databaseURL` in the format `https://{project-id}-default-rtdb.firebaseio.com`.

---

### Challenge 3: Stale route ID in driver interval
**Problem:** If the driver changed the selected route while the interval was running, the location was still being written to the old route's Firebase path.

**Root cause:** JavaScript closures. The `sendLocation` function captured `selectedRoute` from state at the time the interval was created. State updates do not affect already-captured closure values.

**Solution:** Used a `useRef` (`selectedRouteRef`) to hold the current route. Refs are mutable objects that always reflect the latest value, even inside closures. The ref is updated every time the dropdown changes.

---

### Challenge 4: Leaflet map re-initializing on re-render
**Problem:** Every time `busLocation` state changed, the entire map was being destroyed and recreated, causing a flicker.

**Solution:** Used `useRef` for the map instance (`mapInstance`) and bus marker (`busMarkerRef`). The map is initialized only once (guarded by `if (mapInstance.current) return`). Subsequent location updates only call `setLatLng()` on the existing marker — no re-initialization.

---

## 12. Limitations

- **No server-side role enforcement** — The role is stored in `localStorage` and can be manually changed by the user. This is acceptable for a demo but not for production.
- **Single driver per route** — The system assumes one active driver per route at a time. Multiple drivers on the same route would overwrite each other's location.
- **No offline support** — If the internet connection drops, location updates stop. There is no queuing or retry mechanism.
- **Static route data** — Routes are hardcoded in `routes.js`. There is no admin interface to add or edit routes.
- **GPS accuracy depends on device** — On a laptop or desktop, `navigator.geolocation` may return an inaccurate position based on IP or Wi-Fi triangulation rather than GPS.
- **No push notifications** — Users must have the app open to see updates. There are no alerts for bus arrival.

---

## 13. Future Scope

- Store routes in Firestore so they can be managed dynamically.
- Add an admin panel to create, edit, and delete routes.
- Implement server-side role verification using Firebase Custom Claims.
- Add estimated time of arrival (ETA) calculation based on distance to next stop.
- Send push notifications when the bus is near a stop using Firebase Cloud Messaging.
- Add a route history log to show where the bus has been.
- Support multiple active drivers per route with conflict resolution.
- Build a mobile app version using React Native with the same Firebase backend.

---

## 14. How to Run the Project

### Prerequisites
- Node.js installed
- A Firebase project with Authentication (Email/Password) and Realtime Database enabled

### Steps

**1. Install dependencies**
```bash
npm install
```

**2. Configure Firebase**

Open `src/firebase.js` and replace the config values with your own Firebase project credentials from:
Firebase Console → Project Settings → Your Apps → SDK setup

Make sure `databaseURL` is included.

**3. Start the development server**
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

**4. Create a test user**

Go to Firebase Console → Authentication → Users → Add User
Create at least one user with an email and password to log in with.

**5. Set Realtime Database rules (for testing)**

Go to Firebase Console → Realtime Database → Rules and set:
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

---

## 15. Conclusion

The Real-Time Bus Tracking System successfully demonstrates the core concept of live location sharing using modern web technologies. The application achieves its primary goal: a driver can share their GPS location from a browser, and users can see the bus moving on a map in real time — all without a traditional backend server.

Firebase Realtime Database proved to be an ideal choice for this use case due to its low-latency push updates and simple data model. The combination of React for the UI and Leaflet for the map kept the codebase small, readable, and easy to explain.

The project covers practical concepts including real-time data synchronization, browser geolocation API, Firebase Authentication with session persistence, component-based UI design, and state management with React hooks — making it a solid demonstration of full-stack web development skills at the mini project level.

---

*Project: Real-Time Bus Tracking System*
*Technology: React + Firebase + Leaflet*
*Type: Mini Project — 2nd Year*
