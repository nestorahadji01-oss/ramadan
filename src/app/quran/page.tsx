'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AppWrapper from '@/components/AppWrapper';
import { CompactHeader } from '@/components/layout/Header';
import { Search, BookOpen, ChevronRight, Play } from 'lucide-react';
import { getAllSurahs, type Surah } from '@/lib/api/islamic';
import { cn } from '@/lib/utils';

export default function QuranPage() {
    const [surahs, setSurahs] = useState<Surah[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'all' | 'meccan' | 'medinan'>('all');

    useEffect(() => {
        loadSurahs();
    }, []);

    const loadSurahs = async () => {
        setIsLoading(true);
        try {
            const data = await getAllSurahs();
            if (data) {
                setSurahs(data);
            }
        } catch (error) {
            console.error('Failed to load surahs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredSurahs = surahs.filter((surah) => {
        const matchesSearch =
            surah.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            surah.name.includes(searchQuery) ||
            surah.number.toString() === searchQuery;

        const matchesFilter =
            filter === 'all' ||
            (filter === 'meccan' && surah.revelationType === 'Meccan') ||
            (filter === 'medinan' && surah.revelationType === 'Medinan');

        return matchesSearch && matchesFilter;
    });

    return (
        <AppWrapper>
            <div className="min-h-screen bg-background safe-bottom">
                <CompactHeader
                    title="Le Saint Coran"
                    subtitle="القرآن الكريم"
                />

                <div className="p-4 space-y-4">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Rechercher une sourate..."
                            className="input pl-12"
                        />
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-2">
                        {[
                            { value: 'all', label: 'Toutes' },
                            { value: 'meccan', label: 'Mecquoises' },
                            { value: 'medinan', label: 'Médinoises' },
                        ].map((tab) => (
                            <button
                                key={tab.value}
                                onClick={() => setFilter(tab.value as typeof filter)}
                                className={cn(
                                    "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                                    filter === tab.value
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-muted-foreground"
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Loading State */}
                    {isLoading && (
                        <div className="space-y-2">
                            {[...Array(10)].map((_, i) => (
                                <div key={i} className="card animate-pulse flex items-center gap-4">
                                    <div className="w-12 h-12 bg-muted rounded-xl" />
                                    <div className="flex-1">
                                        <div className="h-5 w-32 bg-muted rounded mb-2" />
                                        <div className="h-4 w-24 bg-muted rounded" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Surah List */}
                    {!isLoading && (
                        <div className="space-y-2">
                            {filteredSurahs.map((surah) => (
                                <Link
                                    key={surah.number}
                                    href={`/quran/${surah.number}`}
                                    className="card flex items-center gap-4 group"
                                >
                                    {/* Surah Number */}
                                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                                        <span className="text-lg font-bold text-primary">{surah.number}</span>
                                    </div>

                                    {/* Surah Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-foreground truncate">
                                                {surah.englishName}
                                            </h3>
                                            <span className={cn(
                                                "text-xs px-2 py-0.5 rounded-full",
                                                surah.revelationType === 'Meccan'
                                                    ? "bg-amber-500/10 text-amber-600"
                                                    : "bg-emerald-500/10 text-emerald-600"
                                            )}>
                                                {surah.revelationType === 'Meccan' ? 'Mecque' : 'Médine'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {surah.englishNameTranslation} • {surah.numberOfAyahs} versets
                                        </p>
                                    </div>

                                    {/* Arabic Name */}
                                    <div className="text-right">
                                        <p className="text-xl font-arabic text-primary" dir="rtl">
                                            {surah.name}
                                        </p>
                                    </div>

                                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Empty State */}
                    {!isLoading && filteredSurahs.length === 0 && (
                        <div className="text-center py-12">
                            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">Aucune sourate trouvée</p>
                        </div>
                    )}
                </div>
            </div>
        </AppWrapper>
    );
}
