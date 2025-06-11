/* eslint-disable import/no-anonymous-default-export */

import fs from 'fs';
import { parse } from 'csv-parse/sync';
import haversine from 'haversine-distance';

export function parseCSV(filename) {
  const file = fs.readFileSync(filename);
  return parse(file, {
    columns: true,
    skip_empty_lines: true
  });
}

export function getRouteShapes(shapesPath, shape_id) {
  const shapes = parseCSV(shapesPath)
    .filter((row) => row.shape_id === shape_id)
    .map((row) => ({
      lat: parseFloat(row.shape_pt_lat),
      lon: parseFloat(row.shape_pt_lon),
      seq: parseInt(row.shape_pt_sequence, 10)
    }))
    .sort((a, b) => a.seq - b.seq);

  return shapes;
}

export function detectTurns(shapePoints, angleThreshold = 45) {
  const turns = [];

  for (let i = 1; i < shapePoints.length - 1; i++) {
    const prev = shapePoints[i - 1];
    const curr = shapePoints[i];
    const next = shapePoints[i + 1];

    const angle = getAngleBetweenPoints(prev, curr, next);

    if (Math.abs(angle) > angleThreshold) {
      turns.push({
        lat: curr.lat,
        lon: curr.lon,
        angle: angle.toFixed(1),
        index: i
      });
    }
  }

  return turns;
}

function getAngleBetweenPoints(a, b, c) {
  const angle = (p1, p2) => Math.atan2(p2.lat - p1.lat, p2.lon - p1.lon);
  let angle1 = angle(b, a);
  let angle2 = angle(b, c);
  let deg = (angle2 - angle1) * (180 / Math.PI);
  if (deg > 180) deg -= 360;
  if (deg < -180) deg += 360;
  return deg;
}

export function matchStopsToShape(stopsPath, shapePoints) {
  const stops = parseCSV(stopsPath).map((stop) => ({
    stop_id: stop.stop_id,
    name: stop.stop_name,
    lat: parseFloat(stop.stop_lat),
    lon: parseFloat(stop.stop_lon)
  }));

  const matchedStops = stops.map((stop) => {
    let minDist = Infinity;
    let nearestPoint = { lat: 0, lon: 0, seq: 0, shape_index: -1 };

    shapePoints.forEach((point, index) => {
      const dist = haversine(
        { lat: stop.lat, lon: stop.lon },
        { lat: point.lat, lon: point.lon }
      );
      if (dist < minDist) {
        minDist = dist;
        nearestPoint = { ...point, shape_index: index };
      }
    });

    return { ...stop, nearestPoint };
  });

  return matchedStops;
}

// Parse trips for a given route
export function getTripsForRoute(tripsPath, route_id) {
  const trips = parseCSV(tripsPath)
    .filter((row) => row.route_id === route_id)
    .map((row) => ({
      trip_id: row.trip_id,
      service_id: row.service_id,
      shape_id: row.shape_id
    }));

  return trips;
}

// Get stop sequence for a given trip
export function getStopTimesForTrip(stopTimesPath, trip_id) {
  const stopTimes = parseCSV(stopTimesPath)
    .filter((row) => row.trip_id === trip_id)
    .map((row) => ({
      stop_id: row.stop_id,
      stop_sequence: parseInt(row.stop_sequence, 10),
      arrival_time: row.arrival_time,
      departure_time: row.departure_time
    }))
    .sort((a, b) => a.stop_sequence - b.stop_sequence);

  return stopTimes;
}

export default {
  parseCSV,
  getRouteShapes,
  detectTurns,
  matchStopsToShape,
  getTripsForRoute,
  getStopTimesForTrip,
};
