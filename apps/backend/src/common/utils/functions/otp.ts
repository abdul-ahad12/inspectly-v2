import { createHmac } from 'crypto'

// Function to generate OTP
export function generateOTP(length: number = 6): string {
  const digits = '0123456789'
  let otp = ''
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)]
  }
  return otp
}

// Function to generate secret based on OTP
export function generateSecret(otp: string): string {
  const hmac = createHmac('sha256', otp)
  return hmac.digest('base64')
}

// Function to verify OTP against secret
export function verifyOTP(otp: string, secret: string): boolean {
  const generatedSecret = generateSecret(otp)
  return secret === generatedSecret
}
