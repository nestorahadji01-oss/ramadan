'use client';

import { useState, useEffect } from 'react';
import AppWrapper from '@/components/AppWrapper';
import { CompactHeader } from '@/components/layout/Header';
import { Calendar, Check, Plus, Trash2, BookOpen, Target, Star } from 'lucide-react';
import { cn, storage } from '@/lib/utils';

interface PlannerDay {
    date: string;
    suhoorTime: string;
    iftarTime: string;
    tasks: {
        id: string;
        text: string;
        completed: boolean;
    }[];
    quranPages: number;
    quranTarget: number;
    goodDeeds: number;
    notes: string;
}

const defaultTasks = [
    { id: '1', text: 'Prière de Fajr à l\'heure', completed: false },
    { id: '2', text: 'Azkar du matin', completed: false },
    { id: '3', text: 'Lecture du Coran', completed: false },
    { id: '4', text: 'Azkar du soir', completed: false },
    { id: '5', text: 'Prière de Taraweeh', completed: false },
    { id: '6', text: 'Dua avant l\'Iftar', completed: false },
];

export default function PlannerPage() {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [plannerData, setPlannerData] = useState<Record<string, PlannerDay>>({});
    const [newTask, setNewTask] = useState('');

    // Load data on mount
    useEffect(() => {
        const saved = storage.get<Record<string, PlannerDay>>('ramadan_planner_data', {});
        setPlannerData(saved);
    }, []);

    // Save data when it changes
    useEffect(() => {
        if (Object.keys(plannerData).length > 0) {
            storage.set('ramadan_planner_data', plannerData);
        }
    }, [plannerData]);

    // Get or create day data
    const getDayData = (): PlannerDay => {
        if (plannerData[selectedDate]) {
            return plannerData[selectedDate];
        }
        return {
            date: selectedDate,
            suhoorTime: '05:00',
            iftarTime: '18:30',
            tasks: [...defaultTasks],
            quranPages: 0,
            quranTarget: 20,
            goodDeeds: 0,
            notes: '',
        };
    };

    const dayData = getDayData();

    const updateDayData = (updates: Partial<PlannerDay>) => {
        setPlannerData(prev => ({
            ...prev,
            [selectedDate]: { ...dayData, ...updates },
        }));
    };

    const toggleTask = (taskId: string) => {
        const updatedTasks = dayData.tasks.map(task =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
        );
        updateDayData({ tasks: updatedTasks });
    };

    const addTask = () => {
        if (!newTask.trim()) return;
        const updatedTasks = [
            ...dayData.tasks,
            { id: Date.now().toString(), text: newTask.trim(), completed: false },
        ];
        updateDayData({ tasks: updatedTasks });
        setNewTask('');
    };

    const deleteTask = (taskId: string) => {
        const updatedTasks = dayData.tasks.filter(task => task.id !== taskId);
        updateDayData({ tasks: updatedTasks });
    };

    const completedTasks = dayData.tasks.filter(t => t.completed).length;
    const totalTasks = dayData.tasks.length;
    const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const quranProgress = dayData.quranTarget > 0
        ? Math.min((dayData.quranPages / dayData.quranTarget) * 100, 100)
        : 0;

    return (
        <AppWrapper>
            <div className="min-h-screen bg-background safe-bottom">
                <CompactHeader
                    title="Planner Ramadan"
                    subtitle="مخطط رمضان"
                />

                <div className="p-4 space-y-4">
                    {/* Date Selector */}
                    <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-primary" />
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="input flex-1"
                        />
                    </div>

                    {/* Progress Overview */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="card text-center">
                            <div className="text-2xl font-bold text-primary">{completedTasks}/{totalTasks}</div>
                            <div className="text-xs text-muted-foreground">Tâches</div>
                        </div>
                        <div className="card text-center">
                            <div className="text-2xl font-bold text-emerald-600">{dayData.quranPages}</div>
                            <div className="text-xs text-muted-foreground">Pages Coran</div>
                        </div>
                        <div className="card text-center">
                            <div className="text-2xl font-bold text-gold-500">{dayData.goodDeeds}</div>
                            <div className="text-xs text-muted-foreground">Bonnes actions</div>
                        </div>
                    </div>

                    {/* Daily Checklist */}
                    <section>
                        <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-3">
                            <Target className="w-5 h-5 text-primary" />
                            Objectifs du jour
                        </h3>

                        <div className="card">
                            {/* Progress bar */}
                            <div className="mb-4">
                                <div className="flex justify-between text-sm text-muted-foreground mb-1">
                                    <span>Progression</span>
                                    <span>{Math.round(taskProgress)}%</span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all duration-300"
                                        style={{ width: `${taskProgress}%` }}
                                    />
                                </div>
                            </div>

                            {/* Tasks */}
                            <div className="space-y-2">
                                {dayData.tasks.map((task) => (
                                    <div
                                        key={task.id}
                                        className={cn(
                                            "flex items-center gap-3 p-3 rounded-xl transition-colors",
                                            task.completed ? "bg-primary/10" : "bg-muted"
                                        )}
                                    >
                                        <button
                                            onClick={() => toggleTask(task.id)}
                                            className={cn(
                                                "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                                                task.completed
                                                    ? "bg-primary border-primary text-white"
                                                    : "border-muted-foreground"
                                            )}
                                        >
                                            {task.completed && <Check className="w-4 h-4" />}
                                        </button>
                                        <span className={cn(
                                            "flex-1 text-sm",
                                            task.completed && "line-through text-muted-foreground"
                                        )}>
                                            {task.text}
                                        </span>
                                        <button
                                            onClick={() => deleteTask(task.id)}
                                            className="p-1 text-muted-foreground hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Add task */}
                            <div className="flex gap-2 mt-3">
                                <input
                                    type="text"
                                    value={newTask}
                                    onChange={(e) => setNewTask(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addTask()}
                                    placeholder="Ajouter une tâche..."
                                    className="input flex-1"
                                />
                                <button onClick={addTask} className="btn btn-primary">
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Quran Tracker */}
                    <section>
                        <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-3">
                            <BookOpen className="w-5 h-5 text-emerald-600" />
                            Lecture du Coran
                        </h3>

                        <div className="card">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm text-muted-foreground">Pages lues aujourd&apos;hui</span>
                                <span className="text-lg font-bold text-primary">
                                    {dayData.quranPages} / {dayData.quranTarget}
                                </span>
                            </div>

                            <div className="h-2 bg-muted rounded-full overflow-hidden mb-4">
                                <div
                                    className="h-full bg-emerald-500 transition-all duration-300"
                                    style={{ width: `${quranProgress}%` }}
                                />
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => updateDayData({ quranPages: Math.max(0, dayData.quranPages - 1) })}
                                    className="btn btn-ghost flex-1"
                                >
                                    -1
                                </button>
                                <button
                                    onClick={() => updateDayData({ quranPages: dayData.quranPages + 1 })}
                                    className="btn btn-primary flex-1"
                                >
                                    +1 Page
                                </button>
                                <button
                                    onClick={() => updateDayData({ quranPages: dayData.quranPages + 5 })}
                                    className="btn btn-primary flex-1"
                                >
                                    +5
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Good Deeds Counter */}
                    <section>
                        <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-3">
                            <Star className="w-5 h-5 text-gold-500" />
                            Bonnes actions
                        </h3>

                        <div className="card">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Compteur</span>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => updateDayData({ goodDeeds: Math.max(0, dayData.goodDeeds - 1) })}
                                        className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg font-bold"
                                    >
                                        -
                                    </button>
                                    <span className="text-3xl font-bold text-gold-500 w-16 text-center">
                                        {dayData.goodDeeds}
                                    </span>
                                    <button
                                        onClick={() => updateDayData({ goodDeeds: dayData.goodDeeds + 1 })}
                                        className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-lg font-bold"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Notes */}
                    <section>
                        <h3 className="text-lg font-semibold text-foreground mb-3">Notes du jour</h3>
                        <textarea
                            value={dayData.notes}
                            onChange={(e) => updateDayData({ notes: e.target.value })}
                            placeholder="Réflexions, invocations, objectifs..."
                            className="input min-h-[100px] resize-none"
                        />
                    </section>
                </div>
            </div>
        </AppWrapper>
    );
}
