'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { storage, STORAGE_KEYS } from '@/lib/utils';

interface ActivationContextType {
    isActivated: boolean;
    isLoading: boolean;
    phoneNumber: string | null;
    activate: (phone: string) => Promise<{ success: boolean; error?: string }>;
    checkActivation: () => void;
}

const ActivationContext = createContext<ActivationContextType | undefined>(undefined);

export function ActivationProvider({ children }: { children: ReactNode }) {
    const [isActivated, setIsActivated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [phoneNumber, setPhoneNumber] = useState<string | null>(null);

    // Check activation status on mount
    useEffect(() => {
        checkActivation();
    }, []);

    // DEV MODE: Set to true to bypass activation during development
    const DEV_BYPASS = true;

    const checkActivation = () => {
        // In dev mode, auto-activate
        if (DEV_BYPASS && process.env.NODE_ENV === 'development') {
            setIsActivated(true);
            setPhoneNumber('DEV-MODE');
            setIsLoading(false);
            return;
        }

        const activated = storage.get<boolean>(STORAGE_KEYS.ACTIVATED, false);
        const phone = storage.get<string | null>(STORAGE_KEYS.ACTIVATION_PHONE, null);

        setIsActivated(activated);
        setPhoneNumber(phone);
        setIsLoading(false);
    };

    const activate = async (phone: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const response = await fetch('/api/activate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone }),
            });

            const data = await response.json();

            if (data.success) {
                // Save activation status locally
                storage.set(STORAGE_KEYS.ACTIVATED, true);
                storage.set(STORAGE_KEYS.ACTIVATION_PHONE, phone);
                setIsActivated(true);
                setPhoneNumber(phone);
                return { success: true };
            }

            return { success: false, error: data.error || 'Activation failed' };
        } catch (error) {
            console.error('Activation error:', error);
            return { success: false, error: 'Erreur de connexion. Vérifiez votre internet.' };
        }
    };

    return (
        <ActivationContext.Provider
            value={{
                isActivated,
                isLoading,
                phoneNumber,
                activate,
                checkActivation,
            }}
        >
            {children}
        </ActivationContext.Provider>
    );
}

export function useActivation() {
    const context = useContext(ActivationContext);
    if (context === undefined) {
        throw new Error('useActivation must be used within an ActivationProvider');
    }
    return context;
}
