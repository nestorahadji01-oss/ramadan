'use client';

import { useState, useEffect, useMemo } from 'react';
import AppWrapper from '@/components/AppWrapper';
import { CompactHeader } from '@/components/layout/Header';
import {
    Calendar, Check, BookOpen, Moon, Sun, Sparkles,
    Heart, MessageCircle, ChevronDown, ChevronUp
} from 'lucide-react';
import { cn, storage } from '@/lib/utils';

// ============ TYPES ============
interface PrayerStatus {
    fard: boolean;
    sunnah: boolean;
}

interface DailyPlannerData {
    date: string;
    prayers: {
        fajr: PrayerStatus;
        dhuhr: PrayerStatus;
        asr: PrayerStatus;
        maghrib: PrayerStatus;
        isha: PrayerStatus;
        taraweeh: { completed: boolean; rakahs: number };
        qiyam: boolean;
    };
    dailyGoals: { [key: string]: boolean };
    quran: {
        memorized: boolean;
        recited: boolean;
        verses: string;
        surah: string;
        juz: string;
    };
    reflections: string;
    deedCompleted: boolean;
}

// ============ DATA ============
const ALL_DAILY_GOALS = [
    { id: 'smile', label: 'Sourire à quelqu\'un', emoji: '😊' },
    { id: 'charity', label: 'Donner la charité', emoji: '💰' },
    { id: 'learn', label: 'Apprendre quelque chose', emoji: '📚' },
    { id: 'feed', label: 'Nourrir une personne', emoji: '🍽️' },
    { id: 'congregation', label: 'Prier en groupe', emoji: '🕌' },
    { id: 'adhkaar', label: 'Lire les Adhkaar', emoji: '📿' },
    { id: 'help', label: 'Aider quelqu\'un', emoji: '🤝' },
    { id: 'forgiveness', label: 'Demander pardon', emoji: '🤲' },
    { id: 'dua', label: 'Faire dua pour autrui', emoji: '💫' },
    { id: 'parents', label: 'Appeler les parents', emoji: '📞' },
    { id: 'patience', label: 'Pratiquer la patience', emoji: '🧘' },
    { id: 'gratitude', label: 'Exprimer la gratitude', emoji: '🙏' },
];

const DAILY_HADITHS = [
    { text: "Les gens les plus aimés d'Allah sont ceux qui sont les plus utiles aux autres.", source: "Al-Albani" },
    { text: "Celui qui jeûne Ramadan avec foi et espérance de récompense, ses péchés passés seront pardonnés.", source: "Bukhari" },
    { text: "Le meilleur d'entre vous est celui qui apprend le Coran et l'enseigne.", source: "Bukhari" },
    { text: "Quand un homme meurt, ses actes prennent fin sauf trois: une charité continue, un savoir utile, ou un enfant pieux qui prie pour lui.", source: "Muslim" },
    { text: "Celui qui croit en Allah et au Jour Dernier, qu'il dise du bien ou qu'il se taise.", source: "Bukhari & Muslim" },
    { text: "La propreté est la moitié de la foi.", source: "Muslim" },
    { text: "Souriez à votre frère, c'est une charité.", source: "Tirmidhi" },
];

const DEEDS_OF_DAY = [
    "Offrir un repas à un voisin",
    "Faire une donation en ligne",
    "Réconcilier deux personnes",
    "Visiter un malade",
    "Nettoyer la mosquée",
    "Préparer l'iftar pour d'autres",
    "Envoyer un message d'encouragement",
    "Partager une sourate avec quelqu'un",
    "Faire du bénévolat",
    "Acheter de la nourriture pour les nécessiteux",
];

const TIPS_OF_DAY = [
    "Rompez le jeûne avec des dattes et de l'eau, puis priez Maghrib avant le repas.",
    "Buvez beaucoup d'eau entre Iftar et Suhoor pour rester hydraté.",
    "Faites une sieste l'après-midi pour récupérer de l'énergie.",
    "Mangez léger au Suhoor pour éviter la fatigue.",
    "Lisez au moins 1 juz par jour pour finir le Coran.",
    "Faites vos invocations avant de rompre le jeûne.",
    "Pratiquez le dhikr pendant vos tâches quotidiennes.",
    "Évitez les écrans tard le soir pour mieux dormir.",
];

// ============ HELPERS ============
function getDayOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function seededShuffle<T>(array: T[], seed: number): T[] {
    const result = [...array];
    let m = result.length;
    while (m) {
        const i = Math.floor((seed = (seed * 9301 + 49297) % 233280) / 233280 * m--);
        [result[m], result[i]] = [result[i], result[m]];
    }
    return result;
}

