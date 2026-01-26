'use client';

import { useState, useEffect, use } from 'react';
import AppWrapper from '@/components/AppWrapper';
import { CompactHeader } from '@/components/layout/Header';
import { ArrowLeft, Play, Pause, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { getSurah, getChapterAudio, type SurahDetail } from '@/lib/api/islamic';
import { cn } from '@/lib/utils';

interface SurahPageProps {
    params: Promise<{ surah: string }>;
}

export default function SurahPage({ params }: SurahPageProps) {
    const resolvedParams = use(params);
    const surahNumber = parseInt(resolvedParams.surah);

    const [surah, setSurah] = useState<SurahDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [showTafsir, setShowTafsir] = useState<number | null>(null);
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

    useEffect(() => {
        loadSurah();
        loadAudio();

        return () => {
            if (audio) {
                audio.pause();
            }
        };
    }, [surahNumber]);

    const loadSurah = async () => {
        setIsLoading(true);
        try {
            const data = await getSurah(surahNumber);
            if (data) {
                setSurah(data);
            }
        } catch (error) {
            console.error('Failed to load surah:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadAudio = async () => {
        try {
            // Using Abdul Basit (reciter id 1) as default
            const audioData = await getChapterAudio(1, surahNumber);
            if (audioData) {
                setAudioUrl(audioData.audio_url);
            }
        } catch (error) {
            console.error('Failed to load audio:', error);
        }
    };

    const toggleAudio = () => {
        if (!audioUrl) return;

        if (audio) {
            if (isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
            setIsPlaying(!isPlaying);
        } else {
            const newAudio = new Audio(audioUrl);
            newAudio.play();
            newAudio.onended = () => setIsPlaying(false);
            setAudio(newAudio);
            setIsPlaying(true);
        }
    };

    return (
        <AppWrapper>
            <div className="min-h-screen bg-background safe-bottom">
                <CompactHeader
                    title={surah?.englishName || `Sourate ${surahNumber}`}
                    subtitle={surah?.name}
                    rightElement={
                        <Link href="/quran" className="p-2 rounded-full hover:bg-muted transition-colors">
                            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                        </Link>
                    }
                />

                {/* Loading State */}
                {isLoading && (
                    <div className="p-4 space-y-4">
                        <div className="card animate-pulse h-32" />
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="card animate-pulse h-24" />
                        ))}
                    </div>
                )}

                {surah && (
                    <div className="p-4 space-y-4">
                        {/* Surah Header Card */}
                        <div className="card bg-gradient-to-br from-emerald-800 to-emerald-900 text-white">
                            <div className="text-center">
                                <h1 className="text-3xl font-arabic mb-2" dir="rtl">{surah.name}</h1>
                                <p className="text-lg opacity-90">{surah.englishName}</p>
                                <p className="text-sm opacity-70">{surah.englishNameTranslation}</p>
                                <div className="flex items-center justify-center gap-4 mt-4 text-sm opacity-80">
                                    <span>{surah.revelationType === 'Meccan' ? 'Mecquoise' : 'Médinoise'}</span>
                                    <span>•</span>
                                    <span>{surah.numberOfAyahs} versets</span>
                                </div>

                                {/* Audio Player */}
                                {audioUrl && (
                                    <button
                                        onClick={toggleAudio}
                                        className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                                    >
                                        {isPlaying ? (
                                            <>
                                                <Pause className="w-5 h-5" />
                                                Pause
                                            </>
                                        ) : (
                                            <>
                                                <Play className="w-5 h-5" />
                                                Écouter
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Bismillah (except for Surah 9) */}
                        {surahNumber !== 9 && surahNumber !== 1 && (
                            <div className="text-center py-4">
                                <p className="text-2xl font-arabic text-primary" dir="rtl">
                                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                                </p>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Au nom d&apos;Allah, le Tout Miséricordieux, le Très Miséricordieux
                                </p>
                            </div>
                        )}

                        {/* Ayahs */}
                        <div className="space-y-3">
                            {surah.ayahs.map((ayah) => (
                                <div key={ayah.number} className="card">
                                    {/* Ayah Number Badge */}
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                            <span className="text-sm font-bold text-primary">{ayah.numberInSurah}</span>
                                        </div>
                                        <div className="flex-1 text-right">
                                            <p className="text-2xl font-arabic leading-loose text-foreground" dir="rtl">
                                                {ayah.text}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Metadata */}
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground border-t border-card-border pt-3 mt-3">
                                        <span>Juz {ayah.juz}</span>
                                        <span>Page {ayah.page}</span>
                                        <Link
                                            href={`/tafsir?surah=${surahNumber}&ayah=${ayah.numberInSurah}`}
                                            className="ml-auto flex items-center gap-1 text-primary hover:underline"
                                        >
                                            <BookOpen className="w-4 h-4" />
                                            Voir le Tafsir
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Navigation */}
                        <div className="flex items-center justify-between pt-4">
                            {surahNumber > 1 && (
                                <Link
                                    href={`/quran/${surahNumber - 1}`}
                                    className="btn btn-ghost"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Sourate précédente
                                </Link>
                            )}
                            {surahNumber < 114 && (
                                <Link
                                    href={`/quran/${surahNumber + 1}`}
                                    className="btn btn-primary ml-auto"
                                >
                                    Sourate suivante
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AppWrapper>
    );
}
