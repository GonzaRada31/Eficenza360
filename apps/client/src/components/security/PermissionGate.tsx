import React from 'react';
import { usePermissions } from '../../hooks/usePermissions';

interface PermissionGateProps {
  children: React.ReactNode;
  permission?: string;
  anyPermission?: string[];
  allPermissions?: string[];
  fallback?: React.ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({ 
  children, 
  permission, 
  anyPermission, 
  allPermissions,
  fallback = null 
}) => {
  const { can, canAny, canAll } = usePermissions();

  let hasAccess = true;

  if (permission && !can(permission)) {
    hasAccess = false;
  }

  if (anyPermission && !canAny(anyPermission)) {
    hasAccess = false;
  }

  if (allPermissions && !canAll(allPermissions)) {
    hasAccess = false;
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};
