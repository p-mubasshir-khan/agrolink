const express = require('express');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { auth, isCustomer, isApprovedFarmer } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/orders
// @desc    Place a new order (customer only)
// @access  Private
router.post('/', [
  auth,
  isCustomer,
  body('products').isArray({ min: 1 }).withMessage('At least one product is required'),
  body('products.*.productId').notEmpty().withMessage('Product ID is required'),
  body('products.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('deliveryAddress').notEmpty().withMessage('Delivery address is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { products, deliveryAddress, deliveryInstructions, notes } = req.body;

    // Validate products and get their details
    const orderProducts = [];
    let totalAmount = 0;
    let farmerId = null;

    for (const item of products) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        return res.status(400).json({ message: `Product ${item.productId} not found` });
      }

      if (!product.isAvailable) {
        return res.status(400).json({ message: `Product ${product.name} is not available` });
      }

      if (product.quantity < item.quantity) {
        return res.status(400).json({ message: `Insufficient quantity for ${product.name}` });
      }

      // Set farmer ID (all products should be from same farmer for simplicity)
      if (!farmerId) {
        farmerId = product.farmer;
      } else if (farmerId.toString() !== product.farmer.toString()) {
        return res.status(400).json({ message: 'All products must be from the same farmer' });
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderProducts.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price
      });

      // Update product quantity
      product.quantity -= item.quantity;
      if (product.quantity === 0) {
        product.isAvailable = false;
      }
      await product.save();
    }

    // Create order
    const order = new Order({
      customer: req.user.id,
      farmer: farmerId,
      products: orderProducts,
      totalAmount,
      deliveryAddress,
      deliveryInstructions,
      notes,
      expectedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
    });

    await order.save();

    // Populate product and farmer details for response
    await order.populate([
      { path: 'products.product', select: 'name price unit' },
      { path: 'farmer', select: 'name city phone' }
    ]);

    res.status(201).json({
      message: 'Order placed successfully',
      order
    });
  } catch (error) {
    console.error('Place order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/orders/customer/my-orders
// @desc    Get customer's orders
// @access  Private
router.get('/customer/my-orders', auth, isCustomer, async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user.id })
      .populate([
        { path: 'products.product', select: 'name price unit image' },
        { path: 'farmer', select: 'name city phone' }
      ])
      .sort({ orderDate: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Get customer orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/orders/farmer/my-orders
// @desc    Get farmer's orders
// @access  Private
router.get('/farmer/my-orders', auth, isApprovedFarmer, async (req, res) => {
  try {
    const orders = await Order.find({ farmer: req.user.id })
      .populate([
        { path: 'products.product', select: 'name price unit' },
        { path: 'customer', select: 'name city phone address' }
      ])
      .sort({ orderDate: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Get farmer orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/orders/:id
// @desc    Get order details
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate([
        { path: 'products.product', select: 'name price unit image' },
        { path: 'farmer', select: 'name city phone' },
        { path: 'customer', select: 'name city phone address' }
      ]);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is authorized to view this order
    if (order.customer.toString() !== req.user.id && 
        order.farmer.toString() !== req.user.id && 
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status (farmer only)
// @access  Private
router.put('/:id/status', [
  auth,
  isApprovedFarmer,
  body('status').isIn(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']).withMessage('Invalid status')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, notes } = req.body;

    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if the order belongs to the authenticated farmer
    if (order.farmer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }

    order.status = status;
    if (notes) order.notes = notes;
    
    if (status === 'delivered') {
      order.actualDelivery = new Date();
    }

    await order.save();

    res.json({
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/orders/:id/payment
// @desc    Simulate payment completion (customer only)
// @access  Private
router.put('/:id/payment', auth, isCustomer, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if the order belongs to the authenticated customer
    if (order.customer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }

    // Simulate payment completion
    order.paymentStatus = 'completed';
    await order.save();

    res.json({
      message: 'Payment completed successfully',
      order
    });
  } catch (error) {
    console.error('Payment simulation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 