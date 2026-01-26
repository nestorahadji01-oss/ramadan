'use client';

import { useState, useEffect, useCallback } from 'react';
import AppWrapper from '@/components/AppWrapper';
import { CompactHeader } from '@/components/layout/Header';
import { RotateCcw, Target, History, Volume2, VolumeX, Check } from 'lucide-react';
import { cn, storage, STORAGE_KEYS } from '@/lib/utils';

interface TasbihSession {
    dhikr: string;
    count: number;
    target: number;
    timestamp: string;
}

const presetDhikr = [
    { arabic: 'سُبْحَانَ اللّٰهِ', french: 'Subhanallah', meaning: 'Gloire à Allah' },
    { arabic: 'الْحَمْدُ لِلّٰهِ', french: 'Alhamdulillah', meaning: 'Louange à Allah' },
    { arabic: 'اللّٰهُ أَكْبَرُ', french: 'Allahu Akbar', meaning: 'Allah est le Plus Grand' },
    { arabic: 'لَا إِلٰهَ إِلَّا اللّٰهُ', french: 'La ilaha illa Allah', meaning: 'Pas de divinité sauf Allah' },
    { arabic: 'أَسْتَغْفِرُ اللّٰهَ', french: 'Astaghfirullah', meaning: 'Je demande pardon à Allah' },
    { arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللّٰهِ', french: 'La hawla...', meaning: 'Pas de force sauf en Allah' },
];

const targetOptions = [33, 99, 100, 500, 1000];

export default function TasbihPage() {
    const [count, setCount] = useState(0);
    const [target, setTarget] = useState(33);
    const [selectedDhikr, setSelectedDhikr] = useState(presetDhikr[0]);
    const [showDhikrSelector, setShowDhikrSelector] = useState(false);
    const [showTargetSelector, setShowTargetSelector] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [history, setHistory] = useState<TasbihSession[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [isComplete, setIsComplete] = useState(false);

    // Load history on mount
    useEffect(() => {
        const savedHistory = storage.get<TasbihSession[]>(STORAGE_KEYS.TASBIH_HISTORY, []);
        setHistory(savedHistory);
    }, []);

    // Check if target reached
    useEffect(() => {
        if (count >= target && count > 0) {
            setIsComplete(true);
            // Vibrate on completion
            if ('vibrate' in navigator) {
                navigator.vibrate([100, 50, 100, 50, 100]);
            }
        } else {
            setIsComplete(false);
        }
    }, [count, target]);

    const handleCount = useCallback(() => {
        setCount(prev => prev + 1);

        // Haptic feedback
        if ('vibrate' in navigator) {
            navigator.vibrate(10);
        }

        // Play click sound (would need audio file)
        if (soundEnabled) {
            // Audio feedback placeholder
        }
    }, [soundEnabled]);

    const handleReset = () => {
        if (count > 0) {
            // Save session to history
            const session: TasbihSession = {
                dhikr: selectedDhikr.french,
                count,
                target,
                timestamp: new Date().toISOString(),
            };
            const newHistory = [session, ...history].slice(0, 50); // Keep last 50 sessions
            setHistory(newHistory);
            storage.set(STORAGE_KEYS.TASBIH_HISTORY, newHistory);
        }
        setCount(0);
        setIsComplete(false);
    };

    const progress = Math.min((count / target) * 100, 100);

    return (
        <AppWrapper>
            <div className="min-h-screen bg-background safe-bottom">
                <CompactHeader
                    title="Tasbih"
                    subtitle={selectedDhikr.french}
                    rightElement={
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setSoundEnabled(!soundEnabled)}
                                className="p-2 rounded-full hover:bg-muted transition-colors"
                            >
                                {soundEnabled ? (
                                    <Volume2 className="w-5 h-5 text-muted-foreground" />
                                ) : (
                                    <VolumeX className="w-5 h-5 text-muted-foreground" />
                                )}
                            </button>
                            <button
                                onClick={() => setShowHistory(true)}
                                className="p-2 rounded-full hover:bg-muted transition-colors"
                            >
                                <History className="w-5 h-5 text-muted-foreground" />
                            </button>
                        </div>
                    }
                />

                <div className="p-4 flex flex-col items-center">
                    {/* Selected Dhikr Display */}
                    <button
                        onClick={() => setShowDhikrSelector(true)}
                        className="card w-full max-w-sm text-center mb-6"
                    >
                        <p className="text-3xl font-arabic text-primary mb-2" dir="rtl">
                            {selectedDhikr.arabic}
                        </p>
                        <p className="text-sm text-muted-foreground">{selectedDhikr.meaning}</p>
                        <p className="text-xs text-gold-500 mt-2">Appuyez pour changer</p>
                    </button>

                    {/* Progress Ring */}
                    <div className="relative mb-8">
                        <svg className="w-56 h-56 transform -rotate-90">
                            {/* Background circle */}
                            <circle
                                cx="112"
                                cy="112"
                                r="100"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="none"
                                className="text-muted"
                            />
                            {/* Progress circle */}
                            <circle
                                cx="112"
                                cy="112"
                                r="100"
                                stroke="url(#progressGradient)"
                                strokeWidth="8"
                                fill="none"
                                strokeLinecap="round"
                                strokeDasharray={`${2 * Math.PI * 100}`}
                                strokeDashoffset={`${2 * Math.PI * 100 * (1 - progress / 100)}`}
                                className="transition-all duration-150"
                            />
                            <defs>
                                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#047857" />
                                    <stop offset="100%" stopColor="#10b981" />
                                </linearGradient>
                            </defs>
                        </svg>

                        {/* Counter Button */}
                        <button
                            onClick={handleCount}
                            className={cn(
                                "tasbih-btn absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
                                isComplete && "animate-pulse-gold border-gold-400"
                            )}
                        >
                            {isComplete ? (
                                <Check className="w-16 h-16" />
                            ) : (
                                count
                            )}
                        </button>
                    </div>

                    {/* Target and Reset */}
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            onClick={() => setShowTargetSelector(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-muted rounded-xl"
                        >
                            <Target className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{count} / {target}</span>
                        </button>

                        <button
                            onClick={handleReset}
                            className="flex items-center gap-2 px-4 py-2 bg-muted rounded-xl text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <RotateCcw className="w-4 h-4" />
                            <span className="text-sm font-medium">Recommencer</span>
                        </button>
                    </div>

                    {/* Quick Targets */}
                    <div className="flex flex-wrap gap-2 justify-center">
                        {targetOptions.map((t) => (
                            <button
                                key={t}
                                onClick={() => setTarget(t)}
                                className={cn(
                                    "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                                    target === t
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                                )}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Dhikr Selector Modal */}
                {showDhikrSelector && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={() => setShowDhikrSelector(false)}>
                        <div className="bg-card w-full max-w-lg rounded-t-3xl p-6 max-h-[70vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                            <h3 className="text-lg font-semibold mb-4">Choisir un dhikr</h3>
                            <div className="space-y-2">
                                {presetDhikr.map((dhikr) => (
                                    <button
                                        key={dhikr.french}
                                        onClick={() => {
                                            setSelectedDhikr(dhikr);
                                            setShowDhikrSelector(false);
                                            handleReset();
                                        }}
                                        className={cn(
                                            "w-full p-4 rounded-xl text-left transition-colors",
                                            selectedDhikr.french === dhikr.french
                                                ? "bg-primary/10 border-2 border-primary"
                                                : "bg-muted hover:bg-muted/80"
                                        )}
                                    >
                                        <p className="text-xl font-arabic text-foreground mb-1" dir="rtl">{dhikr.arabic}</p>
                                        <p className="text-sm font-medium text-foreground">{dhikr.french}</p>
                                        <p className="text-xs text-muted-foreground">{dhikr.meaning}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Target Selector Modal */}
                {showTargetSelector && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowTargetSelector(false)}>
                        <div className="bg-card w-full max-w-sm rounded-2xl p-6" onClick={e => e.stopPropagation()}>
                            <h3 className="text-lg font-semibold mb-4">Définir l&apos;objectif</h3>
                            <div className="grid grid-cols-3 gap-2">
                                {targetOptions.map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => {
                                            setTarget(t);
                                            setShowTargetSelector(false);
                                        }}
                                        className={cn(
                                            "py-3 rounded-xl text-lg font-semibold transition-colors",
                                            target === t
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-muted text-foreground hover:bg-muted/80"
                                        )}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* History Modal */}
                {showHistory && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={() => setShowHistory(false)}>
                        <div className="bg-card w-full max-w-lg rounded-t-3xl p-6 max-h-[70vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                            <h3 className="text-lg font-semibold mb-4">Historique</h3>
                            {history.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">
                                    Aucune session enregistrée
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {history.map((session, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-xl">
                                            <div>
                                                <p className="font-medium text-foreground">{session.dhikr}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(session.timestamp).toLocaleDateString('fr-FR', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-primary">{session.count}</p>
                                                <p className="text-xs text-muted-foreground">/ {session.target}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AppWrapper>
    );
}
