import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

/**
 * Hashes a password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Verifies admin credentials
 * @param {string} username - Username
 * @param {string} password - Plain text password
 * @returns {Promise<boolean>} True if credentials are valid
 */
export async function verifyCredentials(username, password) {
  // If password hash is set in env, use it
  if (ADMIN_PASSWORD_HASH) {
    const isValidUser = username === ADMIN_USERNAME;
    const isValidPassword = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
    return isValidUser && isValidPassword;
  }

  // Otherwise, compare with plain text password from env (for initial setup)
  const envPassword = process.env.ADMIN_PASSWORD;
  return username === ADMIN_USERNAME && password === envPassword;
}

/**
 * Generates JWT token for authenticated user
 * @param {string} username - Username
 * @returns {string} JWT token
 */
export function generateToken(username) {
  return jwt.sign({ username }, JWT_SECRET, {
    expiresIn: "24h",
  });
}

/**
 * Verifies JWT token
 * @param {string} token - JWT token
 * @returns {Object|null} Decoded token or null if invalid
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Middleware to verify authentication token from request
 * @param {Request} request - Next.js request object
 * @returns {Object|null} Decoded token or null if not authenticated
 */
export function verifyAuth(request) {
  // Try to get token from Authorization header
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    return verifyToken(token);
  }

  // Try to get token from cookie
  const cookieHeader = request.headers.get("cookie");
  if (cookieHeader) {
    const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split("=");
      acc[key] = value;
      return acc;
    }, {});
    
    if (cookies.admin_token) {
      return verifyToken(cookies.admin_token);
    }
  }

  return null;
}

