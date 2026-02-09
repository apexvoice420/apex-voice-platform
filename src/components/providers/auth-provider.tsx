'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, onIdTokenChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Role } from '@/types/schema';

interface AuthContextType {
    user: User | null;
    role: Role | null;
    clientId: string | null;
    loading: boolean;
    isAdmin: boolean;
    isClientAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    role: null,
    clientId: null,
    loading: true,
    isAdmin: false,
    isClientAdmin: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<Role | null>(null);
    const [clientId, setClientId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onIdTokenChanged(auth, async (currentUser) => {
            setUser(currentUser);

            if (currentUser) {
                // Get custom claims
                const tokenResult = await currentUser.getIdTokenResult();
                const userRole = (tokenResult.claims.role as Role) || 'user';
                const userClientId = (tokenResult.claims.clientId as string) || null;

                setRole(userRole);
                setClientId(userClientId);
            } else {
                setRole(null);
                setClientId(null);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const value = {
        user,
        role,
        clientId,
        loading,
        isAdmin: role === 'super_admin',
        isClientAdmin: role === 'client_admin',
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
