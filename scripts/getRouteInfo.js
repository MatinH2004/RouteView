import { parseCSV } from '../src/utils/gtfsParser.js';

const shapeId = '300645'; // e.g. '110102'

const tripsPath = './data/trips.txt';
const routesPath = './data/routes.txt';

const trips = parseCSV(tripsPath);
const routes = parseCSV(routesPath);

// Find the route_id for the shape_id
const trip = trips.find((t) => t.shape_id === shapeId);
if (!trip) {
  console.error('❌ No trip found for shape_id:', shapeId);
  process.exit(1);
}

const route = routes.find((r) => r.route_id === trip.route_id);
if (!route) {
  console.error('❌ No route found for route_id:', trip.route_id);
  process.exit(1);
}

console.log('-- Route Info:');
console.log({
  route_id: route.route_id,
  route_short_name: route.route_short_name, // like "99"
  route_long_name: route.route_long_name    // like "Commercial–Broadway / UBC"
});
