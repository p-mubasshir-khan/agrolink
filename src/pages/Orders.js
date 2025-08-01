import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  Eye, 
  Clock, 
  CheckCircle, 
  TrendingUp, 
  XCircle,
  Package,
  User,
  Calendar
} from 'lucide-react';

const Orders = () => {
  const { user, isFarmer, isCustomer } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus]);

  const fetchOrders = async () => {
    try {
      let endpoint = '';
      if (isFarmer) {
        endpoint = 'http://localhost:5000/api/orders/farmer/my-orders';
      } else if (isCustomer) {
        endpoint = 'http://localhost:5000/api/orders/customer/my-orders';
      }

      const params = new URLSearchParams();
      if (selectedStatus) params.append('status', selectedStatus);

      const response = await axios.get(`${endpoint}?${params}`);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/orders/${orderId}/status`, {
        status: newStatus
      });
      
      // Refresh orders
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
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

  const getStatusOptions = () => {
    const options = [
      { value: '', label: 'All Status' },
      { value: 'pending', label: 'Pending' },
      { value: 'confirmed', label: 'Confirmed' },
      { value: 'shipped', label: 'Shipped' },
      { value: 'delivered', label: 'Delivered' },
      { value: 'cancelled', label: 'Cancelled' }
    ];

    // For farmers, don't show 'cancelled' as an option to set
    if (isFarmer) {
      return options.filter(option => option.value !== 'cancelled');
    }

    return options;
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-600">Manage and track your orders</p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Filter Orders</h2>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="input-field w-48"
          >
            {getStatusOptions().map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Package className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-600">
            {isCustomer ? 'Start shopping to see your orders here' : 'No orders have been placed yet'}
          </p>
          {isCustomer && (
            <Link to="/products" className="btn-primary mt-4">
              Browse Products
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="card">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Order #{order._id.slice(-6)}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Placed on {new Date(order.orderDate).toLocaleDateString()}
                  </p>
                  {isCustomer && (
                    <p className="text-sm text-gray-600">
                      Farmer: {order.farmer?.name || 'Unknown'}
                    </p>
                  )}
                  {isFarmer && (
                    <p className="text-sm text-gray-600">
                      Customer: {order.customer?.name || 'Unknown'}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(order.status)}
                      <span className="capitalize">{order.status}</span>
                    </div>
                  </span>
                  <Link
                    to={`/orders/${order._id}`}
                    className="btn-secondary text-sm px-3 py-1"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-2 mb-4">
                {order.products?.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center space-x-3">
                      <Package className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {item.product?.name || 'Product'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {item.quantity} {item.product?.unit || 'units'} × ₹{item.price}
                        </p>
                      </div>
                    </div>
                    <p className="font-medium text-gray-900">
                      ₹{item.quantity * item.price}
                    </p>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-lg font-semibold text-gray-900">
                      Total: ₹{order.totalAmount}
                    </p>
                    <p className="text-sm text-gray-600">
                      Payment: {order.paymentStatus}
                    </p>
                  </div>

                  {/* Status Update (for farmers) */}
                  {isFarmer && order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <div className="flex space-x-2">
                      {order.status === 'pending' && (
                        <button
                          onClick={() => updateOrderStatus(order._id, 'confirmed')}
                          className="btn-primary text-sm px-3 py-1"
                        >
                          Confirm
                        </button>
                      )}
                      {order.status === 'confirmed' && (
                        <button
                          onClick={() => updateOrderStatus(order._id, 'shipped')}
                          className="btn-primary text-sm px-3 py-1"
                        >
                          Ship
                        </button>
                      )}
                      {order.status === 'shipped' && (
                        <button
                          onClick={() => updateOrderStatus(order._id, 'delivered')}
                          className="btn-primary text-sm px-3 py-1"
                        >
                          Mark Delivered
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders; 