'use client';

import { createContext, useContext, useState, useRef, useEffect, ReactNode, useCallback } from 'react';

interface RadioContextType {
    isPlaying: boolean;
    isLoading: boolean;
    isMuted: boolean;
    stationName: string;
    togglePlay: () => void;
    toggleMute: () => void;
    stop: () => void;
}

const RadioContext = createContext<RadioContextType | undefined>(undefined);

// Single station - Maher Al Muaiqly
const STATION = {
    name: 'Maher Al Muaiqly',
    url: 'https://qurango.net/radio/maher',
};

export function RadioProvider({ children }: { children: ReactNode }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Initialize audio element once
    useEffect(() => {
        const audio = new Audio();
        audio.preload = 'none';

        audio.addEventListener('playing', () => {
            setIsPlaying(true);
            setIsLoading(false);
        });

        audio.addEventListener('pause', () => {
            setIsPlaying(false);
        });

        audio.addEventListener('waiting', () => {
            setIsLoading(true);
        });

        audio.addEventListener('canplay', () => {
            setIsLoading(false);
        });

        audio.addEventListener('error', () => {
            setIsLoading(false);
            setIsPlaying(false);
        });

        audioRef.current = audio;

        return () => {
            audio.pause();
            audio.src = '';
        };
    }, []);

    const togglePlay = useCallback(async () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
            return;
        }

        setIsLoading(true);

        // If we haven't loaded the source yet
        if (!audio.src || audio.src === '') {
            audio.src = STATION.url;
            audio.load();
        }

        try {
            await audio.play();
        } catch (error) {
            console.error('Radio play error:', error);
            setIsLoading(false);
        }
    }, [isPlaying]);

    const toggleMute = useCallback(() => {
        const audio = audioRef.current;
        if (audio) {
            audio.muted = !isMuted;
        }
        setIsMuted(!isMuted);
    }, [isMuted]);

    const stop = useCallback(() => {
        const audio = audioRef.current;
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
        }
        setIsPlaying(false);
    }, []);

    return (
        <RadioContext.Provider
            value={{
                isPlaying,
                isLoading,
                isMuted,
                stationName: STATION.name,
                togglePlay,
                toggleMute,
                stop,
            }}
        >
            {children}
        </RadioContext.Provider>
    );
}

export function useRadio() {
    const context = useContext(RadioContext);
    if (context === undefined) {
        throw new Error('useRadio must be used within a RadioProvider');
    }
    return context;
}
