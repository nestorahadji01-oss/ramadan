'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { storage, STORAGE_KEYS } from '@/lib/utils';
import { type UserProfile } from '@/lib/supabase';
import { getDeviceFingerprint, checkDeviceActivation } from '@/lib/fingerprint';

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

// Storage keys
const USER_PROFILE_KEY = 'ramadan_user_profile';

export function ActivationProvider({ children }: { children: ReactNode }) {
    const [isActivated, setIsActivated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
    const [deviceId, setDeviceId] = useState<string | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

    // DEV MODE: Set to false for production
    const DEV_BYPASS = false;

    // Check activation on mount
    useEffect(() => {
        initializeAndCheck();
    }, []);

    /**
     * Initialize device fingerprint and check activation status
     * This uses browser fingerprinting which persists even without localStorage
     */
    const initializeAndCheck = async () => {
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

        try {
            // Get stable device fingerprint (persists even without localStorage)
            const fingerprint = await getDeviceFingerprint();
            setDeviceId(fingerprint);

            // First check localStorage (fast path)
            const localActivated = storage.get<boolean>(STORAGE_KEYS.ACTIVATED, false);
            const localPhone = storage.get<string | null>(STORAGE_KEYS.ACTIVATION_PHONE, null);
            const localProfile = storage.get<UserProfile | null>(USER_PROFILE_KEY, null);

            if (localActivated && localPhone) {
                // Already activated locally
                setIsActivated(true);
                setPhoneNumber(localPhone);
                setUserProfile(localProfile);
                setIsLoading(false);
                return;
            }

            // Check server for device activation (handles cleared cache)
            const serverCheck = await checkDeviceActivation(fingerprint);

            if (serverCheck.activated && serverCheck.phone) {
                // Device was previously activated! Restore session
                setIsActivated(true);
                setPhoneNumber(serverCheck.phone);
                setUserProfile(serverCheck.profile || null);

                // Restore to localStorage for faster future checks
                storage.set(STORAGE_KEYS.ACTIVATED, true);
                storage.set(STORAGE_KEYS.ACTIVATION_PHONE, serverCheck.phone);
                if (serverCheck.profile) {
                    storage.set(USER_PROFILE_KEY, serverCheck.profile);
                }
            }
        } catch (error) {
            console.error('Activation check error:', error);
        }

        setIsLoading(false);
    };

    const checkActivation = () => {
        initializeAndCheck();
    };

    const activate = async (phone: string): Promise<{ success: boolean; error?: string }> => {
        try {
            // Ensure we have a device fingerprint
            let currentDeviceId = deviceId;
            if (!currentDeviceId) {
                currentDeviceId = await getDeviceFingerprint();
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
        // Clear activation but keep device_id (it's a fingerprint, not stored)
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
