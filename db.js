import mysql from 'mysql2/promise';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { host, user, password, database } = require('./credentials.json');

const pool = mysql.createPool({
    host: host,
    user: user,
    password: password,
    database: database,
    waitForConnections: true,
    connectionLimit: 10
});

export default pool;