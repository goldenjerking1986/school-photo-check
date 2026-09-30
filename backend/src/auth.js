const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'school-photo-check-secret'

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

function verifyToken(token) {
  if (!token) return null
  try {
    const clean = token.replace(/^Bearer\s+/i, '')
    return jwt.verify(clean, JWT_SECRET)
  } catch (err) {
    return null
  }
}

function requireAuth(req, res, next) {
  const token = req.headers.authorization || ''
  const user = verifyToken(token)
  if (!user) {
    return res.status(401).json({ success: false, message: '未授权' })
  }
  req.user = user
  next()
}

function requireRole(role) {
  return (req, res, next) => {
    const user = req.user || {}
    if (!user.role || user.role !== role) {
      return res.status(403).json({ success: false, message: '无权限' })
    }
    next()
  }
}

module.exports = {
  signToken,
  verifyToken,
  requireAuth,
  requireRole
}
