// script/generateRoutesIndex.js

import fs from 'fs';
import { parseCSV } from '../src/utils/gtfsParser.js';

const routes = parseCSV('./data/routes.txt');

// todo: skip over skytrain/seabus routes when generating
const searchableRoutes = routes.map(r => ({
  id: r.route_id,
  short: r.route_short_name,
  long: r.route_long_name,
}));

fs.writeFileSync('./viewer/routesIndex.js', `const routesIndex = ${JSON.stringify(searchableRoutes, null, 2)};`);
console.log('✅ Created routesIndex.js with route names and numbers');