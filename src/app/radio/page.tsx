'use client';

import { useState, useEffect, useRef } from 'react';
import AppWrapper from '@/components/AppWrapper';
import { CompactHeader } from '@/components/layout/Header';
import { Radio, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';

// Single working station - Maher Al Muaiqly
const STATION = {
    name: 'Maher Al Muaiqly',
    reciter: 'ماهر المعيقلي',
    url: 'https://qurango.net/radio/maher',
    description: 'Récitation complète du Saint Coran',
};

export default function RadioPage() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    const togglePlay = async () => {
        if (isPlaying) {
            audioRef.current?.pause();
            setIsPlaying(false);
            return;
        }

        if (audioRef.current) {
            audioRef.current.play().catch(console.error);
            return;
        }

        setIsLoading(true);

        const audio = new Audio();
        audio.volume = isMuted ? 0 : 1;

        audio.addEventListener('canplay', () => {
            setIsLoading(false);
            audio.play().catch(err => {
                console.error('Play failed:', err);
                setIsLoading(false);
            });
        });

        audio.addEventListener('playing', () => {
            setIsPlaying(true);
            setIsLoading(false);
        });

        audio.addEventListener('pause', () => {
            setIsPlaying(false);
        });

        audio.addEventListener('error', () => {
            setIsLoading(false);
        });

        audio.src = STATION.url;
        audio.load();
        audioRef.current = audio;
    };

    const toggleMute = () => {
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 1 : 0;
        }
        setIsMuted(!isMuted);
    };

    return (
        <AppWrapper>
            <div className="min-h-screen bg-background safe-bottom w-full max-w-full overflow-x-hidden flex flex-col">
                <CompactHeader title="Radio Coran" subtitle="إذاعة القرآن الكريم" />

                <div className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-full">
                    {/* Main Player Card */}
                    <div className="w-full max-w-sm bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-900 rounded-3xl p-6 text-white text-center shadow-xl">
                        {/* Station Icon */}
                        <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                            <Radio className={cn("w-12 h-12", isPlaying && "animate-pulse")} />
                        </div>

                        {/* Station Info */}
                        <h2 className="text-xl font-bold mb-1">{STATION.name}</h2>
                        <p className="text-lg font-arabic mb-2">{STATION.reciter}</p>
                        <p className="text-sm opacity-70 mb-6">{STATION.description}</p>

                        {/* Play/Pause Button */}
                        <button
                            onClick={togglePlay}
                            disabled={isLoading}
                            className="w-20 h-20 bg-white text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg hover:scale-105 transition-transform disabled:opacity-50"
                        >
                            {isLoading ? (
                                <div className="w-8 h-8 border-4 border-emerald-700 border-t-transparent rounded-full animate-spin" />
                            ) : isPlaying ? (
                                <Pause className="w-10 h-10" />
                            ) : (
                                <Play className="w-10 h-10 ml-1" />
                            )}
                        </button>

                        {/* Status */}
                        <p className="text-sm opacity-80 mb-4">
                            {isLoading ? 'Connexion...' : isPlaying ? '🔊 En lecture' : 'Appuyez pour écouter'}
                        </p>

                        {/* Mute Button */}
                        {isPlaying && (
                            <button
                                onClick={toggleMute}
                                className="flex items-center gap-2 mx-auto px-4 py-2 bg-white/10 rounded-full text-sm"
                            >
                                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                                <span>{isMuted ? 'Rétablir le son' : 'Couper le son'}</span>
                            </button>
                        )}
                    </div>

                    {/* Info */}
                    <div className="mt-6 text-center">
                        <p className="text-xs text-muted-foreground">
                            📻 Diffusion continue 24h/24
                        </p>
                    </div>
                </div>
            </div>
        </AppWrapper>
    );
}
