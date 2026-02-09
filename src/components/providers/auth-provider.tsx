'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Role } from '@/types/schema';

interface UserData {
    id: string;
    email: string;
    displayName: string;
    role: Role;
    clientId: string;
}

interface AuthContextType {
    user: UserData | null;
    role: Role | null;
    clientId: string | null;
    loading: boolean;
    isAdmin: boolean;
    isClientAdmin: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    role: null,
    clientId: null,
    loading: true,
    isAdmin: false,
    isClientAdmin: false,
    login: async () => {},
    logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for existing session
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
            try {
                setUser(JSON.parse(userData));
            } catch {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Login failed');
        }

        const data = await res.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const value = {
        user,
        role: user?.role || null,
        clientId: user?.clientId || null,
        loading,
        isAdmin: user?.role === 'super_admin',
        isClientAdmin: user?.role === 'client_admin',
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