function getDailyItems(date: string) {
    const d = new Date(date);
    const dayOfYear = getDayOfYear(d);
    const year = d.getFullYear();
    const seed = year * 1000 + dayOfYear;

    // Get 3 random goals for the day
    const shuffledGoals = seededShuffle(ALL_DAILY_GOALS, seed);
    const dailyGoals = shuffledGoals.slice(0, 3);

    // Get hadith, deed, tip of the day
    const hadith = DAILY_HADITHS[dayOfYear % DAILY_HADITHS.length];
    const deed = DEEDS_OF_DAY[dayOfYear % DEEDS_OF_DAY.length];
    const tip = TIPS_OF_DAY[dayOfYear % TIPS_OF_DAY.length];

    return { dailyGoals, hadith, deed, tip };
}

function getDefaultDayData(date: string): DailyPlannerData {
    return {
        date,
        prayers: {
            fajr: { fard: false, sunnah: false },
            dhuhr: { fard: false, sunnah: false },
            asr: { fard: false, sunnah: false },
            maghrib: { fard: false, sunnah: false },
            isha: { fard: false, sunnah: false },
            taraweeh: { completed: false, rakahs: 0 },
            qiyam: false,
        },
        dailyGoals: {},
        quran: {
            memorized: false,
            recited: false,
            verses: '',
            surah: '',
            juz: '',
        },
        reflections: '',
        deedCompleted: false,
    };
}

// ============ COMPONENTS ============
function PrayerCheckbox({
    checked,
    onChange,
    label,
    small = false
}: {
    checked: boolean;
    onChange: () => void;
    label: string;
    small?: boolean;
}) {
    return (
        <button
            onClick={onChange}
            className={cn(
                "flex flex-col items-center gap-1 transition-all",
                small ? "p-1" : "p-2"
            )}
        >
            <div className={cn(
                "rounded-lg border-2 flex items-center justify-center transition-all",
                small ? "w-6 h-6" : "w-10 h-10",
                checked
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : "border-gray-300 dark:border-gray-600"
            )}>
                {checked && <Check className={small ? "w-3 h-3" : "w-5 h-5"} />}
            </div>
            <span className={cn(
                "text-center",
                small ? "text-[10px] text-muted-foreground" : "text-xs font-medium"
            )}>
                {label}
            </span>
        </button>
    );
}

function Section({
    title,
    icon,
    children,
    color = "primary",
    collapsible = false,
    defaultOpen = true
}: {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    color?: "primary" | "emerald" | "gold" | "purple";
    collapsible?: boolean;
    defaultOpen?: boolean;
}) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    const colorClasses = {
        primary: "text-primary",
        emerald: "text-emerald-600",
        gold: "text-amber-500",
        purple: "text-purple-500",
    };

    return (
        <section className="mb-4">
            <button
                onClick={() => collapsible && setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center gap-2 text-base font-semibold mb-2 w-full",
                    collapsible && "cursor-pointer"
                )}
            >
                <span className={colorClasses[color]}>{icon}</span>
                <span className="flex-1 text-left">{title}</span>
                {collapsible && (
                    isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                )}
            </button>
            {(!collapsible || isOpen) && (
                <div className="card">{children}</div>
            )}
        </section>
    );
}

