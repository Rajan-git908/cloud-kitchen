// dbms.js - improved DB connection using environment variables
const mysql = require('mysql2');

const {
  DB_HOST = 'localhost',
  DB_USER = 'root',
  DB_PASSWORD = 'R@jan12#',
  DB_NAME = 'food_apps',
  DB_PORT = 3306
} = process.env;

// Helper: ensure database exists, then connect using it
function createDbConnection(callback) {
  // First connect without database to ensure it exists
  const tmp = mysql.createConnection({ host: DB_HOST, user: DB_USER, password: DB_PASSWORD, port: DB_PORT });
  tmp.connect((err) => {
    if (err) {
      console.error('Error connecting to MySQL server:', err);
      return callback(err);
    }

    tmp.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`, (err2) => {
      if (err2) {
        console.error('Error creating database:', err2);
        tmp.end();
        return callback(err2);
      }
      tmp.end();

      // Now connect to the specific database
      const conn = mysql.createConnection({ host: DB_HOST, user: DB_USER, password: DB_PASSWORD, database: DB_NAME, port: DB_PORT });
      conn.connect((err3) => {
        if (err3) {
          console.error('Error connecting to database:', err3);
          return callback(err3);
        }
        console.log(`Connected to database '${DB_NAME}' on ${DB_HOST}:${DB_PORT}`);
        callback(null, conn);
      });
    });
  });
}

// Export a connection instance. Callers may use `db.query(...)` as before.
// Because creating DB is async, we export a proxy object that buffers queries until ready.
const pending = [];
let readyDb = null;

const dbProxy = {
  query(...args) {
    if (readyDb) return readyDb.query(...args);
    pending.push({ fn: 'query', args });
  },
  execute(...args) {
    if (readyDb) return readyDb.execute(...args);
    pending.push({ fn: 'execute', args });
  },
  end(...args) {
    if (readyDb) return readyDb.end(...args);
    pending.push({ fn: 'end', args });
  }
};

createDbConnection((err, conn) => {
  if (err) {
    console.error('Failed to initialize DB connection.', err);
    return;
  }
  readyDb = conn;
  // flush pending calls
  pending.forEach(call => {
    try {
      readyDb[call.fn](...call.args);
    } catch (e) {
      console.error('Error executing pending DB call', e);
    }
  });
});

module.exports = dbProxy;