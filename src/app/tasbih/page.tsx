'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import AppWrapper from '@/components/AppWrapper';
import { CompactHeader } from '@/components/layout/Header';
import { RotateCcw, Target, History, Volume2, VolumeX, Check, X, Sparkles } from 'lucide-react';
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

// Celebration quotes
const celebrationQuotes = [
    { arabic: 'تَقَبَّلَ اللّٰهُ مِنَّا وَمِنكُم', french: 'Qu\'Allah accepte de nous et de vous' },
    { arabic: 'جَزَاكَ اللّٰهُ خَيْرًا', french: 'Qu\'Allah te récompense par un bien' },
    { arabic: 'بَارَكَ اللّٰهُ فِيكَ', french: 'Qu\'Allah te bénisse' },
    { arabic: 'أَحْسَنْتَ', french: 'Tu as bien fait!' },
    { arabic: 'مَا شَاءَ اللّٰهُ', french: 'Ce qu\'Allah a voulu' },
];

export default function TasbihPage() {
    const [count, setCount] = useState(0);
    const [target, setTarget] = useState(33);
    const [selectedDhikr, setSelectedDhikr] = useState(presetDhikr[0]);
    const [showDhikrSelector, setShowDhikrSelector] = useState(false);
    const [showTargetSelector, setShowTargetSelector] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [history, setHistory] = useState<TasbihSession[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [showCelebration, setShowCelebration] = useState(false);
    const [celebrationQuote, setCelebrationQuote] = useState(celebrationQuotes[0]);

    // Audio context for click sound
    const audioContextRef = useRef<AudioContext | null>(null);

    // Load history on mount
    useEffect(() => {
        const savedHistory = storage.get<TasbihSession[]>(STORAGE_KEYS.TASBIH_HISTORY, []);
        setHistory(savedHistory);
    }, []);

    // Initialize audio context on first interaction
    const initAudio = useCallback(() => {
        if (!audioContextRef.current && typeof window !== 'undefined') {
            audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        }
    }, []);

    // Play a soft click sound
    const playClickSound = useCallback(() => {
        if (!soundEnabled) return;

        try {
            initAudio();
            const ctx = audioContextRef.current;
            if (!ctx) return;

            // Resume context if suspended
            if (ctx.state === 'suspended') {
                ctx.resume();
            }

            // Create a short beep
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.frequency.value = 800; // Hz
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.1);
        } catch (e) {
            console.log('Audio error:', e);
        }
    }, [soundEnabled, initAudio]);

    // Play celebration sound
    const playCelebrationSound = useCallback(() => {
        if (!soundEnabled) return;

        try {
            initAudio();
            const ctx = audioContextRef.current;
            if (!ctx) return;

            if (ctx.state === 'suspended') {
                ctx.resume();
            }

            // Play ascending notes for celebration
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C, E, G, C

            notes.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.frequency.value = freq;
                osc.type = 'sine';

                const startTime = ctx.currentTime + i * 0.15;
                gain.gain.setValueAtTime(0.15, startTime);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);

                osc.start(startTime);
                osc.stop(startTime + 0.3);
            });
        } catch (e) {
            console.log('Audio error:', e);
        }
    }, [soundEnabled, initAudio]);

    const handleCount = useCallback(() => {
        const newCount = count + 1;
        setCount(newCount);

        // Sound feedback
        playClickSound();

        // Haptic feedback
        if ('vibrate' in navigator) {
            navigator.vibrate(15);
        }

        // Check if target reached
        if (newCount >= target) {
            // Strong vibration for completion
            if ('vibrate' in navigator) {
                navigator.vibrate([100, 50, 100, 50, 200]);
            }

            // Show celebration
            const randomQuote = celebrationQuotes[Math.floor(Math.random() * celebrationQuotes.length)];
            setCelebrationQuote(randomQuote);
            setShowCelebration(true);
            playCelebrationSound();
        }
    }, [count, target, playClickSound, playCelebrationSound]);

    const handleReset = () => {
        if (count > 0) {
            const session: TasbihSession = {
                dhikr: selectedDhikr.french,
                count,
                target,
                timestamp: new Date().toISOString(),
            };
            const newHistory = [session, ...history].slice(0, 50);
            setHistory(newHistory);
            storage.set(STORAGE_KEYS.TASBIH_HISTORY, newHistory);
        }
        setCount(0);
        setShowCelebration(false);
    };

    const closeCelebration = () => {
        setShowCelebration(false);
    };

    const progress = Math.min((count / target) * 100, 100);
    const isComplete = count >= target;

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
                                "tasbih-btn absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-150 active:scale-95",
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

                {/* Celebration Modal */}
                {showCelebration && (
                    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6" onClick={closeCelebration}>
                        <div
                            className="bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-900 rounded-3xl p-8 text-white text-center max-w-sm w-full shadow-2xl animate-bounce-in"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Sparkles Icon */}
                            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Sparkles className="w-10 h-10 text-gold-300" />
                            </div>

                            {/* Celebration Message */}
                            <h2 className="text-2xl font-bold mb-2">ما شاء الله!</h2>
                            <p className="text-lg mb-4">Tu as atteint ton objectif!</p>

                            {/* Quote */}
                            <div className="bg-white/10 rounded-2xl p-4 mb-6">
                                <p className="text-xl font-arabic mb-2" dir="rtl">{celebrationQuote.arabic}</p>
                                <p className="text-sm opacity-80">{celebrationQuote.french}</p>
                            </div>

                            {/* Stats */}
                            <p className="text-sm opacity-70 mb-4">
                                {count} × {selectedDhikr.french}
                            </p>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={closeCelebration}
                                    className="flex-1 py-3 bg-white/20 rounded-xl font-medium"
                                >
                                    Continuer
                                </button>
                                <button
                                    onClick={() => { handleReset(); closeCelebration(); }}
                                    className="flex-1 py-3 bg-white text-emerald-700 rounded-xl font-medium"
                                >
                                    Nouveau
                                </button>
                            </div>
                        </div>
                    </div>
                )}

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
