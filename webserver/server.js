const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;
const GEOJSON_FILE = path.join(__dirname, "waterbodies_dk.geojson");

// Serve static frontend files
app.use(express.static(path.join(__dirname, "public")));

// Stream the GeoJSON file — it's large, avoid loading it all into memory
app.get("/api/waterbodies", (req, res) => {
  if (!fs.existsSync(GEOJSON_FILE)) {
    return res.status(404).json({ error: `GeoJSON file not found: ${GEOJSON_FILE}` });
  }
  res.setHeader("Content-Type", "application/json");
  fs.createReadStream(GEOJSON_FILE).pipe(res);
});

app.listen(PORT, () => {
  console.log(`\n🗺  Waterbodies map running at http://localhost:${PORT}\n`);
});