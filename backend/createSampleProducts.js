const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');
require('dotenv').config();

const createSampleProducts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/agrolink');
    console.log('Connected to MongoDB');

    // Find or create a farmer user
    let farmer = await User.findOne({ role: 'farmer' });
    if (!farmer) {
      // Create a sample farmer
      farmer = new User({
        name: 'John Farmer',
        email: 'farmer@agrolink.com',
        password: 'farmer123456',
        role: 'farmer',
        city: 'Mumbai',
        isApproved: true,
        farmDescription: 'Organic farm with fresh vegetables and fruits'
      });
      await farmer.save();
      console.log('Created sample farmer');
    }

    // Check if products already exist
    const existingProducts = await Product.countDocuments();
    if (existingProducts > 0) {
      console.log('Sample products already exist!');
      process.exit(0);
    }

    // Create sample products
    const sampleProducts = [
      {
        name: 'Fresh Tomatoes',
        description: 'Organic red tomatoes, freshly harvested from our farm. Perfect for salads and cooking.',
        price: 40,
        quantity: 50,
        unit: 'kg',
        category: 'vegetables',
        image: 'tomatoes.jpg',
        city: 'Mumbai',
        farmer: farmer._id,
        isAvailable: true
      },
      {
        name: 'Sweet Corn',
        description: 'Sweet and juicy corn, perfect for grilling or boiling. Grown without pesticides.',
        price: 30,
        quantity: 25,
        unit: 'dozen',
        category: 'vegetables',
        image: 'corn.jpg',
        city: 'Mumbai',
        farmer: farmer._id,
        isAvailable: true
      },
      {
        name: 'Fresh Milk',
        description: 'Pure cow milk, delivered fresh every morning. Rich in nutrients and taste.',
        price: 60,
        quantity: 20,
        unit: 'piece',
        category: 'dairy',
        image: 'milk.jpg',
        city: 'Mumbai',
        farmer: farmer._id,
        isAvailable: true
      },
      {
        name: 'Organic Apples',
        description: 'Sweet and crunchy organic apples. Perfect for healthy snacking.',
        price: 120,
        quantity: 15,
        unit: 'kg',
        category: 'fruits',
        image: 'apples.jpg',
        city: 'Mumbai',
        farmer: farmer._id,
        isAvailable: true
      },
      {
        name: 'Fresh Eggs',
        description: 'Farm fresh eggs from free-range chickens. Rich in protein and nutrients.',
        price: 80,
        quantity: 30,
        unit: 'dozen',
        category: 'poultry',
        image: 'eggs.jpg',
        city: 'Mumbai',
        farmer: farmer._id,
        isAvailable: true
      }
    ];

    // Insert products
    await Product.insertMany(sampleProducts);
    console.log('Sample products created successfully!');
    console.log('Products added:', sampleProducts.length);

  } catch (error) {
    console.error('Error creating sample products:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

createSampleProducts(); 