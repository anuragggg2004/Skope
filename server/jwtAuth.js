// =============================================
// JWT AUTH MIDDLEWARE — MongoDB-backed auth
// Replaces Firebase authentication entirely.
// Tokens are issued by /api/auth/login and
// /api/auth/signup using our own JWT_SECRET.
// =============================================

import jwt from 'jsonwebtoken'

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL: JWT_SECRET environment variable is not set in production!')
    }
    return 'skope-jwt-secret-change-in-prod'
  }
  return secret
}

// Sign a user token (called after successful login/signup)
export function signUserToken(payload) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' })
}

// Express middleware — verifies Bearer token on protected routes
export async function authenticateUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' })
    }

    const token = authHeader.split('Bearer ')[1]
    const decoded = jwt.verify(token, getJwtSecret())

    // Attach user claims to request — same shape as before so routes don't change
    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      ...decoded
    }

    next()
  } catch (error) {
    console.error('[Auth] Token verification failed:', error.message)
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' })
  }
}
