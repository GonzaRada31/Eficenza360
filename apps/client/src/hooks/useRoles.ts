import { useAuth } from '../context/AuthContext';

export const useRoles = () => {
  const { user } = useAuth();
  
  const hasRole = (role: string): boolean => {
    if (!user) return false;
    // Check either singular main role ('SUPER_ADMIN') or multiple roles arrays
    if (user.role === role) return true;
    if (user.roles?.includes(role)) return true;
    
    return false;
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return roles.some(role => hasRole(role));
  };

  return { hasRole, hasAnyRole, roles: user?.roles || [user?.role].filter(Boolean) as string[] };
};
