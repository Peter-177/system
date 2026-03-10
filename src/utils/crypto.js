/**
 * SHA-256 password hashing using the browser-native Web Crypto API.
 * Works identically across all browsers and devices — no dependencies.
 */

/**
 * Hash a password string into a hex-encoded SHA-256 digest.
 * @param {string} password - The plaintext password
 * @returns {Promise<string>} 64-character hex string
 */
export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Check if a stored password looks like a SHA-256 hash (64-char hex).
 * Used to detect plaintext passwords that need migration.
 * @param {string} stored - The stored password value
 * @returns {boolean}
 */
export function isHashed(stored) {
  return typeof stored === "string" && /^[a-f0-9]{64}$/.test(stored);
}
