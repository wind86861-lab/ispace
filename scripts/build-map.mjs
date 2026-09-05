/**
 * Bir marta ishlaydigan skript: world-atlas TopoJSON'dan O'zbekiston konturini
 * ajratib, SVG path va shahar koordinatalari sifatida
 * `src/content/map/uzbekistan.json` ga yozadi.
 * Runtime'da world-atlas/topojson YUKLANMAYDI.
 *
 *   npm run build:map
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { feature } from "topojson-client";

const require = createRequire(import.meta.url);
const UZBEKISTAN_ID = "860";

/** SVG viewBox kengligi — balandlik proyeksiyadan hisoblanadi. */
const WIDTH = 1000;

const topology = JSON.parse(
  readFileSync(require.resolve("world-atlas/countries-50m.json"), "utf8"),
);

const geometry = topology.objects.countries.geometries.find(
  (g) => String(g.id) === UZBEKISTAN_ID,
);
if (!geometry) throw new Error(`world-atlas ichida id=${UZBEKISTAN_ID} topilmadi`);

const { geometry: geo } = feature(topology, geometry);
const polygons = geo.type === "Polygon" ? [geo.coordinates] : geo.coordinates;

/* ---- bbox ---- */
let minLon = Infinity, maxLon = -Infinity, minLat = Infinity, maxLat = -Infinity;
for (const rings of polygons)
  for (const ring of rings)
    for (const [lon, lat] of ring) {
      if (lon < minLon) minLon = lon;
      if (lon > maxLon) maxLon = lon;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    }

/**
 * Ekvidistant silindrik proyeksiya, markaziy kenglik bo'yicha cho'zilish
 * tuzatilgan — O'zbekiston kabi kichik hudud uchun buzilish sezilmaydi va
 * mamlakat gorizontal cho'zilib ketmaydi.
 */
const midLat = ((minLat + maxLat) / 2) * (Math.PI / 180);
const lonScale = Math.cos(midLat);
const scale = WIDTH / ((maxLon - minLon) * lonScale);
const HEIGHT = Math.round((maxLat - minLat) * scale);

const project = ([lon, lat]) => [
  (lon - minLon) * lonScale * scale,
  (maxLat - lat) * scale,
];
const round = (n) => Math.round(n * 10) / 10;

/* ---- SVG path ---- */
const path = polygons
  .map((rings) =>
    rings
      .map((ring) => `M${ring.map(project).map(([x, y]) => `${round(x)} ${round(y)}`).join("L")}Z`)
      .join(""),
  )
  .join("");

/* ---- filiallar (haqiqiy lon/lat) ---- */
const BRANCH_COORDS = {
  "tashkent-yunusabad": [69.2896, 41.3675],
  "tashkent-chilanzar": [69.2044, 41.2756],
  fergana:              [71.7864, 40.3864],
  samarkand:            [66.9597, 39.6542],
  denau:                [67.8950, 38.2670],
  bukhara:              [64.4210, 39.7680],
};

const cities = Object.fromEntries(
  Object.entries(BRANCH_COORDS).map(([id, coord]) => {
    const [x, y] = project(coord);
    return [id, { x: round(x), y: round(y) }];
  }),
);

const out = {
  _generated: "scripts/build-map.mjs — qo'lda tahrirlamang",
  source: "world-atlas@2 countries-50m.json (Natural Earth), id=860",
  viewBox: `0 0 ${WIDTH} ${HEIGHT}`,
  width: WIDTH,
  height: HEIGHT,
  path,
  cities,
};

writeFileSync("src/content/map/uzbekistan.json", JSON.stringify(out));
console.log(
  `✓ uzbekistan.json — viewBox ${out.viewBox}, path ${path.length}B, ${Object.keys(cities).length} shahar`,
);
for (const [id, p] of Object.entries(cities)) console.log(`  ${id.padEnd(22)} x=${p.x} y=${p.y}`);
