import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useRoles } from '../../hooks/useRoles';
import { usePermissions } from '../../hooks/usePermissions';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  requireAuth?: boolean;
  requiredRole?: string;
  requiredAnyRole?: string[];
  requiredPermission?: string;
  requiredAnyPermission?: string[];
  requiredAllPermissions?: string[];
  redirectPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requiredRole,
  requiredAnyRole,
  requiredPermission,
  requiredAnyPermission,
  requiredAllPermissions,
  redirectPath = '/login'
}) => {
  const { isAuthenticated, user } = useAuth();
  const { hasRole, hasAnyRole } = useRoles();
  const { can, canAny, canAll } = usePermissions();
  const location = useLocation();

  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  if (user && !user.tenantId && requireAuth) {
    console.warn('User has no active tenant assigned.');
  }

  let hasAccess = true;

  if (requiredRole && !hasRole(requiredRole)) hasAccess = false;
  if (requiredAnyRole && !hasAnyRole(requiredAnyRole)) hasAccess = false;
  if (requiredPermission && !can(requiredPermission)) hasAccess = false;
  if (requiredAnyPermission && !canAny(requiredAnyPermission)) hasAccess = false;
  if (requiredAllPermissions && !canAll(requiredAllPermissions)) hasAccess = false;

  if (!hasAccess) {
    return <Navigate to="/dashboard" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
