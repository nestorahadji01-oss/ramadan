'use client';

import { useState, useEffect } from 'react';
import AppWrapper from '@/components/AppWrapper';
import { CompactHeader } from '@/components/layout/Header';
import { MapPin, RefreshCw, Calendar, Sun, Sunrise, Sunset, Moon } from 'lucide-react';
import { getPrayerTimesByCity, type PrayerTimesResponse } from '@/lib/api/islamic';
import { cn, getTimeUntil, formatCountdown, storage, STORAGE_KEYS } from '@/lib/utils';

interface LocationData {
    city: string;
    country: string;
    lat: number;
    lng: number;
}

// Prayer icons and colors
const prayerInfo: Record<string, { icon: React.ReactNode; color: string; frenchName: string }> = {
    Fajr: { icon: <Moon className="w-5 h-5" />, color: 'bg-indigo-500', frenchName: 'Fajr' },
    Sunrise: { icon: <Sunrise className="w-5 h-5" />, color: 'bg-amber-400', frenchName: 'Lever du soleil' },
    Dhuhr: { icon: <Sun className="w-5 h-5" />, color: 'bg-yellow-500', frenchName: 'Dhuhr' },
    Asr: { icon: <Sun className="w-5 h-5" />, color: 'bg-orange-500', frenchName: 'Asr' },
    Maghrib: { icon: <Sunset className="w-5 h-5" />, color: 'bg-pink-500', frenchName: 'Maghrib' },
    Isha: { icon: <Moon className="w-5 h-5" />, color: 'bg-purple-600', frenchName: 'Isha' },
};

const prayers = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;

export default function PrayerTimesPage() {
    const [prayerData, setPrayerData] = useState<PrayerTimesResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [nextPrayer, setNextPrayer] = useState<string | null>(null);
    const [countdown, setCountdown] = useState<string>('');
    const [location, setLocation] = useState<LocationData>({
        city: 'Dakar',
        country: 'Senegal',
        lat: 14.6928,
        lng: -17.4467,
    });

    // Load saved location on mount
    useEffect(() => {
        const savedLocation = storage.get<LocationData | null>(STORAGE_KEYS.LOCATION, null);
        if (savedLocation) {
            setLocation(savedLocation);
        }
    }, []);

    // Load prayer times when location changes
    useEffect(() => {
        loadPrayerTimes();
    }, [location]);

    useEffect(() => {
        if (!prayerData) return;

        const interval = setInterval(updateCountdown, 1000);
        updateCountdown();

        return () => clearInterval(interval);
    }, [prayerData]);

    const loadPrayerTimes = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await getPrayerTimesByCity(location.city, location.country, 3);
            if (data) {
                setPrayerData(data);
            } else {
                setError('Impossible de charger les horaires');
            }
        } catch (err) {
            setError('Erreur de connexion');
        } finally {
            setIsLoading(false);
        }
    };

    const updateCountdown = () => {
        if (!prayerData) return;

        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const prayerOrder = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;

        for (const prayer of prayerOrder) {
            const time = prayerData.timings[prayer];
            const [hours, minutes] = time.split(':').map(Number);
            const prayerMinutes = hours * 60 + minutes;

            if (prayerMinutes > currentMinutes) {
                setNextPrayer(prayer);
                const timeUntil = getTimeUntil(time);
                setCountdown(formatCountdown(timeUntil.hours, timeUntil.minutes, timeUntil.seconds));
                return;
            }
        }

        setNextPrayer('Fajr');
        setCountdown('Demain');
    };

    const isPrayerPassed = (prayer: string) => {
        if (!prayerData) return false;
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const time = prayerData.timings[prayer as keyof typeof prayerData.timings];
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes < currentMinutes;
    };

    return (
        <AppWrapper>
            <div className="min-h-screen bg-background safe-bottom w-full max-w-full overflow-x-hidden">
                <CompactHeader
                    title="Heures de Prière"
                    subtitle={prayerData?.date.hijri.month.ar}
                    rightElement={
                        <button
                            onClick={loadPrayerTimes}
                            disabled={isLoading}
                            className="p-2 rounded-full hover:bg-muted transition-colors"
                        >
                            <RefreshCw className={cn("w-5 h-5 text-muted-foreground", isLoading && "animate-spin")} />
                        </button>
                    }
                />

                <div className="p-4 space-y-4 w-full max-w-full">
                    {/* Location */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{location.city}, {location.country}</span>
                    </div>

                    {/* Date Display */}
                    {prayerData && (
                        <div className="card">
                            <div className="flex items-center gap-2 mb-2">
                                <Calendar className="w-5 h-5 text-primary" />
                                <span className="font-medium text-foreground">Aujourd&apos;hui</span>
                            </div>
                            <p className="text-2xl font-arabic text-primary" dir="rtl">
                                {prayerData.date.hijri.day} {prayerData.date.hijri.month.ar} {prayerData.date.hijri.year}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                                {prayerData.date.readable}
                            </p>
                        </div>
                    )}

                    {/* Next Prayer Highlight */}
                    {nextPrayer && prayerData && (
                        <div className="card card-gold">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm opacity-80">Prochaine prière</p>
                                    <p className="text-2xl font-bold">{prayerInfo[nextPrayer].frenchName}</p>
                                    <p className="text-lg font-mono">{prayerData.timings[nextPrayer as keyof typeof prayerData.timings]}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm opacity-80">Dans</p>
                                    <p className="text-3xl font-bold">{countdown}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="card border-red-500/30 bg-red-500/10">
                            <p className="text-red-500 text-center">{error}</p>
                            <button onClick={loadPrayerTimes} className="btn btn-primary w-full mt-3">
                                Réessayer
                            </button>
                        </div>
                    )}

                    {/* Loading State */}
                    {isLoading && !prayerData && (
                        <div className="space-y-3">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="card animate-pulse">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-muted rounded-xl" />
                                        <div className="flex-1">
                                            <div className="h-5 w-20 bg-muted rounded mb-2" />
                                            <div className="h-4 w-16 bg-muted rounded" />
                                        </div>
                                        <div className="h-6 w-16 bg-muted rounded" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Prayer Times List */}
                    {prayerData && (
                        <div className="space-y-2">
                            {prayers.map((prayer) => {
                                const info = prayerInfo[prayer];
                                const time = prayerData.timings[prayer];
                                const isNext = prayer === nextPrayer;
                                const isPassed = isPrayerPassed(prayer);
                                const isSunrise = prayer === 'Sunrise';

                                return (
                                    <div
                                        key={prayer}
                                        className={cn(
                                            "prayer-card",
                                            isNext && "next",
                                            isPassed && !isNext && "opacity-50",
                                            isSunrise && "bg-muted/50"
                                        )}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white", info.color)}>
                                                {info.icon}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-foreground">{info.frenchName}</p>
                                                {isSunrise && <p className="text-xs text-muted-foreground">(non obligatoire)</p>}
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <p className={cn("text-xl font-mono font-bold", isNext ? "text-gold-500" : "text-foreground")}>
                                                {time}
                                            </p>
                                            {isNext && <p className="text-xs text-gold-500">{countdown}</p>}
                                            {isPassed && !isNext && <p className="text-xs text-muted-foreground">Passée</p>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Calculation Method Info */}
                    {prayerData && (
                        <div className="text-center text-xs text-muted-foreground mt-6">
                            <p>Méthode: {prayerData.meta.method.name}</p>
                            <p>Fuseau horaire: {prayerData.meta.timezone}</p>
                        </div>
                    )}
                </div>
            </div>
        </AppWrapper>
    );
}
