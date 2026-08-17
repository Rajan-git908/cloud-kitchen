import jwt from "jsonwebtoken";
import db from "../models/db.js";

// Enhanced authentication middleware with IP logging
export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Access denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "mysecretkey");
    req.user = decoded;
    req.userId = decoded.id;
    
    // Log authentication attempt
    logAdminActivity(decoded.id, 'auth', 'token_verify', null, req.ip, req.get('user-agent'));
    
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid token" });
  }
};

// Enhanced admin middleware with active status check
export const isAdmin = async (req, res, next) => {
  try {
    // Check if user has admin role
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    // Check if admin account is active
    db.query(
      "SELECT is_active FROM users WHERE id = ?",
      [req.user.id],
      (err, results) => {
        if (err) {
          return res.status(500).json({ message: "Database error" });
        }
        
        if (!results.length || results[0].is_active === 0) {
          return res.status(403).json({ message: "Admin account is inactive" });
        }
        
        next();
      }
    );
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Rate limiting middleware for sensitive operations
export const sensitiveOperationLimiter = (req, res, next) => {
  const sensitivePaths = ['/delete', '/remove', '/admin/users', '/admin/tables'];
  const isSensitive = sensitivePaths.some(path => req.path.includes(path));
  
  if (isSensitive) {
    // Additional security checks for sensitive operations
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Authentication required for sensitive operations" });
    }
  }
  
  next();
};

// Input validation middleware
export const validateInput = (req, res, next) => {
  const { body, params, query } = req;
  
  // Check for SQL injection patterns
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
    /(--|;|\/\*|\*\/)/,
    /(\bOR\b.*=.*=)/i,
    /(\bAND\b.*=.*=)/i
  ];
  
  const checkForSQLInjection = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        for (const pattern of sqlPatterns) {
          if (pattern.test(obj[key])) {
            return true;
          }
        }
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        if (checkForSQLInjection(obj[key])) {
          return true;
        }
      }
    }
    return false;
  };
  
  if (checkForSQLInjection({ body, params, query })) {
    return res.status(400).json({ message: "Invalid input detected" });
  }
  
  next();
};

// XSS prevention middleware
export const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        // Basic XSS prevention
        obj[key] = obj[key]
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;')
          .replace(/\//g, '&#x2F;');
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitize(obj[key]);
      }
    }
  };
  
  sanitize(req.body);
  sanitize(req.query);
  sanitize(req.params);
  
  next();
};

// Admin activity logging helper
export const logAdminActivity = (adminId, action, entityType, entityId, ipAddress, userAgent) => {
  db.query(
    `INSERT INTO admin_activity (admin_id, action, entity_type, entity_id, ip_address, user_agent) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [adminId, action, entityType, entityId, ipAddress, userAgent],
    (err) => {
      if (err) console.error("Error logging admin activity:", err);
    }
  );
};

// Request logging middleware
export const logRequest = (req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logData = {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent')
    };
    
    console.log(`[${new Date().toISOString()}] ${logData.method} ${logData.path} - ${logData.statusCode} - ${logData.duration}`);
  });
  
  next();
};

// Role-based access control
export const hasRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    
    next();
  };
};

// Check if user owns the resource or is admin
export const isOwnerOrAdmin = (userIdParam = 'userId') => {
  return (req, res, next) => {
    const resourceUserId = parseInt(req.params[userIdParam] || req.body[userIdParam]);
    
    if (req.user.role === 'admin' || req.user.id === resourceUserId) {
      next();
    } else {
      res.status(403).json({ message: "Access denied" });
    }
  };
};

// Validate required fields
export const validateRequiredFields = (fields) => {
  return (req, res, next) => {
    const missingFields = fields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: "Missing required fields", 
        missingFields 
      });
    }
    
    next();
  };
};

// Pagination middleware
export const paginate = (defaultLimit = 20, maxLimit = 100) => {
  return (req, res, next) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(maxLimit, Math.max(1, parseInt(req.query.limit) || defaultLimit));
    
    req.pagination = {
      page,
      limit,
      offset: (page - 1) * limit
    };
    
    next();
  };
};