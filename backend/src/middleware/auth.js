const jwt = require('jsonwebtoken');
const { User, Role } = require('../../models');

const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id, {
      include: [{
        model: Role,
        as: 'role'
      }]
    });

    if (!user || !user.active) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or user not found.'
      });
    }

    // Check if user needs to change password on first login
    if (user.first_login && req.path !== '/api/auth/change-password' && req.method !== 'PUT') {
      return res.status(403).json({
        success: false,
        message: 'Password change required on first login.',
        requires_password_change: true
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token.'
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please authenticate first.'
      });
    }

    // Admin and Padiri have full access to everything
    if (['ADMIN', 'PADIRI'].includes(req.user.role.name)) {
      req.fullAccess = true;
      return next();
    }

    if (!roles.includes(req.user.role.name)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  };
};

// Enhanced role-based middleware for specific permissions
const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please authenticate first.'
      });
    }

    // Admin and Padiri have full access
    if (['ADMIN', 'PADIRI'].includes(req.user.role.name)) {
      req.fullAccess = true;
      return next();
    }

    if (req.user.role.name !== role) {
      return res.status(403).json({
        success: false,
        message: `Access denied. ${role} role required.`
      });
    }

    next();
  };
};

// Middleware for admin/padiri only
const requireAdminOrPadiri = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Please authenticate first.'
    });
  }

  if (!['ADMIN', 'PADIRI'].includes(req.user.role.name)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin or Padiri role required.'
    });
  }

  req.fullAccess = true;
  next();
};

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id, {
        include: [{
          model: Role,
          as: 'role'
        }]
      });

      if (user && user.active) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
};

module.exports = {
  authenticate,
  authorize,
  requireRole,
  requireAdminOrPadiri,
  optionalAuth
};
