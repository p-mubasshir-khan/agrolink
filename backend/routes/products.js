const express = require('express');
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const { auth, isApprovedFarmer } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// @route   GET /api/products
// @desc    Get all products with optional filtering
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { city, category, search, page = 1, limit = 10 } = req.query;
    
    // Build filter object
    const filter = { isAvailable: true };
    if (city) filter.city = { $regex: city, $options: 'i' };
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

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

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('farmer', 'name city phone');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/products
// @desc    Create a new product (farmer only)
// @access  Private
router.post('/', [
  auth,
  isApprovedFarmer,
  upload.single('image'),
  body('name').notEmpty().withMessage('Product name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('category').isIn(['vegetables', 'fruits', 'grains', 'dairy', 'poultry', 'other']).withMessage('Invalid category'),
  body('unit').isIn(['kg', 'dozen', 'piece', 'bundle', 'quintal']).withMessage('Invalid unit')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Product image is required' });
    }

    const { name, description, price, quantity, category, unit, city } = req.body;

    const product = new Product({
      name,
      description,
      price: parseFloat(price),
      quantity: parseInt(quantity),
      category,
      unit,
      city: city || req.user.city,
      image: req.file.filename,
      farmer: req.user.id
    });

    await product.save();

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/products/:id
// @desc    Update a product (farmer only)
// @access  Private
router.put('/:id', [
  auth,
  isApprovedFarmer,
  body('name').notEmpty().withMessage('Product name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('category').isIn(['vegetables', 'fruits', 'grains', 'dairy', 'poultry', 'other']).withMessage('Invalid category'),
  body('unit').isIn(['kg', 'dozen', 'piece', 'bundle', 'quintal']).withMessage('Invalid unit')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if the product belongs to the authenticated farmer
    if (product.farmer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }

    const { name, description, price, quantity, category, unit, city } = req.body;

    product.name = name;
    product.description = description;
    product.price = parseFloat(price);
    product.quantity = parseInt(quantity);
    product.category = category;
    product.unit = unit;
    if (city) product.city = city;

    await product.save();

    res.json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product (farmer only)
// @access  Private
router.delete('/:id', auth, isApprovedFarmer, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if the product belongs to the authenticated farmer
    if (product.farmer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/products/farmer/my-products
// @desc    Get farmer's own products
// @access  Private
router.get('/farmer/my-products', auth, isApprovedFarmer, async (req, res) => {
  try {
    const products = await Product.find({ farmer: req.user.id })
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    console.error('Get farmer products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 