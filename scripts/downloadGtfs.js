import fs from 'fs';
import https from 'https';
import unzipper from 'unzipper';

// LATEST GTFS DATA DOWNLOAD LINK:
// https://gtfs-static.translink.ca/gtfs/google_transit.zip?_gl=1*t9eyux*_gcl_au*MTg3Mjg5MTY2OS4xNzQxNjY0MDE3*_ga*ODM2MTY4MDQ1LjE3NDE2NjQwMTg.*_ga_2559ZWBT54*czE3NDgzNzU4NzkkbzckZzEkdDE3NDgzNzU4OTQkajQ1JGwwJGgwJGRJY2ZmZFZsVjBsc3d0b3lfaV9uek03bzlsd1ZYbWhuY3dR

const GTFS_ZIP_URL = 'https://gtfs.translink.ca/static/latest.zip';
const DEST_DIR = './data';
const TEMP_ZIP_PATH = './data/latest_gtfs.zip';

function downloadGTFS(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', reject);
  });
}

function extractZip(zipPath, targetDir) {
  return fs.createReadStream(zipPath)
    .pipe(unzipper.Extract({ path: targetDir }))
    .promise();
}

async function updateGTFS() {
  console.log('⬇️ Downloading latest GTFS data from TransLink...');
  await downloadGTFS(GTFS_ZIP_URL, TEMP_ZIP_PATH);
  console.log('✅ Download complete. Extracting...');

  if (!fs.existsSync(DEST_DIR)) {
    fs.mkdirSync(DEST_DIR);
  }

  await extractZip(TEMP_ZIP_PATH, DEST_DIR);
  fs.unlinkSync(TEMP_ZIP_PATH);

  console.log('📦 GTFS data extracted to /data');
}

updateGTFS().catch((err) => {
  console.error('❌ Failed to update GTFS data:', err);
});
