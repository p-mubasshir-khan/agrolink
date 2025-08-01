import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  ShoppingCart, 
  Star, 
  MapPin, 
  User, 
  Package,
  ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const { isCustomer } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/products/${id}`);
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = () => {
    if (!isCustomer) {
      toast.error('Please login as a customer to add items to cart');
      return;
    }

    const cartItem = {
      product: product,
      quantity: quantity
    };

    // Get existing cart from localStorage
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Check if product already exists in cart
    const existingItemIndex = existingCart.findIndex(item => item.product._id === product._id);
    
    if (existingItemIndex >= 0) {
      // Update quantity if product already exists
      existingCart[existingItemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      existingCart.push(cartItem);
    }

    // Save updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(existingCart));
    
    toast.success(`${product.name} added to cart!`);
  };

  const buyNow = () => {
    if (!isCustomer) {
      toast.error('Please login as a customer to place orders');
      return;
    }

    // Add to cart and redirect to cart page
    addToCart();
    window.location.href = '/cart';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Product not found</h3>
        <p className="text-gray-600 mb-6">The product you're looking for doesn't exist</p>
        <Link to="/products" className="btn-primary">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link to="/products" className="inline-flex items-center text-primary-600 hover:text-primary-700">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Products
      </Link>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Product Image */}
        <div>
          <img
            src={`http://localhost:5000/${product.image}`}
            alt={product.name}
            className="w-full h-96 object-cover rounded-lg shadow-md"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/600x400?text=Product+Image';
            }}
          />
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <p className="text-gray-600 text-lg">{product.description}</p>
          </div>

          {/* Price and Rating */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-primary-600">
                ₹{product.price}/{product.unit}
              </span>
              <div className="flex items-center space-x-1">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <span className="text-gray-600">4.5</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Available Quantity</p>
              <p className="text-lg font-semibold text-gray-900">
                {product.quantity} {product.unit}
              </p>
            </div>
          </div>

          {/* Farmer Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {product.farmer?.name || 'Unknown Farmer'}
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{product.city}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Package className="h-4 w-4" />
                    <span>{product.category}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quantity Selector */}
          {isCustomer && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-gray-600 hover:text-gray-800"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-x border-gray-300 font-medium">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                    className="px-3 py-2 text-gray-600 hover:text-gray-800"
                  >
                    +
                  </button>
                </div>
                <span className="text-sm text-gray-600">
                  {product.unit} available
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {isCustomer && (
            <div className="flex space-x-4">
              <button
                onClick={addToCart}
                className="flex-1 btn-secondary py-3 text-lg flex items-center justify-center"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </button>
              <button
                onClick={buyNow}
                className="flex-1 btn-primary py-3 text-lg"
              >
                Buy Now
              </button>
            </div>
          )}

          {/* Product Details */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Category</span>
                <span className="font-medium text-gray-900 capitalize">{product.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Unit</span>
                <span className="font-medium text-gray-900">{product.unit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Location</span>
                <span className="font-medium text-gray-900">{product.city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Listed On</span>
                <span className="font-medium text-gray-900">
                  {new Date(product.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Delivery Information</h4>
            <p className="text-sm text-blue-700">
              • Free delivery for orders above ₹500<br/>
              • Standard delivery: 2-3 business days<br/>
              • Fresh produce guaranteed
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail; 