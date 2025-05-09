import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { pool } from "./server/db";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function updateUserPassword() {
  const hashedPassword = await hashPassword("admin123");
  console.log("Hashed password:", hashedPassword);
  
  try {
    await pool.query('UPDATE users SET password = $1 WHERE username = $2', [hashedPassword, 'admin']);
    console.log("Password updated successfully for user 'admin'");
  } catch (error) {
    console.error("Error updating password:", error);
  } finally {
    await pool.end();
  }
}

updateUserPassword().catch(console.error);