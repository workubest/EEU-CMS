import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, ROLE_PERMISSIONS, RolePermissions } from '@/types/user';
import { dataPersistence } from '@/lib/persistence';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  permissions: RolePermissions;
  isAuthenticated: boolean;
  login: (userData: User) => void;
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
  hasPermission: (resource: keyof RolePermissions, action: keyof RolePermissions['complaints']) => boolean;
  canAccessRegion: (region: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users removed - authentication now requires real backend

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>('admin');
  const [isLoading, setIsLoading] = useState(true);

  const permissions = ROLE_PERMISSIONS[role];
  const isAuthenticated = user !== null;

  // Restore user session on app startup
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const cachedUser = await dataPersistence.getData('user_session');
        if (cachedUser && cachedUser.user) {
          console.log('👤 Restoring user session from cache');
          setUser(cachedUser.user);
          setRole(cachedUser.user.role);
        }
      } catch (error) {
        console.error('❌ Failed to restore session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (userData: User) => {
    setUser(userData);
    setRole(userData.role);
    
    // Persist user session
    await dataPersistence.saveData('user_session', { user: userData });
    console.log('👤 User session saved');
  };

  const logout = async () => {
    setUser(null);
    setRole('call-attendant');
    
    // Clear all cached data
    await dataPersistence.clearAll();
    console.log('👋 User logged out - cache cleared');
  };

  const switchRole = (newRole: UserRole) => {
    // Role switching disabled - requires real authentication
    console.warn('Role switching is disabled. Please login with appropriate credentials.');
  };

  const hasPermission = (resource: keyof RolePermissions, action: keyof RolePermissions['complaints']): boolean => {
    if (resource === 'canAssignComplaint' || resource === 'canSetHighPriority' || resource === 'accessibleRegions') {
      return false;
    }
    return permissions[resource][action];
  };

  const canAccessRegion = (region: string): boolean => {
    if (permissions.accessibleRegions === 'all') return true;
    if (Array.isArray(permissions.accessibleRegions)) {
      return permissions.accessibleRegions.length === 0 ? 
        region === user?.region : 
        permissions.accessibleRegions.includes(region);
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{
      user,
      role,
      permissions,
      isAuthenticated,
      login,
      logout,
      switchRole,
      hasPermission,
      canAccessRegion
    }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}