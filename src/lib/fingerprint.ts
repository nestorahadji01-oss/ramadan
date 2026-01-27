import FingerprintJS from '@fingerprintjs/fingerprintjs';

let cachedFingerprint: string | null = null;

/**
 * Get a stable device fingerprint using FingerprintJS
 * This fingerprint remains the same even if localStorage is cleared
 */
export async function getDeviceFingerprint(): Promise<string> {
    // Return cached value if available
    if (cachedFingerprint) {
        return cachedFingerprint;
    }

    try {
        // Load the FingerprintJS agent
        const fp = await FingerprintJS.load();

        // Get the visitor identifier
        const result = await fp.get();

        // The visitorId is a stable fingerprint
        cachedFingerprint = result.visitorId;

        return cachedFingerprint;
    } catch (error) {
        console.error('Fingerprint error:', error);

        // Fallback: generate a random ID and store it
        // This is less reliable but better than nothing
        const fallbackId = `fallback_${Date.now()}_${Math.random().toString(36).substring(2)}`;
        cachedFingerprint = fallbackId;

        return fallbackId;
    }
}

/**
 * Check if this device is already activated on the server
 */
export async function checkDeviceActivation(fingerprint: string): Promise<{
    activated: boolean;
    phone?: string;
    profile?: {
        phone: string;
        name: string | null;
        firstName: string | null;
        email: string | null;
    };
}> {
    try {
        const response = await fetch(`/api/check-device?fingerprint=${encodeURIComponent(fingerprint)}`);
        const data = await response.json();

        if (data.activated) {
            return {
                activated: true,
                phone: data.phone,
                profile: data.profile,
            };
        }

        return { activated: false };
    } catch (error) {
        console.error('Check device error:', error);
        return { activated: false };
    }
}
