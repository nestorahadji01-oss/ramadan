'use client';

import { useState, useEffect } from 'react';
import AppWrapper from '@/components/AppWrapper';
import { CompactHeader } from '@/components/layout/Header';
import { Scroll, Loader2, RefreshCw, ChevronDown, AlertCircle } from 'lucide-react';
import { getRandomHadiths, HADITH_COLLECTIONS, type HadithItem } from '@/lib/api/islamic';
import { cn } from '@/lib/utils';

interface HadithPair {
    french: HadithItem;
    arabic: HadithItem;
}

export default function HadithPage() {
    const [hadiths, setHadiths] = useState<HadithPair[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCollection, setSelectedCollection] = useState('bukhari');
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [showCollectionPicker, setShowCollectionPicker] = useState(false);

    useEffect(() => {
        loadHadiths();
    }, [selectedCollection]);

    const loadHadiths = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await getRandomHadiths(selectedCollection, 10);
            if (data && data.length > 0) {
                setHadiths(data);
            } else {
                setError('Impossible de charger les hadiths');
            }
        } catch (err) {
            setError('Erreur de connexion');
        } finally {
            setIsLoading(false);
        }
    };

    const currentCollection = HADITH_COLLECTIONS.find(c => c.id === selectedCollection);

    // Hadith of the day (first one loaded)
    const hadithOfDay = hadiths[0];

    return (
        <AppWrapper>
            <div className="min-h-screen bg-background safe-bottom w-full max-w-full overflow-x-hidden">
                <CompactHeader
                    title="Hadiths"
                    subtitle="الأحاديث النبوية"
                    rightElement={
                        <button
                            onClick={loadHadiths}
                            disabled={isLoading}
                            className="p-2 rounded-full hover:bg-muted transition-colors"
                        >
                            <RefreshCw className={cn("w-5 h-5 text-muted-foreground", isLoading && "animate-spin")} />
                        </button>
                    }
                />

                <div className="p-4 space-y-4 w-full max-w-full">
                    {/* Collection Selector */}
                    <div className="relative">
                        <button
                            onClick={() => setShowCollectionPicker(!showCollectionPicker)}
                            className="w-full flex items-center justify-between px-4 py-3 bg-card border border-card-border rounded-xl"
                        >
                            <div className="flex items-center gap-2">
                                <Scroll className="w-5 h-5 text-primary" />
                                <span className="font-medium">{currentCollection?.name || 'Choisir une collection'}</span>
                            </div>
                            <ChevronDown className={cn("w-5 h-5 transition-transform", showCollectionPicker && "rotate-180")} />
                        </button>

                        {showCollectionPicker && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-card-border rounded-xl shadow-lg z-10 overflow-hidden">
                                {HADITH_COLLECTIONS.map((collection) => (
                                    <button
                                        key={collection.id}
                                        onClick={() => {
                                            setSelectedCollection(collection.id);
                                            setShowCollectionPicker(false);
                                        }}
                                        className={cn(
                                            "w-full px-4 py-3 text-left hover:bg-muted transition-colors",
                                            selectedCollection === collection.id && "bg-primary/10 text-primary"
                                        )}
                                    >
                                        {collection.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                            <p className="text-muted-foreground">Chargement des hadiths...</p>
                        </div>
                    )}

                    {/* Error State */}
                    {error && !isLoading && (
                        <div className="card bg-red-500/10 border-red-500/20 text-center py-8">
                            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                            <p className="text-red-500 font-medium mb-2">{error}</p>
                            <button onClick={loadHadiths} className="btn btn-primary">
                                Réessayer
                            </button>
                        </div>
                    )}

                    {/* Hadith of the Day */}
                    {!isLoading && !error && hadithOfDay && (
                        <div className="bg-gradient-to-br from-emerald-700 to-emerald-900 text-white rounded-xl p-4 w-full">
                            <div className="flex items-center gap-2 mb-3">
                                <Scroll className="w-5 h-5 text-gold-400" />
                                <span className="text-sm font-medium">Hadith du jour</span>
                                <span className="text-xs opacity-70 ml-auto">#{hadithOfDay.arabic.hadithnumber}</span>
                            </div>

                            {/* Arabic */}
                            <p className="text-lg font-arabic leading-relaxed mb-3 text-right" dir="rtl">
                                {hadithOfDay.arabic.text.length > 300
                                    ? hadithOfDay.arabic.text.substring(0, 300) + '...'
                                    : hadithOfDay.arabic.text}
                            </p>

                            {/* French */}
                            <p className="text-sm opacity-90 italic">
                                "{hadithOfDay.french.text.length > 300
                                    ? hadithOfDay.french.text.substring(0, 300) + '...'
                                    : hadithOfDay.french.text}"
                            </p>

                            <p className="text-xs opacity-70 mt-3">
                                — {currentCollection?.name}
                            </p>
                        </div>
                    )}

                    {/* Hadiths List */}
                    {!isLoading && !error && hadiths.length > 1 && (
                        <div className="space-y-3 w-full">
                            {hadiths.slice(1).map((pair, index) => {
                                const isExpanded = expandedId === index;
                                const hadithNum = pair.arabic.hadithnumber;

                                return (
                                    <div
                                        key={index}
                                        className="bg-card border border-card-border rounded-xl p-3 w-full"
                                    >
                                        {/* Header */}
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center">
                                                    <span className="text-xs font-bold text-primary">{hadithNum}</span>
                                                </div>
                                                <span className="text-xs text-muted-foreground">{currentCollection?.name}</span>
                                            </div>
                                            {pair.arabic.grades && pair.arabic.grades.length > 0 && (
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
                                                    {pair.arabic.grades[0].grade}
                                                </span>
                                            )}
                                        </div>

                                        {/* Arabic Text */}
                                        <p
                                            className={cn(
                                                "text-base font-arabic leading-relaxed text-foreground text-right mb-2",
                                                !isExpanded && "line-clamp-3"
                                            )}
                                            dir="rtl"
                                        >
                                            {pair.arabic.text}
                                        </p>

                                        {/* French Translation */}
                                        <p className={cn(
                                            "text-sm text-muted-foreground italic",
                                            !isExpanded && "line-clamp-3"
                                        )}>
                                            "{pair.french.text}"
                                        </p>

                                        {/* Expand button */}
                                        {(pair.arabic.text.length > 150 || pair.french.text.length > 150) && (
                                            <button
                                                onClick={() => setExpandedId(isExpanded ? null : index)}
                                                className="text-xs text-primary mt-2 font-medium"
                                            >
                                                {isExpanded ? 'Voir moins' : 'Lire la suite'}
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Load More */}
                    {!isLoading && !error && hadiths.length > 0 && (
                        <button
                            onClick={loadHadiths}
                            className="w-full py-3 text-center text-primary font-medium"
                        >
                            Charger d'autres hadiths
                        </button>
                    )}

                    {/* Info */}
                    <div className="text-center text-xs text-muted-foreground pt-4">
                        <p>📚 Source: fawazahmed0/hadith-api</p>
                    </div>
                </div>
            </div>
        </AppWrapper>
    );
}
