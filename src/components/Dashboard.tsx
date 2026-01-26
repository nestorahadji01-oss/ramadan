'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import {
    Clock, BookOpen, Heart, Calculator, Calendar,
    BookMarked, Radio, Scroll, ArrowRight, Sparkles
} from 'lucide-react';
import { getPrayerTimesByCity, type PrayerTimesResponse } from '@/lib/api/islamic';
import { getTimeUntil, formatCountdown, storage, STORAGE_KEYS } from '@/lib/utils';

interface LocationData {
    city: string;
    country: string;
    lat: number;
    lng: number;
}

interface QuickAction {
    href: string;
    icon: React.ReactNode;
    label: string;
    description: string;
    color: string;
}

const quickActions: QuickAction[] = [
    { href: '/prayer-times', icon: <Clock className="w-6 h-6" />, label: 'Heures de Prière', description: 'Horaires du jour', color: 'from-blue-500 to-indigo-600' },
    { href: '/tasbih', icon: <Heart className="w-6 h-6" />, label: 'Tasbih', description: 'Compteur de dhikr', color: 'from-pink-500 to-rose-600' },
    { href: '/quran', icon: <BookOpen className="w-6 h-6" />, label: 'Coran', description: 'Lecture & Audio', color: 'from-emerald-500 to-teal-600' },
    { href: '/azkar', icon: <BookMarked className="w-6 h-6" />, label: 'Azkar', description: 'Invocations', color: 'from-amber-500 to-orange-600' },
];

const moreFeatures = [
    { href: '/zakat', icon: <Calculator className="w-5 h-5" />, label: 'Calculateur Zakat' },
    { href: '/planner', icon: <Calendar className="w-5 h-5" />, label: 'Planner Ramadan' },
    { href: '/radio', icon: <Radio className="w-5 h-5" />, label: 'Radio Coran' },
    { href: '/hadith', icon: <Scroll className="w-5 h-5" />, label: 'Hadiths' },
    { href: '/library', icon: <BookOpen className="w-5 h-5" />, label: 'Bibliothèque' },
];

const prayerNames: Record<string, string> = {
    Fajr: 'Fajr',
    Sunrise: 'Lever du soleil',
    Dhuhr: 'Dhuhr',
    Asr: 'Asr',
    Maghrib: 'Maghrib',
    Isha: 'Isha',
};

export default function Dashboard() {
    const [prayerData, setPrayerData] = useState<PrayerTimesResponse | null>(null);
    const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string; countdown: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [location, setLocation] = useState<LocationData>({
        city: 'Dakar',
        country: 'Sénégal',
        lat: 14.6928,
        lng: -17.4467,
    });

    useEffect(() => {
        // Load saved location
        const savedLocation = storage.get<LocationData | null>(STORAGE_KEYS.LOCATION, null);
        if (savedLocation) {
            setLocation(savedLocation);
        }
    }, []);

    useEffect(() => {
        loadPrayerTimes();
    }, [location]);

    useEffect(() => {
        if (!prayerData) return;

        const interval = setInterval(() => {
            updateNextPrayer();
        }, 1000);

        updateNextPrayer();

        return () => clearInterval(interval);
    }, [prayerData]);

    const loadPrayerTimes = async () => {
        try {
            const data = await getPrayerTimesByCity(location.city, location.country, 3);
            setPrayerData(data);
        } catch (error) {
            console.error('Failed to load prayer times:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const updateNextPrayer = () => {
        if (!prayerData) return;

        const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        for (const prayer of prayers) {
            const time = prayerData.timings[prayer];
            const [hours, minutes] = time.split(':').map(Number);
            const prayerMinutes = hours * 60 + minutes;

            if (prayerMinutes > currentMinutes) {
                const timeUntil = getTimeUntil(time);
                setNextPrayer({
                    name: prayerNames[prayer],
                    time: time,
                    countdown: timeUntil.isPast ? '' : formatCountdown(timeUntil.hours, timeUntil.minutes, timeUntil.seconds),
                });
                return;
            }
        }

        setNextPrayer({
            name: 'Fajr',
            time: prayerData.timings.Fajr,
            countdown: 'Demain',
        });
    };

    return (
        <div className="min-h-screen bg-background safe-bottom w-full max-w-full overflow-x-hidden">
            <Header
                city={`${location.city}, ${location.country}`}
                nextPrayer={nextPrayer || undefined}
                hijriDate={prayerData ? {
                    day: parseInt(prayerData.date.hijri.day),
                    month: prayerData.date.hijri.month.ar,
                    year: parseInt(prayerData.date.hijri.year),
                } : undefined}
                gregorianDate={prayerData?.date.readable}
            />

            <div className="p-4 space-y-6 w-full max-w-full">
                {/* Welcome Section */}
                <div className="card card-gold relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="relative">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-5 h-5" />
                            <span className="text-sm font-medium opacity-80">رمضان مبارك</span>
                        </div>
                        <h2 className="text-2xl font-bold mb-1">Ramadan Moubarak!</h2>
                        <p className="text-sm opacity-80">
                            Que ce mois béni soit rempli de paix et de bénédictions.
                        </p>
                    </div>
                </div>

                {/* Quick Actions Grid */}
                <section>
                    <h3 className="text-lg font-semibold text-foreground mb-3">Accès rapide</h3>
                    <div className="grid grid-cols-2 gap-3 stagger-children">
                        {quickActions.map((action) => (
                            <Link key={action.href} href={action.href} className="card group">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform`}>
                                    {action.icon}
                                </div>
                                <h4 className="font-semibold text-foreground">{action.label}</h4>
                                <p className="text-sm text-muted-foreground">{action.description}</p>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Today's Prayer Times Preview */}
                {prayerData && (
                    <section>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold text-foreground">Prières du jour</h3>
                            <Link href="/prayer-times" className="text-sm text-primary flex items-center gap-1">
                                Voir tout <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="card p-0 overflow-hidden">
                            <div className="divide-y divide-card-border">
                                {(['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const).map((prayer) => {
                                    const isNext = nextPrayer?.name === prayerNames[prayer];
                                    return (
                                        <div key={prayer} className={`flex items-center justify-between px-4 py-3 ${isNext ? 'bg-primary/5' : ''}`}>
                                            <div className="flex items-center gap-3">
                                                {isNext && <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                                                <span className={`font-medium ${isNext ? 'text-primary' : 'text-foreground'}`}>
                                                    {prayerNames[prayer]}
                                                </span>
                                            </div>
                                            <span className={`font-mono ${isNext ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                                                {prayerData.timings[prayer]}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>
                )}

                {/* More Features */}
                <section>
                    <h3 className="text-lg font-semibold text-foreground mb-3">Plus de fonctionnalités</h3>
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
                        {moreFeatures.map((feature) => (
                            <Link
                                key={feature.href}
                                href={feature.href}
                                className="flex-shrink-0 flex items-center gap-2 px-4 py-3 bg-card border border-card-border rounded-xl hover:border-primary/30 transition-colors"
                            >
                                <span className="text-muted-foreground">{feature.icon}</span>
                                <span className="text-sm font-medium text-foreground whitespace-nowrap">{feature.label}</span>
                            </Link>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
