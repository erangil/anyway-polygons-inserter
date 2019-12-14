const fs = require("fs-extra");
const path = require("path");
const pg = require("pg");
const glob = require("glob");

const dataPath = path.resolve(__dirname, "../israel-municipalities-polygons/");
const DATABASE_URL = process.env.DATABASE_URL;
const TABLE_NAME = 'municipalities';

async function asyncWrapper() {
  console.log("connecting to DB: " + DATABASE_URL);
  const client = new pg.Client(DATABASE_URL);
  await client.connect();
  console.log("Succefuly connected to DB");

  /** @type {String[]} */
  const files = await new Promise((res, rej) => {
    glob(path.resolve(dataPath, "**/*.geojson"), (error, matches) => {
      if (error) {
        rej(error);
        return;
      }

      res(matches);
    });
  });

  console.log("Starting to insert polygons into DB");
  for (const file of files) {
    var data = await fs.readJSON(file, { encoding: "utf8" });
    for (var place of data.features) {
      var polygon = place.geometry;

      var { id, osm_id, MUN_HEB, name, MUN_ENG } = place.properties;
      if (isNaN(id)) {
        const curr_time = Date.now();
        place.properties['id'] = curr_time;
        fs.writeFile(file, JSON.stringify(data, null, '\t'), 'utf8');
        id = curr_time;
      }

      const query_res = await client.query(
        `select distinct yishuv_symbol from markers where yishuv_name=$1 `,
        [MUN_HEB]
      );
      const mun_name_heb = (MUN_HEB != null) ? MUN_HEB : name;
      const file_name = path.basename(file);
      let yishuv_symbol;
      if (query_res.rowCount > 0)
        yishuv_symbol = query_res.rows[0].yishuv_symbol;
      const res = await client.query(
        `INSERT INTO ` + TABLE_NAME + `(id, heb_name, eng_name, polygon, symbol, osm_id, file_name) ` +
        ` VALUES ($1, $2, $3, ST_GeomFromGeoJSON($4::text), $5, $6, $7)`,
        [id, mun_name_heb, MUN_ENG, polygon, yishuv_symbol, osm_id, file_name]
      );
    }
  }

  await client.end();
  console.log("Polygons were inserted succesfuly into " + TABLE_NAME + "table");
}

asyncWrapper().then(
  () => { },
  e => {
    console.error("Ooppss, something went wrong", e);
    process.abort();
  }
);
