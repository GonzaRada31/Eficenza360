import React, { createContext, useContext, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useQueryClient } from '@tanstack/react-query';

export interface AuthUser {
    id: string; // The user's ID
    sub: string;
    email: string;
    role: string;
    roles?: string[]; // Multiple roles if applicable
    permissions?: string[]; // Array of granular permissions
    tenantId: string;
}

interface AuthContextType {
    user: AuthUser | null;
    token: string | null;
    login: (token: string) => boolean;
    logout: () => void;
    isAuthenticated: boolean;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // We use React Query Client to clear cache on logout (Security Requirement)
    const queryClient = useQueryClient();
    
    const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
    const [user, setUser] = useState<AuthUser | null>(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            try {
                return jwtDecode<AuthUser>(storedToken);
            } catch (error) {
                console.error('Invalid token in storage', error);
                localStorage.removeItem('token');
                return null;
            }
        }
        return null;
    });

    const login = (newToken: string) => {
        try {
            console.log('Attempting login with token:', newToken ? 'Present' : 'Missing');
            const decoded = jwtDecode<AuthUser>(newToken);
            console.log('Token decoded successfully:', decoded);
            localStorage.setItem('token', newToken);
            setToken(newToken);
            setUser({
                ...decoded,
                roles: decoded.roles || [decoded.role],
                permissions: decoded.permissions || [],
            });
            return true;
        } catch (error) {
            console.error('Invalid token provided to login', error);
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        // Security: clear all queries from TanStack on logout to prevent data leak between sessions
        queryClient.clear();
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
