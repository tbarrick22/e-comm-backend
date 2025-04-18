require("dotenv").config(); // Load .env variables into process.env

const { Pool } = require("pg");

const pool = new Pool({
	user: process.env.DB_USER,
	host: process.env.DB_HOST,
	database: process.env.DB_NAME,
	password: process.env.DB_PASSWORD,
	port: process.env.DB_PORT,
});

pool.on("connect", () => {
	console.log("Connected to the PostgreSQL database");
});

module.exports = pool;
