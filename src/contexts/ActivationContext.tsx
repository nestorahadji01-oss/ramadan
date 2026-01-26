'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { storage, STORAGE_KEYS } from '@/lib/utils';
import { generateDeviceId, type UserProfile } from '@/lib/supabase';

interface ActivationContextType {
    isActivated: boolean;
    isLoading: boolean;
    phoneNumber: string | null;
    deviceId: string | null;
    userProfile: UserProfile | null;
    activate: (phone: string) => Promise<{ success: boolean; error?: string }>;
    checkActivation: () => void;
    logout: () => void;
}

const ActivationContext = createContext<ActivationContextType | undefined>(undefined);

// Storage keys for new data
const DEVICE_ID_KEY = 'ramadan_device_id';
const USER_PROFILE_KEY = 'ramadan_user_profile';

export function ActivationProvider({ children }: { children: ReactNode }) {
    const [isActivated, setIsActivated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
    const [deviceId, setDeviceId] = useState<string | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

    // Check activation status on mount
    useEffect(() => {
        initializeDevice();
        checkActivation();
    }, []);

    // DEV MODE: Set to false for production
    const DEV_BYPASS = false;

    /**
     * Initialize or retrieve device ID
     */
    const initializeDevice = () => {
        let storedDeviceId = storage.get<string | null>(DEVICE_ID_KEY, null);

        if (!storedDeviceId) {
            storedDeviceId = generateDeviceId();
            storage.set(DEVICE_ID_KEY, storedDeviceId);
        }

        setDeviceId(storedDeviceId);
    };

    const checkActivation = () => {
        // In dev mode, auto-activate
        if (DEV_BYPASS && process.env.NODE_ENV === 'development') {
            setIsActivated(true);
            setPhoneNumber('DEV-MODE');
            setUserProfile({
                phone: 'DEV-MODE',
                name: 'Développeur',
                firstName: 'Développeur',
                email: 'dev@test.com',
            });
            setIsLoading(false);
            return;
        }

        const activated = storage.get<boolean>(STORAGE_KEYS.ACTIVATED, false);
        const phone = storage.get<string | null>(STORAGE_KEYS.ACTIVATION_PHONE, null);
        const profile = storage.get<UserProfile | null>(USER_PROFILE_KEY, null);

        setIsActivated(activated);
        setPhoneNumber(phone);
        setUserProfile(profile);
        setIsLoading(false);
    };

    const activate = async (phone: string): Promise<{ success: boolean; error?: string }> => {
        try {
            // Ensure we have a device ID
            let currentDeviceId = deviceId;
            if (!currentDeviceId) {
                currentDeviceId = generateDeviceId();
                storage.set(DEVICE_ID_KEY, currentDeviceId);
                setDeviceId(currentDeviceId);
            }

            const response = await fetch('/api/activate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone,
                    deviceId: currentDeviceId,
                }),
            });

            const data = await response.json();

            if (data.success) {
                // Save activation status locally
                storage.set(STORAGE_KEYS.ACTIVATED, true);
                storage.set(STORAGE_KEYS.ACTIVATION_PHONE, phone);

                // Save user profile if available
                if (data.data?.profile) {
                    storage.set(USER_PROFILE_KEY, data.data.profile);
                    setUserProfile(data.data.profile);
                }

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

    const logout = () => {
        // Clear activation but keep device_id
        storage.remove(STORAGE_KEYS.ACTIVATED);
        storage.remove(STORAGE_KEYS.ACTIVATION_PHONE);
        storage.remove(USER_PROFILE_KEY);

        setIsActivated(false);
        setPhoneNumber(null);
        setUserProfile(null);
    };

    return (
        <ActivationContext.Provider
            value={{
                isActivated,
                isLoading,
                phoneNumber,
                deviceId,
                userProfile,
                activate,
                checkActivation,
                logout,
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
