import crypto from 'crypto'

const SECRET = process.env.SESSION_SECRET || 'dev-secret-change-me'

type SessionPayload = {
  userId: string
  exp: number
}

export function createSessionToken(userId: string, ttlMs = 1000 * 60 * 60 * 24 * 7): string {
  const payload: SessionPayload = { userId, exp: Date.now() + ttlMs }
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = crypto.createHmac('sha256', SECRET).update(payloadB64).digest('base64url')
  return `${payloadB64}.${signature}`
}

export function verifySessionToken(token: string): SessionPayload | null {
  const [payloadB64, signature] = token.split('.')
  if (!payloadB64 || !signature) return null

  const expectedSig = crypto.createHmac('sha256', SECRET).update(payloadB64).digest('base64url')
  const sigBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expectedSig)
  if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
    return null
  }

  const payload: SessionPayload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8'))
  if (payload.exp < Date.now()) return null

  return payload
}