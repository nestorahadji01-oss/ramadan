'use client';

import { useState, useEffect } from 'react';
import AppWrapper from '@/components/AppWrapper';
import { CompactHeader } from '@/components/layout/Header';
import { Trophy, Check, Star, Flame, Gift, History, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { cn, storage, STORAGE_KEYS } from '@/lib/utils';

interface Challenge {
    id: string;
    title: string;
    description: string;
    category: 'priere' | 'coran' | 'sadaqa' | 'jeune' | 'dhikr' | 'famille';
    points: number;
    icon: string;
}

interface DailyProgress {
    date: string;
    completedChallenges: string[];
    streak: number;
    totalPoints: number;
}

interface HistoryEntry {
    date: string;
    completedCount: number;
    points: number;
}

const categoryColors: Record<string, string> = {
    priere: 'from-blue-500 to-blue-600',
    coran: 'from-emerald-500 to-emerald-600',
    sadaqa: 'from-amber-500 to-amber-600',
    jeune: 'from-purple-500 to-purple-600',
    dhikr: 'from-pink-500 to-pink-600',
    famille: 'from-cyan-500 to-cyan-600',
};

const dailyChallenges: Challenge[] = [
    { id: 'fajr-time', title: 'Fajr à l\'heure', description: 'Prier Fajr à la mosquée ou dès l\'adhan', category: 'priere', points: 50, icon: '🕌' },
    { id: 'quran-1-page', title: 'Lire 1 page du Coran', description: 'Lire au moins une page du Coran', category: 'coran', points: 30, icon: '📖' },
    { id: 'quran-1-juz', title: 'Lire 1 Juz complet', description: 'Terminer un Juz (20 pages)', category: 'coran', points: 100, icon: '📚' },
    { id: 'sadaqa-daily', title: 'Donner une aumône', description: 'Faire un don, même petit', category: 'sadaqa', points: 40, icon: '💝' },
    { id: 'feed-fasting', title: 'Nourrir un jeûneur', description: 'Offrir l\'iftar à quelqu\'un', category: 'sadaqa', points: 70, icon: '🍽️' },
    { id: 'azkar-morning', title: 'Azkar du matin', description: 'Réciter les azkar après Fajr', category: 'dhikr', points: 25, icon: '🌅' },
    { id: 'azkar-evening', title: 'Azkar du soir', description: 'Réciter les azkar après Asr', category: 'dhikr', points: 25, icon: '🌙' },
    { id: 'taraweeh', title: 'Prier Taraweeh', description: 'Accomplir la prière de Taraweeh', category: 'priere', points: 60, icon: '🌃' },
    { id: 'dua-iftar', title: 'Dua avant l\'Iftar', description: 'Faire des invocations avant de rompre', category: 'dhikr', points: 20, icon: '🤲' },
    { id: 'family-iftar', title: 'Iftar en famille', description: 'Partager l\'iftar avec sa famille', category: 'famille', points: 35, icon: '👨‍👩‍👧‍👦' },
    { id: 'suhoor', title: 'Prendre le Suhoor', description: 'Se lever pour le repas avant l\'aube', category: 'jeune', points: 30, icon: '🥣' },
    { id: 'good-deed', title: 'Bonne action du jour', description: 'Aider quelqu\'un ou faire une bonne action', category: 'sadaqa', points: 25, icon: '✨' },
];

export default function ChallengesPage() {
    const [progress, setProgress] = useState<DailyProgress>({
        date: new Date().toISOString().split('T')[0],
        completedChallenges: [],
        streak: 0,
        totalPoints: 0,
    });
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [showHistory, setShowHistory] = useState(false);

    useEffect(() => {
        loadProgress();
        loadHistory();
    }, []);

    const loadProgress = () => {
        const saved = storage.get<DailyProgress | null>(STORAGE_KEYS.DAILY_CHALLENGES, null);
        const today = new Date().toISOString().split('T')[0];

        if (saved) {
            if (saved.date === today) {
                setProgress(saved);
            } else {
                // Save yesterday's progress to history before resetting
                saveToHistory(saved);

                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const wasActiveYesterday = saved.date === yesterday.toISOString().split('T')[0];

                const newProgress: DailyProgress = {
                    date: today,
                    completedChallenges: [],
                    streak: wasActiveYesterday ? saved.streak + 1 : 1,
                    totalPoints: saved.totalPoints,
                };
                setProgress(newProgress);
                storage.set(STORAGE_KEYS.DAILY_CHALLENGES, newProgress);
            }
        }
    };

    const loadHistory = () => {
        const savedHistory = storage.get<HistoryEntry[]>('ramadan_challenges_history', []);
        setHistory(savedHistory);
    };

    const saveToHistory = (dayProgress: DailyProgress) => {
        const entry: HistoryEntry = {
            date: dayProgress.date,
            completedCount: dayProgress.completedChallenges.length,
            points: dailyChallenges
                .filter(c => dayProgress.completedChallenges.includes(c.id))
                .reduce((sum, c) => sum + c.points, 0),
        };

        const savedHistory = storage.get<HistoryEntry[]>('ramadan_challenges_history', []);
        // Avoid duplicates
        if (!savedHistory.some(h => h.date === entry.date)) {
            const newHistory = [entry, ...savedHistory].slice(0, 30); // Keep last 30 days
            storage.set('ramadan_challenges_history', newHistory);
            setHistory(newHistory);
        }
    };

    const toggleChallenge = (challengeId: string) => {
        const challenge = dailyChallenges.find(c => c.id === challengeId);
        if (!challenge) return;

        const isCompleted = progress.completedChallenges.includes(challengeId);

        const newProgress: DailyProgress = {
            ...progress,
            completedChallenges: isCompleted
                ? progress.completedChallenges.filter(id => id !== challengeId)
                : [...progress.completedChallenges, challengeId],
            totalPoints: isCompleted
                ? progress.totalPoints - challenge.points
                : progress.totalPoints + challenge.points,
        };

        setProgress(newProgress);
        storage.set(STORAGE_KEYS.DAILY_CHALLENGES, newProgress);

        if ('vibrate' in navigator && !isCompleted) {
            navigator.vibrate(30);
        }
    };

    const todayPoints = dailyChallenges
        .filter(c => progress.completedChallenges.includes(c.id))
        .reduce((sum, c) => sum + c.points, 0);

    const completionRate = Math.round((progress.completedChallenges.length / dailyChallenges.length) * 100);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
    };

    return (
        <AppWrapper>
            <div className="min-h-screen bg-background safe-bottom w-full max-w-full overflow-x-hidden">
                <CompactHeader title="Défis du Jour" subtitle="تحديات اليوم" />

                <div className="p-4 space-y-4 w-full max-w-full">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-3 gap-2 w-full">
                        <div className="bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-xl p-2 text-center">
                            <Flame className="w-4 h-4 mx-auto mb-0.5" />
                            <div className="text-lg font-bold">{progress.streak}</div>
                            <div className="text-[9px] opacity-80">Jours</div>
                        </div>
                        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl p-2 text-center">
                            <Star className="w-4 h-4 mx-auto mb-0.5" />
                            <div className="text-lg font-bold">{todayPoints}</div>
                            <div className="text-[9px] opacity-80">Points</div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-2 text-center">
                            <Trophy className="w-4 h-4 mx-auto mb-0.5" />
                            <div className="text-lg font-bold">{progress.totalPoints}</div>
                            <div className="text-[9px] opacity-80">Total</div>
                        </div>
                    </div>

                    {/* History Toggle */}
                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        className="w-full flex items-center justify-between px-3 py-2 bg-muted rounded-xl text-sm"
                    >
                        <div className="flex items-center gap-2">
                            <History className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">Historique des jours</span>
                        </div>
                        {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {/* History Section */}
                    {showHistory && (
                        <div className="bg-card border border-card-border rounded-xl p-3 space-y-2 max-h-48 overflow-y-auto">
                            {history.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    Aucun historique pour l'instant
                                </p>
                            ) : (
                                history.map((entry) => (
                                    <div key={entry.date} className="flex items-center justify-between py-2 border-b border-card-border last:border-0">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-sm">{formatDate(entry.date)}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <span className="text-muted-foreground">
                                                {entry.completedCount}/{dailyChallenges.length}
                                            </span>
                                            <span className="font-bold text-primary">+{entry.points}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Progress Bar */}
                    <div className="bg-card border border-card-border rounded-xl p-3 w-full">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium">Progression aujourd'hui</span>
                            <span className="text-xs text-muted-foreground">
                                {progress.completedChallenges.length}/{dailyChallenges.length}
                            </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                                style={{ width: `${completionRate}%` }}
                            />
                        </div>
                        <p className="text-center text-xs text-muted-foreground mt-1">
                            {completionRate === 100 ? '🎉 Macha Allah!' : `${completionRate}%`}
                        </p>
                    </div>

                    {/* Challenges List */}
                    <div className="space-y-2 w-full">
                        {dailyChallenges.map((challenge) => {
                            const isCompleted = progress.completedChallenges.includes(challenge.id);

                            return (
                                <button
                                    key={challenge.id}
                                    onClick={() => toggleChallenge(challenge.id)}
                                    className={cn(
                                        "w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                                        isCompleted
                                            ? "border-primary bg-primary/5"
                                            : "border-card-border bg-card"
                                    )}
                                >
                                    <div className={cn(
                                        "w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0",
                                        isCompleted
                                            ? "bg-primary text-primary-foreground"
                                            : `bg-gradient-to-br ${categoryColors[challenge.category]} text-white`
                                    )}>
                                        {isCompleted ? <Check className="w-5 h-5" /> : challenge.icon}
                                    </div>

                                    <div className="flex-1 min-w-0 overflow-hidden">
                                        <h3 className={cn(
                                            "font-medium text-sm truncate",
                                            isCompleted && "line-through text-muted-foreground"
                                        )}>
                                            {challenge.title}
                                        </h3>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {challenge.description}
                                        </p>
                                    </div>

                                    <div className={cn(
                                        "text-right flex-shrink-0",
                                        isCompleted ? "text-primary" : "text-muted-foreground"
                                    )}>
                                        <span className="text-sm font-bold">+{challenge.points}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Motivation */}
                    <div className="bg-gradient-to-br from-emerald-700 to-emerald-900 text-white rounded-xl p-4 text-center w-full">
                        <Gift className="w-8 h-8 mx-auto mb-2 text-gold-400" />
                        <p className="text-sm font-semibold mb-1">Chaque bonne action compte</p>
                        <p className="text-xs opacity-80">
                            "Les bonnes actions en Ramadan sont multipliées"
                        </p>
                    </div>
                </div>
            </div>
        </AppWrapper>
    );
}
