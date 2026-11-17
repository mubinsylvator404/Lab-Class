import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  children,
}) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(currentUser.role)) {
    const fallback =
      currentUser.role === 'student'
        ? '/student/dashboard'
        : currentUser.role === 'client'
        ? '/client/dashboard'
        : '/admin/dashboard';
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
};
