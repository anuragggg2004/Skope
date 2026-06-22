// =============================================
// SKOPE Admin JWT Authentication Middleware
// =============================================
// Verifies admin session tokens on all /api/admin/* routes
// Role levels:
//   founder    — Level 1: Full access
//   analytics  — Level 2: Read-only user data & reports
//   support    — Level 3: View & flag conversations
//   content    — Level 4: College CRUD only
// =============================================

import jwt from 'jsonwebtoken'
import AuditLog from './models/AuditLog.js'

const getAdminSecret = () => process.env.ADMIN_JWT_SECRET || 'skope-admin-secret-change-in-prod'

// Role hierarchy (higher = more access)
const ROLE_LEVELS = {
  founder: 4,
  analytics: 3,
  support: 2,
  content: 1
}

/**
 * Authenticate admin JWT. Attaches req.admin = { email, role, displayName }
 */
export function authenticateAdmin(req, res, next) {
  const authHeader = req.headers['authorization']
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Admin authentication required' })
  }
  const token = authHeader.slice(7)
  try {
    const decoded = jwt.verify(token, getAdminSecret())
    req.admin = decoded
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Admin session expired. Please log in again.' })
    }
    return res.status(401).json({ error: 'Invalid admin token' })
  }
}

/**
 * Require a minimum role level.
 * Usage: requireRole('analytics') — allows analytics, founder
 * Usage: requireRole('founder') — allows only founder
 */
export function requireRole(minRole) {
  return (req, res, next) => {
    const adminRole = req.admin?.role
    if (!adminRole || ROLE_LEVELS[adminRole] === undefined) {
      return res.status(403).json({ error: 'Unauthorized: insufficient role' })
    }
    if (ROLE_LEVELS[adminRole] < ROLE_LEVELS[minRole]) {
      return res.status(403).json({
        error: `Unauthorized: requires ${minRole} access or higher`
      })
    }
    next()
  }
}

/**
 * Sign a new admin JWT token (1 hour expiry)
 */
export function signAdminToken(payload) {
  return jwt.sign(payload, getAdminSecret(), { expiresIn: '1h' })
}

/**
 * Log an audit event to AuditLog collection.
 * Call this after every destructive or modifying admin action.
 */
export async function logAudit({ req, action, resource, resourceId = null, before = null, after = null, details = {} }) {
  try {
    const ipAddress =
      (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
      req.socket?.remoteAddress ||
      'unknown'
    await AuditLog.create({
      adminEmail: req.admin?.email || 'unknown',
      adminRole: req.admin?.role || 'unknown',
      action,
      resource,
      resourceId: resourceId ? String(resourceId) : null,
      before,
      after,
      details,
      ipAddress
    })
  } catch (err) {
    // Never let audit logging crash a real request
    console.error('[AuditLog] Failed to write log entry:', err.message)
  }
}
