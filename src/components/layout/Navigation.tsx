'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home,
    Clock,
    BookOpen,
    Heart,
    Calculator,
    Calendar,
    BookMarked,
    Radio,
    Scroll,
    MoreHorizontal,
    Star,
    Trophy
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
    href: string;
    icon: React.ReactNode;
    label: string;
}

const mainNavItems: NavItem[] = [
    { href: '/', icon: <Home className="w-6 h-6" />, label: 'Accueil' },
    { href: '/prayer-times', icon: <Clock className="w-6 h-6" />, label: 'Prières' },
    { href: '/tasbih', icon: <Heart className="w-6 h-6" />, label: 'Tasbih' },
    { href: '/quran', icon: <BookOpen className="w-6 h-6" />, label: 'Coran' },
    { href: '/more', icon: <MoreHorizontal className="w-6 h-6" />, label: 'Plus' },
];

const allNavItems: NavItem[] = [
    { href: '/', icon: <Home className="w-5 h-5" />, label: 'Accueil' },
    { href: '/prayer-times', icon: <Clock className="w-5 h-5" />, label: 'Heures de Prière' },
    { href: '/quran', icon: <BookOpen className="w-5 h-5" />, label: 'Coran' },
    { href: '/tasbih', icon: <Heart className="w-5 h-5" />, label: 'Tasbih' },
    { href: '/azkar', icon: <BookMarked className="w-5 h-5" />, label: 'Azkar' },
    { href: '/names', icon: <Star className="w-5 h-5" />, label: '99 Noms d\'Allah' },
    { href: '/challenges', icon: <Trophy className="w-5 h-5" />, label: 'Défis du Jour' },
    { href: '/zakat', icon: <Calculator className="w-5 h-5" />, label: 'Calculateur Zakat' },
    { href: '/planner', icon: <Calendar className="w-5 h-5" />, label: 'Planner Ramadan' },
    { href: '/library', icon: <BookOpen className="w-5 h-5" />, label: 'Bibliothèque' },
    { href: '/radio', icon: <Radio className="w-5 h-5" />, label: 'Radio Coran' },
    { href: '/hadith', icon: <Scroll className="w-5 h-5" />, label: 'Hadiths' },
];

export function MobileNav() {
    const pathname = usePathname();

    return (
        <nav className="mobile-nav">
            <div className="flex items-center justify-around px-2">
                {mainNavItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'nav-item flex-1',
                                isActive && 'active'
                            )}
                        >
                            <span className={cn(
                                'p-2 rounded-xl transition-colors',
                                isActive && 'bg-primary/10'
                            )}>
                                {item.icon}
                            </span>
                            <span className="text-[11px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="hidden lg:flex flex-col w-64 h-screen bg-card border-r border-card-border p-4 sticky top-0">
            {/* Logo */}
            <div className="flex items-center gap-3 px-3 py-4 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-gold-500 to-gold-400 rounded-xl flex items-center justify-center">
                    <span className="text-emerald-950 font-bold text-lg">ر</span>
                </div>
                <div>
                    <h1 className="font-semibold text-foreground">Ramadan</h1>
                    <p className="text-xs text-muted-foreground">Companion</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1">
                {allNavItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm',
                                isActive
                                    ? 'bg-primary text-primary-foreground font-medium'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            )}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="pt-4 border-t border-card-border">
                <p className="text-xs text-muted-foreground text-center">
                    Version 1.0.0
                </p>
            </div>
        </aside>
    );
}

export function MoreMenu() {
    const pathname = usePathname();
    const moreItems = allNavItems.filter(
        item => !mainNavItems.some(nav => nav.href === item.href)
    );

    return (
        <div className="min-h-screen bg-background safe-bottom">
            <div className="p-4">
                <h1 className="text-2xl font-bold text-foreground mb-6">Plus d&apos;options</h1>

                <div className="grid grid-cols-2 gap-3">
                    {moreItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'card flex flex-col items-center gap-3 py-6',
                                    isActive && 'border-primary bg-primary/5'
                                )}
                            >
                                <div className={cn(
                                    'w-12 h-12 rounded-xl flex items-center justify-center',
                                    isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                                )}>
                                    {item.icon}
                                </div>
                                <span className="text-sm font-medium text-center">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
