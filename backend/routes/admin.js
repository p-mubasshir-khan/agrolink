const express = require('express');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { auth, isAdmin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private (Admin only)
router.get('/dashboard', auth, isAdmin, async (req, res) => {
  try {
    // Get counts
    const totalUsers = await User.countDocuments();
    const totalFarmers = await User.countDocuments({ role: 'farmer' });
    const pendingFarmers = await User.countDocuments({ role: 'farmer', isApproved: false });
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    // Get recent activities
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email role createdAt');

    const recentOrders = await Order.find()
      .populate('customer', 'name')
      .populate('farmer', 'name')
      .sort({ orderDate: -1 })
      .limit(5);

    const recentProducts = await Product.find()
      .populate('farmer', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      statistics: {
        totalUsers,
        totalFarmers,
        pendingFarmers,
        totalCustomers,
        totalProducts,
        totalOrders
      },
      recentActivities: {
        users: recentUsers,
        orders: recentOrders,
        products: recentProducts
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with filtering
// @access  Private (Admin only)
router.get('/users', auth, isAdmin, async (req, res) => {
  try {
    const { role, isApproved, page = 1, limit = 10 } = req.query;
    
    // Build filter
    const filter = {};
    if (role) filter.role = role;
    if (isApproved !== undefined) filter.isApproved = isApproved === 'true';

    const skip = (page - 1) * limit;
    
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/farmers/pending
// @desc    Get pending farmer approvals
// @access  Private (Admin only)
router.get('/farmers/pending', auth, isAdmin, async (req, res) => {
  try {
    const pendingFarmers = await User.find({ 
      role: 'farmer', 
      isApproved: false 
    })
    .select('-password')
    .sort({ createdAt: -1 });

    res.json(pendingFarmers);
  } catch (error) {
    console.error('Get pending farmers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/farmers/:id/approve
// @desc    Approve a farmer
// @access  Private (Admin only)
router.put('/farmers/:id/approve', auth, isAdmin, async (req, res) => {
  try {
    const farmer = await User.findById(req.params.id);
    
    if (!farmer) {
      return res.status(404).json({ message: 'Farmer not found' });
    }

    if (farmer.role !== 'farmer') {
      return res.status(400).json({ message: 'User is not a farmer' });
    }

    if (farmer.isApproved) {
      return res.status(400).json({ message: 'Farmer is already approved' });
    }

    farmer.isApproved = true;
    await farmer.save();

    res.json({
      message: 'Farmer approved successfully',
      farmer: {
        id: farmer._id,
        name: farmer.name,
        email: farmer.email,
        city: farmer.city,
        isApproved: farmer.isApproved
      }
    });
  } catch (error) {
    console.error('Approve farmer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/farmers/:id/reject
// @desc    Reject a farmer (delete account)
// @access  Private (Admin only)
router.put('/farmers/:id/reject', auth, isAdmin, async (req, res) => {
  try {
    const farmer = await User.findById(req.params.id);
    
    if (!farmer) {
      return res.status(404).json({ message: 'Farmer not found' });
    }

    if (farmer.role !== 'farmer') {
      return res.status(400).json({ message: 'User is not a farmer' });
    }

    // Delete farmer's products
    await Product.deleteMany({ farmer: farmer._id });
    
    // Delete farmer account
    await User.findByIdAndDelete(farmer._id);

    res.json({ message: 'Farmer rejected and account deleted successfully' });
  } catch (error) {
    console.error('Reject farmer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/products
// @desc    Get all products with filtering
// @access  Private (Admin only)
router.get('/products', auth, isAdmin, async (req, res) => {
  try {
    const { category, city, isAvailable, page = 1, limit = 10 } = req.query;
    
    // Build filter
    const filter = {};
    if (category) filter.category = category;
    if (city) filter.city = { $regex: city, $options: 'i' };
    if (isAvailable !== undefined) filter.isAvailable = isAvailable === 'true';

    const skip = (page - 1) * limit;
    
    const products = await Product.find(filter)
      .populate('farmer', 'name city')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(filter);

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/orders
// @desc    Get all orders with filtering
// @access  Private (Admin only)
router.get('/orders', auth, isAdmin, async (req, res) => {
  try {
    const { status, paymentStatus, page = 1, limit = 10 } = req.query;
    
    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const skip = (page - 1) * limit;
    
    const orders = await Order.find(filter)
      .populate([
        { path: 'customer', select: 'name city' },
        { path: 'farmer', select: 'name city' },
        { path: 'products.product', select: 'name price' }
      ])
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(filter);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/products/:id
// @desc    Delete a product (admin only)
// @access  Private (Admin only)
router.delete('/products/:id', auth, isAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user (admin only)
// @access  Private (Admin only)
router.delete('/users/:id', auth, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If user is a farmer, delete their products
    if (user.role === 'farmer') {
      await Product.deleteMany({ farmer: user._id });
    }

    // Delete user's orders
    await Order.deleteMany({ 
      $or: [{ customer: user._id }, { farmer: user._id }] 
    });

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 