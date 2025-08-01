const express = require('express');
const { auth, isCustomer } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/customers/profile
// @desc    Get customer profile
// @access  Private
router.get('/profile', auth, isCustomer, async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    console.error('Get customer profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/customers/stats
// @desc    Get customer statistics
// @access  Private
router.get('/stats', auth, isCustomer, async (req, res) => {
  try {
    const Order = require('../models/Order');

    const totalOrders = await Order.countDocuments({ customer: req.user.id });
    const pendingOrders = await Order.countDocuments({ customer: req.user.id, status: 'pending' });
    const completedOrders = await Order.countDocuments({ customer: req.user.id, status: 'delivered' });
    const cancelledOrders = await Order.countDocuments({ customer: req.user.id, status: 'cancelled' });

    // Calculate total spent
    const orders = await Order.find({ customer: req.user.id, paymentStatus: 'completed' });
    const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    res.json({
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      totalSpent
    });
  } catch (error) {
    console.error('Get customer stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 