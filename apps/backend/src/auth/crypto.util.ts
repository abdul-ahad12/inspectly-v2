import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from 'crypto'

const encryptionKey = scryptSync(process.env.ENCRYPTION_SECRET, 'salt', 24) // Ensure to replace 'salt' with a secure salt
const algorithm = 'aes-192-cbc'
const iv = randomBytes(16) // Initialization vector

function encrypt(text: string) {
  const cipher = createCipheriv(algorithm, encryptionKey, iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return `${iv.toString('hex')}:${encrypted}`
}

function decrypt(text: string) {
  const [ivHex, encrypted] = text.split(':')
  const decipher = createDecipheriv(
    algorithm,
    encryptionKey,
    Buffer.from(ivHex, 'hex'),
  )
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

export { encrypt, decrypt }
