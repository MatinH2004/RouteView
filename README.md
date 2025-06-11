# 🚌 RouteView App – Architecture & Data Flow

## 🛠 Tech Stack

- **Frontend:** HTML/CSS or React Native (Mobile)
- **Backend:** Node.js with Express
- **Mapping:** Leaflet.js
- **Image API:** Google Street View API or Mapillary
- **Transit Data:** GTFS & GTFS-Realtime (from TransLink)

---

## 🔄 Data Flow Overview

1. **Load GTFS Data**  
   (`routes.txt`, `shapes.txt`, `stops.txt`, `stop_times.txt`)

2. **Parse and Visualize Route Shape**  
   Display the selected route’s path on a map

3. **Street View Retrieval**  
   For each **stop** and **turn**, retrieve GPS coordinates and pull a street view image

4. **Step-through UI Preview**  
   Interactive UI to preview each segment with map and street view

5. **Optional: Real-Time Bus Location**  
   Show active vehicles using GTFS-Realtime feed

---

## 🌐 Example API Endpoints

### 1. Load GTFS Static Data
```http
GET /api/gtfs/routes/:route_id
→ returns shape, stops, stop times, and turn coordinates
```

### 2. Street View Image
```http
GET https://maps.googleapis.com/maps/api/streetview?location={lat},{lng}&key=YOUR_API_KEY
```

### 3. Display Route UI
```jsx
<RouteMap route={route} stops={stops} turns={turns} />
<StopPreview image={streetViewImage} stopInfo={stop} />
<TurnPreview image={streetViewImage} turnInfo={turn} />
```

### 4. Real-Time Vehicle Tracking
```http
GET /api/gtfs-realtime/vehicles/:route_id
→ returns current position of active buses
```

### 5. Notes for Stops & Turns
```http
POST /api/stops/:stop_id/notes
→ { text: "Sharp turn here" }

GET /api/stops/:stop_id/notes

POST /api/turns/:turn_id/notes
→ { text: "Watch for cyclists on right" }

GET /api/turns/:turn_id/notes
```

## Folder Structure
```bash
/src
  /components
    RouteMap.jsx
    StopPreview.jsx
    TurnPreview.jsx
    RouteSelector.jsx
  /api
    fetchGTFS.js
    fetchStreetView.js
  /pages
    /routes/[routeId].jsx
  /utils
    gtfsParser.js
    stopNoteManager.js
    turnNoteManager.js
```

## Optional Enhancements
- Download route for offline use
- Printable route cheat sheet
- Voice-guided directions
- Admin panel for driver trainers
- In-app community chat
- Real-time route updates