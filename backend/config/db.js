const mysql = require("mysql2");

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Sanity check + confirm which DB we're actually connected to
db.getConnection((err, connection) => {
  if (err) console.error("MySQL Pool Connection Failed:", err);
  else {
    connection.query(
      "SELECT DATABASE() AS db, @@hostname AS host",
      (err, rows) => {
        if (!err) console.log("Connected to DB:", rows[0]);
        connection.release();
      },
    );
  }
});

module.exports = db;
