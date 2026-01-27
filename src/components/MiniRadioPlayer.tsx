'use client';

import { useRadio } from '@/contexts/RadioContext';
import { Radio, Play, Pause, X } from 'lucide-react';
import { useState } from 'react';

/**
 * Vertical mini radio player on the right side of the screen
 * Stays visible when paused so user can resume
 */
export default function MiniRadioPlayer() {
    const { isPlaying, isLoading, stationName, togglePlay, stop } = useRadio();
    const [isVisible, setIsVisible] = useState(true);

    // Show if playing OR loading, or if visible and was previously playing
    const shouldShow = (isPlaying || isLoading) || (!isPlaying && isVisible);

    // Only render if there's been radio activity
    if (!shouldShow && !isPlaying && !isLoading) {
        return null;
    }

    // Close the mini player (and stop if playing)
    const handleClose = () => {
        stop();
        setIsVisible(false);
    };

    // When radio starts, make sure player is visible
    if ((isPlaying || isLoading) && !isVisible) {
        setIsVisible(true);
    }

    // Don't render if completely hidden and not playing
    if (!isVisible && !isPlaying && !isLoading) {
        return null;
    }

    return (
        <div className="fixed right-3 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-40 flex flex-col items-center gap-2">
            {/* Main pill-shaped player */}
            <div className="bg-emerald-700 text-white rounded-full shadow-xl flex flex-col items-center py-3 px-2 gap-2">
                {/* Radio Icon with status */}
                <div className={`w-10 h-10 bg-white/20 rounded-full flex items-center justify-center ${isPlaying ? 'animate-pulse' : ''}`}>
                    <Radio className="w-5 h-5" />
                </div>

                {/* Play/Pause Button */}
                <button
                    onClick={togglePlay}
                    disabled={isLoading}
                    className="w-12 h-12 bg-white text-emerald-700 rounded-full flex items-center justify-center shadow-lg disabled:opacity-50"
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin" />
                    ) : isPlaying ? (
                        <Pause className="w-6 h-6" />
                    ) : (
                        <Play className="w-6 h-6 ml-0.5" />
                    )}
                </button>

                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Status indicator */}
            <div className="bg-black/70 text-white text-[10px] px-2 py-1 rounded-full">
                {isLoading ? 'Connexion...' : isPlaying ? '🔊 En lecture' : '⏸️ Pause'}
            </div>
        </div>
    );
}
