import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false, farmerOnly = false, customerOnly = false }) => {
  const { user, loading, isAuthenticated, isAdmin, isFarmer, isCustomer } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (farmerOnly && !isFarmer) {
    return <Navigate to="/" replace />;
  }

  if (customerOnly && !isCustomer) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute; 