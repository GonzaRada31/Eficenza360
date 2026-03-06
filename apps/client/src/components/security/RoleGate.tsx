import React from 'react';
import { useRoles } from '../../hooks/useRoles';

interface RoleGateProps {
  children: React.ReactNode;
  role?: string;
  anyRole?: string[];
  fallback?: React.ReactNode;
}

export const RoleGate: React.FC<RoleGateProps> = ({ 
  children, 
  role, 
  anyRole, 
  fallback = null 
}) => {
  const { hasRole, hasAnyRole } = useRoles();

  let hasAccess = true;

  if (role && !hasRole(role)) {
    hasAccess = false;
  }

  if (anyRole && !hasAnyRole(anyRole)) {
    hasAccess = false;
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};
