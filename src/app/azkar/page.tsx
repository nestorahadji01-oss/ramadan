'use client';

import { useState, useEffect } from 'react';
import AppWrapper from '@/components/AppWrapper';
import { CompactHeader } from '@/components/layout/Header';
import { Sun, Moon, Utensils, Plane, Bed, Heart, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

// Static Azkar data (would normally come from API)
const azkarCategories = [
    {
        id: 'morning',
        title: 'أذكار الصباح',
        frenchTitle: 'Azkar du Matin',
        icon: <Sun className="w-6 h-6" />,
        color: 'from-amber-400 to-orange-500'
    },
    {
        id: 'evening',
        title: 'أذكار المساء',
        frenchTitle: 'Azkar du Soir',
        icon: <Moon className="w-6 h-6" />,
        color: 'from-indigo-500 to-purple-600'
    },
    {
        id: 'sleep',
        title: 'أذكار النوم',
        frenchTitle: 'Azkar du Sommeil',
        icon: <Bed className="w-6 h-6" />,
        color: 'from-slate-600 to-slate-800'
    },
    {
        id: 'food',
        title: 'أذكار الطعام',
        frenchTitle: 'Azkar du Repas',
        icon: <Utensils className="w-6 h-6" />,
        color: 'from-emerald-500 to-teal-600'
    },
    {
        id: 'travel',
        title: 'أذكار السفر',
        frenchTitle: 'Azkar du Voyage',
        icon: <Plane className="w-6 h-6" />,
        color: 'from-sky-500 to-blue-600'
    },
];

// Sample Azkar data
const sampleAzkar: Record<string, Array<{
    arabic: string;
    french: string;
    repeat: number;
    virtue: string;
}>> = {
    morning: [
        {
            arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَـهَ إِلاَّ اللهُ وَحْدَهُ لاَ شَرِيكَ لَهُ',
            french: 'Nous voilà au matin et le royaume appartient à Allah. Louange à Allah. Il n\'y a de divinité digne d\'adoration qu\'Allah Seul, sans associé.',
            repeat: 1,
            virtue: 'Protection durant la journée'
        },
        {
            arabic: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ',
            french: 'Ô Allah, c\'est par Toi que nous nous retrouvons au matin et c\'est par Toi que nous nous retrouvons au soir. Par Toi nous vivons et par Toi nous mourons et vers Toi est la résurrection.',
            repeat: 1,
            virtue: 'Rappel de notre dépendance à Allah'
        },
        {
            arabic: 'سُبْحَانَ اللهِ وَبِحَمْدِهِ',
            french: 'Gloire et louange à Allah',
            repeat: 100,
            virtue: 'Ses péchés seront pardonnés même s\'ils sont aussi nombreux que l\'écume de la mer'
        },
        {
            arabic: 'لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
            french: 'Il n\'y a de divinité digne d\'adoration qu\'Allah, Seul, sans associé. À Lui la royauté, à Lui la louange et Il est capable de toute chose.',
            repeat: 10,
            virtue: 'Comme affranchir quatre esclaves parmi les descendants d\'Ismaïl'
        },
    ],
    evening: [
        {
            arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَـهَ إِلاَّ اللهُ وَحْدَهُ لاَ شَرِيكَ لَهُ',
            french: 'Nous voilà au soir et le royaume appartient à Allah. Louange à Allah. Il n\'y a de divinité digne d\'adoration qu\'Allah Seul, sans associé.',
            repeat: 1,
            virtue: 'Protection durant la nuit'
        },
        {
            arabic: 'أَعُوذُ بِكَلِمَاتِ اللهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
            french: 'Je cherche protection auprès des paroles parfaites d\'Allah contre le mal qu\'Il a créé.',
            repeat: 3,
            virtue: 'Rien ne lui nuira cette nuit'
        },
    ],
    sleep: [
        {
            arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
            french: 'C\'est en Ton nom, Ô Allah, que je meurs et que je vis.',
            repeat: 1,
            virtue: 'Invocation avant de dormir'
        },
    ],
    food: [
        {
            arabic: 'بِسْمِ اللهِ',
            french: 'Au nom d\'Allah',
            repeat: 1,
            virtue: 'Avant de manger'
        },
        {
            arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ',
            french: 'Louange à Allah qui m\'a nourri de cela et me l\'a accordé sans force ni puissance de ma part.',
            repeat: 1,
            virtue: 'Après avoir mangé - pardonne les péchés passés'
        },
    ],
    travel: [
        {
            arabic: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ',
            french: 'Gloire à Celui qui a mis ceci à notre service, alors que nous n\'étions pas capables de le dominer. Et c\'est vers notre Seigneur que nous retournerons.',
            repeat: 1,
            virtue: 'À dire lorsqu\'on monte dans un véhicule'
        },
    ],
};

export default function AzkarPage() {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [completedCounts, setCompletedCounts] = useState<Record<string, number>>({});

    const handleCount = (index: number, maxRepeat: number) => {
        const key = `${selectedCategory}-${index}`;
        const current = completedCounts[key] || 0;
        if (current < maxRepeat) {
            setCompletedCounts(prev => ({
                ...prev,
                [key]: current + 1
            }));

            // Haptic feedback
            if ('vibrate' in navigator) {
                navigator.vibrate(10);
            }
        }
    };

    const getProgress = (index: number, maxRepeat: number) => {
        const key = `${selectedCategory}-${index}`;
        return completedCounts[key] || 0;
    };

    const currentAzkar = selectedCategory ? sampleAzkar[selectedCategory] || [] : [];
    const currentCategory = azkarCategories.find(c => c.id === selectedCategory);

    return (
        <AppWrapper>
            <div className="min-h-screen bg-background safe-bottom">
                <CompactHeader
                    title={selectedCategory ? currentCategory?.frenchTitle || 'Azkar' : 'Azkar'}
                    subtitle={selectedCategory ? currentCategory?.title : 'الأذكار'}
                    rightElement={
                        selectedCategory && (
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className="text-sm text-primary"
                            >
                                Retour
                            </button>
                        )
                    }
                />

                <div className="p-4">
                    {/* Categories Grid */}
                    {!selectedCategory && (
                        <div className="grid grid-cols-2 gap-3 stagger-children">
                            {azkarCategories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => setSelectedCategory(category.id)}
                                    className="card hover:scale-[1.02] transition-transform"
                                >
                                    <div className={cn(
                                        "w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-3 bg-gradient-to-br",
                                        category.color
                                    )}>
                                        {category.icon}
                                    </div>
                                    <p className="text-xl font-arabic text-foreground mb-1" dir="rtl">
                                        {category.title}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {category.frenchTitle}
                                    </p>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Azkar List */}
                    {selectedCategory && (
                        <div className="space-y-4">
                            {currentAzkar.map((dhikr, index) => {
                                const progress = getProgress(index, dhikr.repeat);
                                const isComplete = progress >= dhikr.repeat;

                                return (
                                    <div
                                        key={index}
                                        className={cn(
                                            "card",
                                            isComplete && "border-primary/30 bg-primary/5"
                                        )}
                                    >
                                        {/* Arabic Text */}
                                        <p className="text-2xl font-arabic text-foreground leading-loose mb-4" dir="rtl">
                                            {dhikr.arabic}
                                        </p>

                                        {/* French Translation */}
                                        <p className="text-sm text-muted-foreground mb-4">
                                            {dhikr.french}
                                        </p>

                                        {/* Virtue */}
                                        <div className="flex items-center gap-2 text-xs text-gold-500 mb-4">
                                            <Heart className="w-4 h-4" />
                                            <span>{dhikr.virtue}</span>
                                        </div>

                                        {/* Counter */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-muted-foreground">
                                                    {progress} / {dhikr.repeat}
                                                </span>
                                                {isComplete && (
                                                    <span className="flex items-center gap-1 text-xs text-primary">
                                                        <Check className="w-4 h-4" />
                                                        Terminé
                                                    </span>
                                                )}
                                            </div>

                                            <button
                                                onClick={() => handleCount(index, dhikr.repeat)}
                                                disabled={isComplete}
                                                className={cn(
                                                    "btn min-w-[60px]",
                                                    isComplete
                                                        ? "bg-primary/20 text-primary cursor-not-allowed"
                                                        : "btn-primary"
                                                )}
                                            >
                                                {isComplete ? '✓' : '+1'}
                                            </button>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="mt-3 h-1 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary transition-all duration-300"
                                                style={{ width: `${(progress / dhikr.repeat) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}

                            {currentAzkar.length === 0 && (
                                <div className="text-center py-12">
                                    <p className="text-muted-foreground">Azkar non disponibles</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AppWrapper>
    );
}
