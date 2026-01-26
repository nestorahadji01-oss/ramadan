'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import AppWrapper from '@/components/AppWrapper';
import { CompactHeader } from '@/components/layout/Header';
import { BookOpen, ChevronLeft, ChevronRight, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { getSurahTafsir, type TafsirAyah } from '@/lib/api/islamic';
import { cn } from '@/lib/utils';

// Surah names for display
const surahNames: Record<number, { arabic: string; french: string }> = {
    1: { arabic: 'الفاتحة', french: 'Al-Fatiha' },
    2: { arabic: 'البقرة', french: 'Al-Baqara' },
    3: { arabic: 'آل عمران', french: 'Al-Imran' },
    4: { arabic: 'النساء', french: 'An-Nisa' },
    5: { arabic: 'المائدة', french: 'Al-Ma\'idah' },
    36: { arabic: 'يس', french: 'Ya-Sin' },
    67: { arabic: 'الملك', french: 'Al-Mulk' },
    112: { arabic: 'الإخلاص', french: 'Al-Ikhlas' },
    113: { arabic: 'الفلق', french: 'Al-Falaq' },
    114: { arabic: 'الناس', french: 'An-Nas' },
};

function TafsirContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const surahParam = parseInt(searchParams.get('surah') || '1');
    const ayahParam = parseInt(searchParams.get('ayah') || '1');

    const [surahNumber, setSurahNumber] = useState(surahParam);
    const [tafsirData, setTafsirData] = useState<TafsirAyah[] | null>(null);
    const [currentAyahIndex, setCurrentAyahIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load tafsir when surah changes
    useEffect(() => {
        loadTafsir();
    }, [surahNumber]);

    // Set initial ayah when data loads
    useEffect(() => {
        if (tafsirData && ayahParam) {
            const index = tafsirData.findIndex(a => a.aya === ayahParam);
            if (index >= 0) setCurrentAyahIndex(index);
        }
    }, [tafsirData, ayahParam]);

    const loadTafsir = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await getSurahTafsir(surahNumber);
            if (data && data.length > 0) {
                setTafsirData(data);
                setCurrentAyahIndex(0);
            } else {
                setError('Tafsir non disponible pour cette sourate');
            }
        } catch (err) {
            setError('Erreur de chargement');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrevAyah = () => {
        if (currentAyahIndex > 0) setCurrentAyahIndex(currentAyahIndex - 1);
    };

    const handleNextAyah = () => {
        if (tafsirData && currentAyahIndex < tafsirData.length - 1) {
            setCurrentAyahIndex(currentAyahIndex + 1);
        }
    };

    const handleBack = () => {
        router.push(`/quran/${surahNumber}`);
    };

    const currentAyah = tafsirData?.[currentAyahIndex];
    const surahInfo = surahNames[surahNumber] || { arabic: `سورة ${surahNumber}`, french: `Sourate ${surahNumber}` };

    return (
        <div className="p-4 space-y-4 w-full max-w-full">
            {/* Back Button */}
            <button
                onClick={handleBack}
                className="flex items-center gap-2 text-primary text-sm font-medium hover:underline"
            >
                <ArrowLeft className="w-4 h-4" />
                Retour à la lecture
            </button>

            {/* Surah Info */}
            <div className="text-center">
                <h2 className="text-xl font-bold text-foreground">{surahInfo.french}</h2>
                <p className="text-lg font-arabic text-muted-foreground">{surahInfo.arabic}</p>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                    <p className="text-muted-foreground">Chargement du tafsir...</p>
                </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
                <div className="card bg-red-500/10 border-red-500/20 text-center py-8">
                    <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                    <p className="text-red-500 font-medium mb-2">{error}</p>
                    <button onClick={loadTafsir} className="btn btn-primary">
                        Réessayer
                    </button>
                </div>
            )}

            {/* Tafsir Content */}
            {!isLoading && !error && currentAyah && (
                <>
                    {/* Ayah Navigation */}
                    <div className="flex items-center justify-between">
                        <button
                            onClick={handlePrevAyah}
                            disabled={currentAyahIndex === 0}
                            className="p-2 rounded-full bg-muted disabled:opacity-30"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        <span className="text-sm text-muted-foreground">
                            Verset {currentAyah.aya} / {tafsirData?.length}
                        </span>

                        <button
                            onClick={handleNextAyah}
                            disabled={!tafsirData || currentAyahIndex >= tafsirData.length - 1}
                            className="p-2 rounded-full bg-muted disabled:opacity-30"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Arabic Verse */}
                    <div className="card bg-gradient-to-br from-emerald-700 to-emerald-900 text-white">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                <span className="text-sm font-bold">{currentAyah.aya}</span>
                            </div>
                            <span className="text-sm opacity-80">{surahInfo.french}</span>
                        </div>
                        <p className="text-xl font-arabic leading-loose text-center" dir="rtl">
                            {currentAyah.arabic_text}
                        </p>
                    </div>

                    {/* Tafsir/Translation Content */}
                    <div className="card">
                        <div className="flex items-center gap-2 mb-3">
                            <BookOpen className="w-5 h-5 text-primary" />
                            <span className="font-semibold text-foreground">Explication</span>
                        </div>
                        <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                            {currentAyah.translation}
                        </p>
                        {currentAyah.footnotes && (
                            <div className="mt-4 pt-4 border-t border-card-border">
                                <p className="text-xs text-muted-foreground italic">
                                    {currentAyah.footnotes}
                                </p>
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-4">
                            Source: QuranEnc - Tafsir Muyassar
                        </p>
                    </div>

                    {/* Quick Navigation Dots */}
                    {tafsirData && tafsirData.length <= 20 && (
                        <div className="flex justify-center gap-1.5 pt-2 flex-wrap">
                            {tafsirData.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentAyahIndex(index)}
                                    className={cn(
                                        "w-2 h-2 rounded-full transition-colors",
                                        currentAyahIndex === index ? "bg-primary" : "bg-muted"
                                    )}
                                />
                            ))}
                        </div>
                    )}

                    {/* Ayah Selector for long surahs */}
                    {tafsirData && tafsirData.length > 20 && (
                        <div className="flex items-center justify-center gap-2">
                            <span className="text-sm text-muted-foreground">Aller au verset:</span>
                            <select
                                value={currentAyahIndex}
                                onChange={(e) => setCurrentAyahIndex(parseInt(e.target.value))}
                                className="px-3 py-1 bg-muted rounded-lg text-sm"
                            >
                                {tafsirData.map((ayah, index) => (
                                    <option key={index} value={index}>
                                        {ayah.aya}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default function TafsirPage() {
    return (
        <AppWrapper>
            <div className="min-h-screen bg-background safe-bottom w-full max-w-full overflow-x-hidden">
                <CompactHeader
                    title="Tafsir"
                    subtitle="Exégèse du Coran"
                />

                <Suspense fallback={
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                }>
                    <TafsirContent />
                </Suspense>
            </div>
        </AppWrapper>
    );
}
