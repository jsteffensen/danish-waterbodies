const fs = require("fs");

const INPUT_FILE = 'waterbodies_dk.geojson';
const OUTPUT_FILE = 'feature-names.json';

console.log(`Reading ${INPUT_FILE}...`);
const raw = fs.readFileSync(INPUT_FILE, "utf8");
const geojson = JSON.parse(raw);

function getCoordinates(geometry) {
  if (!geometry) return [];
  const flatten = (coords) => {
    if (!Array.isArray(coords)) return [];
    if (typeof coords[0] === "number") return [coords];
    return coords.flatMap(flatten);
  };
  return flatten(geometry.coordinates);
}

function getMidpoint(coords) {
  if (coords.length === 0) return null;

  let minLon = Infinity, maxLon = -Infinity;
  let minLat = Infinity, maxLat = -Infinity;

  for (const [lon, lat] of coords) {
    if (lon < minLon) minLon = lon;
    if (lon > maxLon) maxLon = lon;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  }

  const centerLon = (minLon + maxLon) / 2;
  const centerLat = (minLat + maxLat) / 2;

  // Find the actual coordinate closest to the bounding box center
  let closest = null;
  let minDist = Infinity;

  for (const [lon, lat] of coords) {
    const dist = (lon - centerLon) ** 2 + (lat - centerLat) ** 2;
    if (dist < minDist) {
      minDist = dist;
      closest = { lat, lon };
    }
  }

  return closest;
}

const waterbodies = geojson.features
  .filter((f) => f?.properties?.name)
  .map((f) => {
    const coords = getCoordinates(f.geometry);
    const midpoint = getMidpoint(coords);
    return {
      name: f.properties.name,
      midpoint,
    };
  });

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(waterbodies, null, 2), "utf8");

console.log(`Done. Found ${waterbodies.length} named features.`);
console.log(`Saved to ${OUTPUT_FILE}`);