const express = require('express');
const { auth, isApprovedFarmer } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/farmers/profile
// @desc    Get farmer profile
// @access  Private
router.get('/profile', auth, isApprovedFarmer, async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    console.error('Get farmer profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/farmers/stats
// @desc    Get farmer statistics
// @access  Private
router.get('/stats', auth, isApprovedFarmer, async (req, res) => {
  try {
    const Product = require('../models/Product');
    const Order = require('../models/Order');

    const totalProducts = await Product.countDocuments({ farmer: req.user.id });
    const activeProducts = await Product.countDocuments({ farmer: req.user.id, isAvailable: true });
    const totalOrders = await Order.countDocuments({ farmer: req.user.id });
    const pendingOrders = await Order.countDocuments({ farmer: req.user.id, status: 'pending' });
    const completedOrders = await Order.countDocuments({ farmer: req.user.id, status: 'delivered' });

    // Calculate total earnings
    const orders = await Order.find({ farmer: req.user.id, paymentStatus: 'completed' });
    const totalEarnings = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    res.json({
      totalProducts,
      activeProducts,
      totalOrders,
      pendingOrders,
      completedOrders,
      totalEarnings
    });
  } catch (error) {
    console.error('Get farmer stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 