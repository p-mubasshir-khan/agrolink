const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'agrolink_secret');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Middleware to check if user is a farmer
const isFarmer = (req, res, next) => {
  if (req.user.role !== 'farmer') {
    return res.status(403).json({ message: 'Access denied. Farmer role required.' });
  }
  next();
};

// Middleware to check if user is a customer
const isCustomer = (req, res, next) => {
  if (req.user.role !== 'customer') {
    return res.status(403).json({ message: 'Access denied. Customer role required.' });
  }
  next();
};

// Middleware to check if user is an admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
  next();
};

// Middleware to check if farmer is approved
const isApprovedFarmer = (req, res, next) => {
  if (req.user.role !== 'farmer' || !req.user.isApproved) {
    return res.status(403).json({ message: 'Access denied. Approved farmer role required.' });
  }
  next();
};

module.exports = { auth, isFarmer, isCustomer, isAdmin, isApprovedFarmer }; 