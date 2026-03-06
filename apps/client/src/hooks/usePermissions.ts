import { useAuth } from '../context/AuthContext';

export const usePermissions = () => {
  const { user } = useAuth();
  
  const can = (permission: string): boolean => {
    if (!user) return false;
    
    // Implicit super-admin override if needed, though strictly granular is better.
    if (user.role === 'SUPER_ADMIN') return true;
    
    return !!user.permissions?.includes(permission);
  };

  const canAny = (permissions: string[]): boolean => {
    return permissions.some(permission => can(permission));
  };

  const canAll = (permissions: string[]): boolean => {
    return permissions.every(permission => can(permission));
  };

  return { can, canAny, canAll, permissions: user?.permissions || [] };
};
