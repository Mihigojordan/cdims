import React, { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import useAdminAuth from '../../context/AuthContext';

interface ProtectPrivateAdminRouteProps {
  children: ReactNode;
  requiredRole?: string; // optional: restrict access by role
}

const ProtectPrivateAdminRoute: React.FC<ProtectPrivateAdminRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { isAuthenticated, isLoading, user } = useAdminAuth();
  const location = useLocation();
 
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-primary-50">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600 font-inter">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated ) {
    // Redirect to login if not authenticated or not active
    return <Navigate to="/auth/admin/login" state={{ from: location }} replace />;
  }

  if (requiredRole) {
    // Optionally restrict access by role
    return <Navigate to="/auth/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectPrivateAdminRoute;