// ============ MAIN COMPONENT ============
export default function PlannerPage() {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [plannerData, setPlannerData] = useState<Record<string, DailyPlannerData>>({});

    // Load data on mount
    useEffect(() => {
        const saved = storage.get<Record<string, DailyPlannerData>>('ramadan_planner_v2', {});
        setPlannerData(saved);
    }, []);

    // Save data when it changes
    useEffect(() => {
        if (Object.keys(plannerData).length > 0) {
            storage.set('ramadan_planner_v2', plannerData);
        }
    }, [plannerData]);

    // Get daily items (deterministic based on date)
    const { dailyGoals, hadith, deed, tip } = useMemo(
        () => getDailyItems(selectedDate),
        [selectedDate]
    );

    // Get current day data
    const dayData = plannerData[selectedDate] || getDefaultDayData(selectedDate);

    const updateDayData = (updates: Partial<DailyPlannerData>) => {
        setPlannerData(prev => ({
            ...prev,
            [selectedDate]: { ...dayData, ...updates },
        }));
    };

    const updatePrayer = (prayer: keyof typeof dayData.prayers, field: 'fard' | 'sunnah', value?: boolean) => {
        const current = dayData.prayers[prayer];
        if (prayer === 'taraweeh') {
            updateDayData({
                prayers: {
                    ...dayData.prayers,
                    taraweeh: { ...dayData.prayers.taraweeh, completed: value ?? !dayData.prayers.taraweeh.completed }
                }
            });
        } else if (prayer === 'qiyam') {
            updateDayData({
                prayers: { ...dayData.prayers, qiyam: !dayData.prayers.qiyam }
            });
        } else {
            const prayerData = current as PrayerStatus;
            updateDayData({
                prayers: {
                    ...dayData.prayers,
                    [prayer]: { ...prayerData, [field]: !prayerData[field] }
                }
            });
        }
    };

    const toggleGoal = (goalId: string) => {
        updateDayData({
            dailyGoals: {
                ...dayData.dailyGoals,
                [goalId]: !dayData.dailyGoals[goalId]
            }
        });
    };

    // Calculate progress
    const prayerCount = Object.entries(dayData.prayers)
        .filter(([key]) => !['taraweeh', 'qiyam'].includes(key))
        .reduce((acc, [, val]) => acc + ((val as PrayerStatus).fard ? 1 : 0), 0);
    const goalsCompleted = dailyGoals.filter(g => dayData.dailyGoals[g.id]).length;

    return (
        <AppWrapper>
            <div className="min-h-screen bg-background safe-bottom">
                <CompactHeader
                    title="Planner Ramadan"
                    subtitle="مخطط رمضان"
                />

                <div className="p-4">
                    {/* Date Selector */}
                    <div className="flex items-center gap-3 mb-4">
                        <Calendar className="w-5 h-5 text-primary" />
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="input flex-1"
                        />
                    </div>

                    {/* Daily Hadith */}
                    <div className="card bg-gradient-to-r from-primary/10 to-emerald-500/10 mb-4">
                        <p className="text-sm italic text-foreground leading-relaxed">
                            "{hadith.text}"
                        </p>
                        <p className="text-xs text-muted-foreground mt-2 text-right">
                            — {hadith.source}
                        </p>
                    </div>

                    {/* Prayer Tracker */}
                    <Section title="Prières" icon={<Moon className="w-5 h-5" />} color="emerald">
                        {/* Main 5 Prayers Grid */}
                        <div className="grid grid-cols-5 gap-1 mb-4">
                            {(['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const).map((prayer) => (
                                <div key={prayer} className="flex flex-col items-center">
                                    <PrayerCheckbox
                                        checked={(dayData.prayers[prayer] as PrayerStatus).fard}
                                        onChange={() => updatePrayer(prayer, 'fard')}
                                        label={prayer.charAt(0).toUpperCase() + prayer.slice(1)}
                                    />
                                    <PrayerCheckbox
                                        checked={(dayData.prayers[prayer] as PrayerStatus).sunnah}
                                        onChange={() => updatePrayer(prayer, 'sunnah')}
                                        label="Sunnah"
                                        small
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Taraweeh & Qiyam */}
                        <div className="flex items-center justify-center gap-4 pt-3 border-t border-border">
                            <div className="flex items-center gap-2">
                                <PrayerCheckbox
                                    checked={dayData.prayers.taraweeh.completed}
                                    onChange={() => updatePrayer('taraweeh', 'fard')}
                                    label="Taraweeh"
                                />
                                <input
                                    type="number"
                                    min="0"
                                    max="20"
                                    value={dayData.prayers.taraweeh.rakahs || ''}
                                    onChange={(e) => updateDayData({
                                        prayers: {
                                            ...dayData.prayers,
                                            taraweeh: { ...dayData.prayers.taraweeh, rakahs: parseInt(e.target.value) || 0 }
                                        }
                                    })}
                                    placeholder="#"
                                    className="input w-12 h-8 text-center text-sm"
                                />
                            </div>
                            <PrayerCheckbox
                                checked={dayData.prayers.qiyam}
                                onChange={() => updatePrayer('qiyam', 'fard')}
                                label="Qiyam"
                            />
                        </div>

                        {/* Progress */}
                        <div className="mt-3 text-center text-sm text-muted-foreground">
                            {prayerCount}/5 Fard • {dayData.prayers.taraweeh.rakahs} Rak'ah Taraweeh
                        </div>
                    </Section>

                    {/* Daily Goals */}
                    <Section title="Objectifs du jour" icon={<Sparkles className="w-5 h-5" />} color="gold">
                        <div className="space-y-3">
                            {dailyGoals.map((goal) => (
                                <button
                                    key={goal.id}
                                    onClick={() => toggleGoal(goal.id)}
                                    className={cn(
                                        "w-full flex items-center gap-3 p-3 rounded-xl transition-all",
                                        dayData.dailyGoals[goal.id]
                                            ? "bg-amber-500/20 dark:bg-amber-500/30"
                                            : "bg-muted"
                                    )}
                                >
                                    <span className="text-xl">{goal.emoji}</span>
                                    <span className={cn(
                                        "flex-1 text-left text-sm",
                                        dayData.dailyGoals[goal.id] && "line-through"
                                    )}>
                                        {goal.label}
                                    </span>
                                    <div className={cn(
                                        "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                                        dayData.dailyGoals[goal.id]
                                            ? "bg-amber-500 border-amber-500 text-white"
                                            : "border-gray-300"
                                    )}>
                                        {dayData.dailyGoals[goal.id] && <Check className="w-4 h-4" />}
                                    </div>
                                </button>
                            ))}
                        </div>
                        <div className="mt-3 text-center text-sm text-muted-foreground">
                            {goalsCompleted}/3 objectifs accomplis
                        </div>
                    </Section>

                    {/* Deed of the Day */}
                    <Section title="Bonne action du jour" icon={<Heart className="w-5 h-5" />} color="primary">
                        <button
                            onClick={() => updateDayData({ deedCompleted: !dayData.deedCompleted })}
                            className={cn(
                                "w-full flex items-center gap-3 p-3 rounded-xl transition-all",
                                dayData.deedCompleted ? "bg-primary/20" : "bg-muted"
                            )}
                        >
                            <span className="text-xl">🌟</span>
                            <span className={cn(
                                "flex-1 text-left text-sm",
                                dayData.deedCompleted && "line-through"
                            )}>
                                {deed}
                            </span>
                            <div className={cn(
                                "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                                dayData.deedCompleted
                                    ? "bg-primary border-primary text-white"
                                    : "border-gray-300"
                            )}>
                                {dayData.deedCompleted && <Check className="w-4 h-4" />}
                            </div>
                        </button>
                    </Section>

                    {/* Tip of the Day */}
                    <div className="card bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 mb-4">
                        <div className="flex items-start gap-3">
                            <Sun className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-1">
                                    Conseil du jour
                                </h4>
                                <p className="text-sm text-blue-600 dark:text-blue-300">
                                    {tip}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Quran Tracker */}
                    <Section
                        title="Lecture du Coran"
                        icon={<BookOpen className="w-5 h-5" />}
                        color="emerald"
                        collapsible
                    >
                        <div className="space-y-4">
                            {/* Read type */}
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={dayData.quran.recited}
                                        onChange={() => updateDayData({
                                            quran: { ...dayData.quran, recited: !dayData.quran.recited }
                                        })}
                                        className="w-4 h-4 accent-emerald-500"
                                    />
                                    <span className="text-sm">Récité</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={dayData.quran.memorized}
                                        onChange={() => updateDayData({
                                            quran: { ...dayData.quran, memorized: !dayData.quran.memorized }
                                        })}
                                        className="w-4 h-4 accent-emerald-500"
                                    />
                                    <span className="text-sm">Mémorisé</span>
                                </label>
                            </div>

                            {/* Inputs */}
                            <div className="grid grid-cols-3 gap-2">
                                <div>
                                    <label className="text-xs text-muted-foreground mb-1 block">Versets</label>
                                    <input
                                        type="text"
                                        value={dayData.quran.verses}
                                        onChange={(e) => updateDayData({
                                            quran: { ...dayData.quran, verses: e.target.value }
                                        })}
                                        placeholder="1-10"
                                        className="input text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-muted-foreground mb-1 block">Sourate</label>
                                    <input
                                        type="text"
                                        value={dayData.quran.surah}
                                        onChange={(e) => updateDayData({
                                            quran: { ...dayData.quran, surah: e.target.value }
                                        })}
                                        placeholder="Al-Baqara"
                                        className="input text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-muted-foreground mb-1 block">Juz</label>
                                    <input
                                        type="text"
                                        value={dayData.quran.juz}
                                        onChange={(e) => updateDayData({
                                            quran: { ...dayData.quran, juz: e.target.value }
                                        })}
                                        placeholder="1"
                                        className="input text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </Section>

                    {/* Reflections */}
                    <Section
                        title="Réflexions"
                        icon={<MessageCircle className="w-5 h-5" />}
                        color="purple"
                        collapsible
                        defaultOpen={false}
                    >
                        <textarea
                            value={dayData.reflections}
                            onChange={(e) => updateDayData({ reflections: e.target.value })}
                            placeholder="Mes pensées, gratitudes, et invocations du jour..."
                            className="input min-h-[120px] resize-none text-sm"
                        />
                    </Section>
                </div>
            </div>
        </AppWrapper>
    );
}
