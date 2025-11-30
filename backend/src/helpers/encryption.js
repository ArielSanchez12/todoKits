import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const SECRET_KEY = process.env.ENCRYPTION_KEY;
if (!SECRET_KEY) {
  throw new Error("ENCRYPTION_KEY no está definida en las variables de entorno");
}
const KEY = Buffer.from(SECRET_KEY.substring(0, 64), "hex");

/**
 * Encripta un texto
 * @param {string} text - Texto a encriptar
 * @returns {string} - Texto encriptado en formato: iv:authTag:encrypted
 */
export const encrypt = (text) => {
  if (!text) return null;
  
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  const authTag = cipher.getAuthTag();
  
  // Formato: iv:authTag:encrypted
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
};

/**
 * Desencripta un texto
 * @param {string} encryptedText - Texto encriptado en formato: iv:authTag:encrypted
 * @returns {string} - Texto original
 */
export const decrypt = (encryptedText) => {
  if (!encryptedText) return null;
  
  try {
    const [ivHex, authTagHex, encrypted] = encryptedText.split(":");
    
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    
    return decrypted;
  } catch (error) {
    console.error("Error al desencriptar:", error);
    return null;
  }
};

/**
 * Encripta un array de strings
 */
export const encryptArray = (array) => {
  if (!Array.isArray(array)) return [];
  return array.map(item => encrypt(item));
};

/**
 * Desencripta un array de strings
 */
export const decryptArray = (array) => {
  if (!Array.isArray(array)) return [];
  return array.map(item => decrypt(item));
};