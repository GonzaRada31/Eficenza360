import React, { createContext, useContext, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

interface User {
    sub: string;
    email: string;
    role: string;
    tenantId: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string) => boolean;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Initialize state from localStorage to avoid useEffect synchronization issues
    const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
    const [user, setUser] = useState<User | null>(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            try {
                return jwtDecode<User>(storedToken);
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
            const decoded = jwtDecode<User>(newToken);
            console.log('Token decoded successfully:', decoded);
            localStorage.setItem('token', newToken);
            setToken(newToken);
            setUser(decoded);
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
