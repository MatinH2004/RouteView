// scripts/exportRouteData.js
import fs from 'fs';
import { parseCSV, getRouteShapes } from '../src/utils/gtfsParser.js';

const routeId = process.argv[2];

// Parse GTFS files
const trips = parseCSV('./data/trips.txt');
const routes = parseCSV('./data/routes.txt');
const stops = parseCSV('./data/stops.txt');
const stopTimes = parseCSV('./data/stop_times.txt');

// Get route info
const route = routes.find(r => r.route_id === routeId);
if (!route) {
  console.error(`Route ${routeId} not found`);
  process.exit(1);
}

// Get all trips for this route
const routeTrips = trips.filter(t => t.route_id === routeId);

// Group trips by direction and headsign
const tripGroups = {};
routeTrips.forEach(trip => {
  const key = `${trip.direction_id || 0}_${trip.trip_headsign || 'Unknown'}`;
  if (!tripGroups[key]) {
    tripGroups[key] = {
      direction_id: trip.direction_id || 0,
      headsign: trip.trip_headsign || 'Unknown Direction',
      trips: [],
      shape_id: trip.shape_id
    };
  }
  tripGroups[key].trips.push(trip);
});

// Generate data for each trip group
const tripsData = Object.entries(tripGroups).map(([key, group]) => {
  // Get shape for this direction
  const shapePoints = group.shape_id ? getRouteShapes('./data/shapes.txt', group.shape_id) : [];
  
  // Get stops for trips in this group
  const tripIds = group.trips.map(t => t.trip_id);
  const groupStopTimes = stopTimes.filter(st => tripIds.includes(st.trip_id));
  
  // Get unique stops and sort by stop_sequence (using first occurrence)
  const stopMap = new Map();
  groupStopTimes.forEach(st => {
    if (!stopMap.has(st.stop_id)) {
      stopMap.set(st.stop_id, parseInt(st.stop_sequence));
    }
  });
  
  const sortedStopIds = Array.from(stopMap.entries())
    .sort((a, b) => a[1] - b[1])
    .map(([stopId]) => stopId);
  
  const groupStops = stops.filter(stop => sortedStopIds.includes(stop.stop_id))
    .sort((a, b) => sortedStopIds.indexOf(a.stop_id) - sortedStopIds.indexOf(b.stop_id));

  return {
    id: key,
    direction_id: group.direction_id,
    headsign: group.headsign,
    shape: {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: shapePoints.map(p => [p.lon, p.lat])
      },
      properties: {}
    },
    stops: {
      type: 'FeatureCollection',
      features: groupStops.map(stop => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [parseFloat(stop.stop_lon), parseFloat(stop.stop_lat)]
        },
        properties: {
          stop_id: stop.stop_id,
          name: stop.stop_name
        }
      }))
    }
  };
});

const routeInfo = {
  route_id: route.route_id,
  route_short_name: route.route_short_name,
  route_long_name: route.route_long_name
};

// Output JS file
const output = `
const routeInfo = ${JSON.stringify(routeInfo, null, 2)};
const tripsData = ${JSON.stringify(tripsData, null, 2)};
let currentTripIndex = 0;

// Helper functions to get current trip data
function getCurrentTrip() {
  return tripsData[currentTripIndex];
}

function getShapeGeoJson() {
  return getCurrentTrip().shape;
}

function getStopsGeoJson() {
  return getCurrentTrip().stops;
}

// For backwards compatibility
const shapeGeoJson = getShapeGeoJson();
const stopsGeoJson = getStopsGeoJson();
`;

fs.writeFileSync('./viewer/shape.geojson.js', output);
console.log('✅ Exported route data with trips to viewer/shape.geojson.js');
console.log(`📊 Found ${tripsData.length} trip directions for route ${route.route_short_name}`);
tripsData.forEach((trip, index) => {
  console.log(`  ${index}: ${trip.headsign} (${trip.stops.features.length} stops)`);
});