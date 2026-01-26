'use client';

import { useActivation } from '@/contexts/ActivationContext';
import ActivationScreen from '@/components/ActivationScreen';
import { MobileNav, Sidebar } from '@/components/layout/Navigation';
import { Loader2 } from 'lucide-react';

interface AppWrapperProps {
    children: React.ReactNode;
}

/**
 * Main app wrapper that:
 * 1. Shows loading state while checking activation
 * 2. Shows activation screen if not activated
 * 3. Shows main app with navigation if activated
 */
export default function AppWrapper({ children }: AppWrapperProps) {
    const { isActivated, isLoading } = useActivation();

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Chargement...</p>
                </div>
            </div>
        );
    }

    // Not activated - show activation screen
    if (!isActivated) {
        return <ActivationScreen />;
    }

    // Activated - show main app
    return (
        <div className="flex min-h-screen bg-background w-full max-w-full overflow-x-hidden">
            {/* Desktop Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <main className="flex-1 min-h-screen lg:ml-0 w-full max-w-full overflow-x-hidden">
                {children}
            </main>

            {/* Mobile Bottom Navigation */}
            <MobileNav />
        </div>
    );
}
