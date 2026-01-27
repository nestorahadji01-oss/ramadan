'use client';

import { useRadio } from '@/contexts/RadioContext';
import { Radio, Pause, X } from 'lucide-react';

/**
 * Mini radio player that appears at the bottom of the screen when radio is playing
 * Allows pause/stop without navigating to the radio page
 */
export default function MiniRadioPlayer() {
    const { isPlaying, isLoading, stationName, togglePlay, stop } = useRadio();

    // Only show when playing or loading
    if (!isPlaying && !isLoading) {
        return null;
    }

    return (
        <div className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] left-4 right-4 z-40">
            <div className="bg-emerald-700 text-white rounded-2xl shadow-xl p-3 flex items-center gap-3">
                {/* Radio Icon */}
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Radio className={`w-5 h-5 ${isPlaying ? 'animate-pulse' : ''}`} />
                </div>

                {/* Station Info */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{stationName}</p>
                    <p className="text-xs opacity-70">
                        {isLoading ? 'Connexion...' : 'En lecture'}
                    </p>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={togglePlay}
                        disabled={isLoading}
                        className="w-10 h-10 bg-white text-emerald-700 rounded-full flex items-center justify-center disabled:opacity-50"
                    >
                        {isLoading ? (
                            <div className="w-4 h-4 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Pause className="w-5 h-5" />
                        )}
                    </button>
                    <button
                        onClick={stop}
                        className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
