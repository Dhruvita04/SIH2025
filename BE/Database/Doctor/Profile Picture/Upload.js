const pg = require('pg');
require('dotenv').config();

const { PGHOST, PGDATABASE, PGUSER, PGPORT } = process.env;
const ENABLE_POSTGRES = process.env.ENABLE_POSTGRES === 'true';
let PGPASSWORD = process.env.PGPASSWORD ? decodeURIComponent(process.env.PGPASSWORD) : undefined;

const pool = new pg.Pool({
    user: PGUSER,
    host: PGHOST,
    database: PGDATABASE,
    password: PGPASSWORD,
    port: PGPORT,
    ssl: {
        rejectUnauthorized: true,
    },
});

if (ENABLE_POSTGRES) {
  (async () => {
      try {
          const client = await pool.connect();
          console.log('Connected to the database');
          client.release();
      } catch (error) {
          console.error('Database connection error', error.stack);
      }
  })();
}

const updateFile = async (doctorId, fileData) => {
    const query = 'UPDATE doctor SET doctor_image = $2 WHERE doctor_user_id_reference  = $1 RETURNING *';
    const values = [doctorId, fileData];
    try {
        const result = await pool.query(query, values);
        if (!result.rows.length) {
            console.log('could not update file data');
            return false;
        }
        console.log('File data updated');
        return true;
    } catch (error) {
        console.error('Error updating file data', error.stack);
        return false;
    }
};

module.exports = { updateFile };