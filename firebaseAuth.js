import jwt from 'jsonwebtoken'

let googlePublicCerts = null
let certsExpiry = 0

// Fetch Google's public certificates dynamically and cache them according to HTTP headers
async function getGooglePublicCerts() {
  const now = Date.now()
  if (googlePublicCerts && now < certsExpiry) {
    return googlePublicCerts
  }

  console.log('[Auth] Fetching fresh Firebase public keys from Google...')
  const res = await fetch('https://www.googleapis.com/robot/v1/metadata/x509/securetoken-system@system.gserviceaccount.com')
  if (!res.ok) {
    throw new Error('Failed to fetch Firebase public keys')
  }

  const cacheControl = res.headers.get('cache-control')
  let maxAge = 3600 // default 1 hour
  if (cacheControl) {
    const match = cacheControl.match(/max-age=(\d+)/)
    if (match) {
      maxAge = parseInt(match[1], 10)
    }
  }

  googlePublicCerts = await res.json()
  certsExpiry = now + (maxAge * 1000)
  return googlePublicCerts
}

// Verify dynamic Firebase ID token
export async function verifyFirebaseToken(token) {
  const decodedHeader = jwt.decode(token, { complete: true })
  if (!decodedHeader || !decodedHeader.header || !decodedHeader.header.kid) {
    throw new Error('Invalid token format')
  }

  const kid = decodedHeader.header.kid
  const certs = await getGooglePublicCerts()
  const cert = certs[kid]
  if (!cert) {
    throw new Error('Unknown signing key ID')
  }

  const projectId = process.env.VITE_FIREBASE_PROJECT_ID || 'skope-54260'
  const options = {
    algorithms: ['RS256'],
    audience: projectId,
    issuer: `https://securetoken.google.com/${projectId}`
  }

  return new Promise((resolve, reject) => {
    jwt.verify(token, cert, options, (err, decoded) => {
      if (err) {
        reject(err)
      } else {
        resolve(decoded)
      }
    })
  })
}

// Express authentication middleware
export async function authenticateFirebaseUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' })
    }

    const token = authHeader.split('Bearer ')[1]
    const decodedToken = await verifyFirebaseToken(token)
    
    // Attach decoded user claims to request
    req.user = {
      uid: decodedToken.sub,
      email: decodedToken.email,
      ...decodedToken
    }
    
    next()
  } catch (error) {
    console.error('[Auth] Token verification failed:', error.message)
    return res.status(401).json({ error: 'Unauthorized: Invalid authentication credentials' })
  }
}
