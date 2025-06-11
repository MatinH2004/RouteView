import express from 'express';
import { exec } from 'child_process';
const app = express();
const PORT = 3000;

app.use(express.static('viewer'));

app.get('/api/export-route', (req, res) => {
  const routeId = req.query.routeId;
  if (!routeId) return res.status(400).send('Missing routeId');

  exec(`node scripts/exportRouteData.js ${routeId}`, (err, stdout, stderr) => {
    if (err) {
      console.error(stderr);
      return res.status(500).send('Failed to generate route data')
    }

    console.log(stdout);
    res.send('Route data generated');
  });
});

app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));