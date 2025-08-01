import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  Plus,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

const Dashboard = () => {
  const { user, isFarmer, isCustomer, isAdmin } = useAuth();
  const [stats, setStats] = useState({});
  const [recentProducts, setRecentProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      if (isFarmer) {
        const [statsResponse, productsResponse, ordersResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/farmers/stats'),
          axios.get('http://localhost:5000/api/products/farmer/my-products'),
          axios.get('http://localhost:5000/api/orders/farmer/my-orders')
        ]);
        
        setStats(statsResponse.data);
        setRecentProducts(productsResponse.data.slice(0, 5));
        setRecentOrders(ordersResponse.data.slice(0, 5));
      } else if (isCustomer) {
        const [statsResponse, ordersResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/customers/stats'),
          axios.get('http://localhost:5000/api/orders/customer/my-orders')
        ]);
        
        setStats(statsResponse.data);
        setRecentOrders(ordersResponse.data.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'confirmed': return 'text-blue-600 bg-blue-100';
      case 'shipped': return 'text-purple-600 bg-purple-100';
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'shipped': return <TrendingUp className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}!</p>
        </div>
        {isFarmer && (
          <Link to="/products/add" className="btn-primary flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Add Product
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {isFarmer && (
          <>
            <div className="card">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-primary-100 text-primary-600">
                  <Package className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Products</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalProducts || 0}</p>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <ShoppingCart className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalOrders || 0}</p>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                  <p className="text-2xl font-semibold text-gray-900">₹{stats.totalEarnings || 0}</p>
                </div>
              </div>
            </div>
          </>
        )}

        {isCustomer && (
          <>
            <div className="card">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-primary-100 text-primary-600">
                  <ShoppingCart className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalOrders || 0}</p>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Spent</p>
                  <p className="text-2xl font-semibold text-gray-900">₹{stats.totalSpent || 0}</p>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <Users className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Farmers Connected</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.farmersConnected || 0}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Recent Products (for farmers) */}
      {isFarmer && recentProducts.length > 0 && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Products</h2>
            <Link to="/products" className="text-primary-600 hover:text-primary-700 text-sm">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {recentProducts.map((product) => (
              <div key={product._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <img
                    src={`http://localhost:5000/${product.image}`}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/48x48?text=P';
                    }}
                  />
                  <div>
                    <h3 className="font-medium text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-600">₹{product.price}/{product.unit}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Link
                    to={`/products/${product._id}`}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  <Link
                    to={`/products/${product._id}/edit`}
                    className="p-1 text-gray-400 hover:text-blue-600"
                  >
                    <Edit className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      {recentOrders.length > 0 && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
            <Link to="/orders" className="text-primary-600 hover:text-primary-700 text-sm">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Order #{order._id.slice(-6)}</h3>
                  <p className="text-sm text-gray-600">
                    {order.products?.length || 0} items • ₹{order.totalAmount}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.orderDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(order.status)}
                      <span className="capitalize">{order.status}</span>
                    </div>
                  </span>
                  <Link
                    to={`/orders/${order._id}`}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to="/products"
            className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Package className="h-6 w-6 text-primary-600" />
              <div>
                <h3 className="font-medium text-gray-900">Browse Products</h3>
                <p className="text-sm text-gray-600">Find fresh produce</p>
              </div>
            </div>
          </Link>
          
          <Link
            to="/orders"
            className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <ShoppingCart className="h-6 w-6 text-primary-600" />
              <div>
                <h3 className="font-medium text-gray-900">View Orders</h3>
                <p className="text-sm text-gray-600">Track your orders</p>
              </div>
            </div>
          </Link>

          {isFarmer && (
            <Link
              to="/products/add"
              className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Plus className="h-6 w-6 text-primary-600" />
                <div>
                  <h3 className="font-medium text-gray-900">Add Product</h3>
                  <p className="text-sm text-gray-600">List new produce</p>
                </div>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 