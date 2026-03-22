import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

let db;

export const connectDB = async () => {
  if (db) return db;

  try {
    db = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log(" Connected to MySQL Database!");
    return db;
  } catch (error) {
    console.error(" MySQL Connection Error:", error);
    process.exit(1);
  }
};

export default connectDB;
