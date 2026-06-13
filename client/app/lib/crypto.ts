import bcrypt from "bcryptjs";
import crypto from "crypto";

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, stored: string): boolean {
  if (!stored) {
    return false;
  }

  // Try to verify using bcrypt first
  try {
    if (bcrypt.compareSync(password, stored)) {
      return true;
    }
  } catch (e) {
    // Not a valid bcrypt hash or comparison failed
  }

  // Fallback for legacy format: "salt:hash"
  if (stored.includes(":")) {
    try {
      const [salt, hash] = stored.split(":");
      if (!salt || !hash) return false;
      const check = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
      return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(check, "hex"));
    } catch (e) {
      return false;
    }
  }

  return false;
}

