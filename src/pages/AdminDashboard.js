import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  TrendingUp,
  Eye,
  CheckCircle,
  XCircle,
  Trash2,
  UserCheck,
  UserX
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [pendingFarmers, setPendingFarmers] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, farmersResponse, ordersResponse] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/dashboard'),
        axios.get('http://localhost:5000/api/admin/farmers/pending'),
        axios.get('http://localhost:5000/api/admin/orders')
      ]);
      
      setStats(statsResponse.data);
      setPendingFarmers(farmersResponse.data);
      setRecentOrders(ordersResponse.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveFarmer = async (farmerId) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/farmers/${farmerId}/approve`);
      toast.success('Farmer approved successfully');
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error approving farmer:', error);
      toast.error('Failed to approve farmer');
    }
  };

  const rejectFarmer = async (farmerId) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/farmers/${farmerId}/reject`);
      toast.success('Farmer rejected successfully');
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error rejecting farmer:', error);
      toast.error('Failed to reject farmer');
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
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Manage your marketplace</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <Users className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers || 0}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
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
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
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
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Farmers</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.pendingFarmers || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Farmers */}
      {pendingFarmers.length > 0 && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Pending Farmer Approvals</h2>
            <Link to="/admin/farmers" className="text-primary-600 hover:text-primary-700 text-sm">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {pendingFarmers.slice(0, 5).map((farmer) => (
              <div key={farmer._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{farmer.name}</h3>
                    <p className="text-sm text-gray-600">{farmer.email}</p>
                    <p className="text-sm text-gray-500">{farmer.city}</p>
                    {farmer.farmDescription && (
                      <p className="text-sm text-gray-500 mt-1">{farmer.farmDescription}</p>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => approveFarmer(farmer._id)}
                    className="btn-primary text-sm px-3 py-1 flex items-center"
                  >
                    <UserCheck className="h-4 w-4 mr-1" />
                    Approve
                  </button>
                  <button
                    onClick={() => rejectFarmer(farmer._id)}
                    className="bg-red-600 hover:bg-red-700 text-white font-medium py-1 px-3 rounded-lg text-sm flex items-center"
                  >
                    <UserX className="h-4 w-4 mr-1" />
                    Reject
                  </button>
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
            <Link to="/admin/orders" className="text-primary-600 hover:text-primary-700 text-sm">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Order #{order._id.slice(-6)}</h3>
                  <p className="text-sm text-gray-600">
                    {order.customer?.name || 'Unknown'} → {order.farmer?.name || 'Unknown'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.orderDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                  <span className="font-medium text-gray-900">₹{order.totalAmount}</span>
                  <Link
                    to={`/admin/orders/${order._id}`}
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
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/admin/users"
            className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Users className="h-6 w-6 text-primary-600" />
              <div>
                <h3 className="font-medium text-gray-900">Manage Users</h3>
                <p className="text-sm text-gray-600">View all users</p>
              </div>
            </div>
          </Link>
          
          <Link
            to="/admin/products"
            className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Package className="h-6 w-6 text-primary-600" />
              <div>
                <h3 className="font-medium text-gray-900">Manage Products</h3>
                <p className="text-sm text-gray-600">View all products</p>
              </div>
            </div>
          </Link>

          <Link
            to="/admin/orders"
            className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <ShoppingCart className="h-6 w-6 text-primary-600" />
              <div>
                <h3 className="font-medium text-gray-900">Manage Orders</h3>
                <p className="text-sm text-gray-600">View all orders</p>
              </div>
            </div>
          </Link>

          <Link
            to="/admin/farmers"
            className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <UserCheck className="h-6 w-6 text-primary-600" />
              <div>
                <h3 className="font-medium text-gray-900">Approve Farmers</h3>
                <p className="text-sm text-gray-600">Manage farmer approvals</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 