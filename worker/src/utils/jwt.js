import jwt from 'jsonwebtoken'

export async function generateToken(payload, secret) {
  return jwt.sign(payload, secret, { expiresIn: '7d' })
}

export async function verifyToken(token, secret) {
  return jwt.verify(token, secret)
}
