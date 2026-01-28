'use client';

import { useRadio } from '@/contexts/RadioContext';
import { useActivation } from '@/contexts/ActivationContext';
import { Radio, Play, Pause, X } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Draggable vertical mini radio player
 * Can be moved anywhere on screen, starts in the middle-right
 * Hidden when user is not activated
 */
export default function MiniRadioPlayer() {
    const { isPlaying, isLoading, togglePlay, stop } = useRadio();
    const { isActivated, isLoading: activationLoading } = useActivation();

    const [isVisible, setIsVisible] = useState(true);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [initialized, setInitialized] = useState(false);
    const dragRef = useRef<HTMLDivElement>(null);
    const dragStartPos = useRef({ x: 0, y: 0 });
    const elementStartPos = useRef({ x: 0, y: 0 });

    // Initialize position in the middle of the screen (right side)
    useEffect(() => {
        if (typeof window !== 'undefined' && !initialized) {
            const savedPos = localStorage.getItem('radio_player_position');
            if (savedPos) {
                try {
                    setPosition(JSON.parse(savedPos));
                } catch {
                    // Default to middle-right
                    setPosition({
                        x: window.innerWidth - 80,
                        y: window.innerHeight / 2 - 100,
                    });
                }
            } else {
                setPosition({
                    x: window.innerWidth - 80,
                    y: window.innerHeight / 2 - 100,
                });
            }
            setInitialized(true);
        }
    }, [initialized]);

    // Save position when it changes
    useEffect(() => {
        if (initialized && position.x > 0) {
            localStorage.setItem('radio_player_position', JSON.stringify(position));
        }
    }, [position, initialized]);

    // Handle drag start
    const handleDragStart = useCallback((clientX: number, clientY: number) => {
        setIsDragging(true);
        dragStartPos.current = { x: clientX, y: clientY };
        elementStartPos.current = { x: position.x, y: position.y };
    }, [position]);

    // Handle drag move
    const handleDragMove = useCallback((clientX: number, clientY: number) => {
        if (!isDragging) return;

        const deltaX = clientX - dragStartPos.current.x;
        const deltaY = clientY - dragStartPos.current.y;

        let newX = elementStartPos.current.x + deltaX;
        let newY = elementStartPos.current.y + deltaY;

        // Keep within bounds
        const playerWidth = 70;
        const playerHeight = 150;

        newX = Math.max(10, Math.min(window.innerWidth - playerWidth - 10, newX));
        newY = Math.max(60, Math.min(window.innerHeight - playerHeight - 80, newY));

        setPosition({ x: newX, y: newY });
    }, [isDragging]);

    // Handle drag end
    const handleDragEnd = useCallback(() => {
        setIsDragging(false);
    }, []);

    // Mouse events
    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        handleDragStart(e.clientX, e.clientY);
    };

    // Touch events
    const handleTouchStart = (e: React.TouchEvent) => {
        const touch = e.touches[0];
        handleDragStart(touch.clientX, touch.clientY);
    };

    // Global event listeners for drag
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            handleDragMove(e.clientX, e.clientY);
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches[0]) {
                handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
            }
        };

        const handleMouseUp = () => handleDragEnd();
        const handleTouchEnd = () => handleDragEnd();

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('touchmove', handleTouchMove, { passive: true });
            window.addEventListener('touchend', handleTouchEnd);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isDragging, handleDragMove, handleDragEnd]);

    // Show if playing, loading, or was recently playing
    const shouldShow = isPlaying || isLoading || isVisible;

    // When radio starts, make visible
    useEffect(() => {
        if (isPlaying || isLoading) {
            setIsVisible(true);
        }
    }, [isPlaying, isLoading]);

    // Hide if not initialized or not visible
    if (!initialized || (!shouldShow && !isPlaying && !isLoading)) {
        return null;
    }

    // Don't show on activation screen
    if (!isActivated && !activationLoading) {
        return null;
    }

    // Don't show if closed and not playing
    if (!isVisible && !isPlaying && !isLoading) {
        return null;
    }

    const handleClose = () => {
        stop();
        setIsVisible(false);
    };

    return (
        <div
            ref={dragRef}
            className={`fixed z-50 touch-none select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            style={{
                left: position.x,
                top: position.y,
                transition: isDragging ? 'none' : 'box-shadow 0.2s',
            }}
        >
            {/* Drag handle area */}
            <div
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                className="bg-emerald-700 text-white rounded-2xl shadow-2xl flex flex-col items-center py-3 px-2 gap-2"
                style={{
                    boxShadow: isDragging
                        ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                        : '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                }}
            >
                {/* Drag indicator */}
                <div className="w-8 h-1 bg-white/40 rounded-full mb-1" />

                {/* Radio Icon */}
                <div className={`w-10 h-10 bg-white/20 rounded-full flex items-center justify-center ${isPlaying ? 'animate-pulse' : ''}`}>
                    <Radio className="w-5 h-5" />
                </div>

                {/* Play/Pause Button */}
                <button
                    onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                    disabled={isLoading}
                    className="w-12 h-12 bg-white text-emerald-700 rounded-full flex items-center justify-center shadow-lg disabled:opacity-50 active:scale-95 transition-transform"
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
                    onClick={(e) => { e.stopPropagation(); handleClose(); }}
                    className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center active:bg-white/30"
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Status label */}
                <div className="text-[10px] text-white/80 font-medium">
                    {isLoading ? '...' : isPlaying ? '📻' : '⏸️'}
                </div>
            </div>
        </div>
    );
}
