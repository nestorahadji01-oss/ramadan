'use client';

import { useEffect, useState } from 'react';
import { MapPin, Moon, Sun, ChevronDown, X, Search, Check, Globe } from 'lucide-react';
import { cn, storage, STORAGE_KEYS } from '@/lib/utils';

// Countries with capital cities for prayer times
const COUNTRIES = [
    // Afrique de l'Ouest
    { country: 'Sénégal', city: 'Dakar', code: 'SN', flag: '🇸🇳', lat: 14.6928, lng: -17.4467 },
    { country: 'Côte d\'Ivoire', city: 'Abidjan', code: 'CI', flag: '🇨🇮', lat: 5.3600, lng: -4.0083 },
    { country: 'Mali', city: 'Bamako', code: 'ML', flag: '🇲🇱', lat: 12.6392, lng: -8.0029 },
    { country: 'Burkina Faso', city: 'Ouagadougou', code: 'BF', flag: '🇧🇫', lat: 12.3714, lng: -1.5197 },
    { country: 'Niger', city: 'Niamey', code: 'NE', flag: '🇳🇪', lat: 13.5116, lng: 2.1254 },
    { country: 'Togo', city: 'Lomé', code: 'TG', flag: '🇹🇬', lat: 6.1256, lng: 1.2254 },
    { country: 'Bénin', city: 'Cotonou', code: 'BJ', flag: '🇧🇯', lat: 6.3703, lng: 2.3912 },
    { country: 'Guinée', city: 'Conakry', code: 'GN', flag: '🇬🇳', lat: 9.6412, lng: -13.5784 },
    { country: 'Mauritanie', city: 'Nouakchott', code: 'MR', flag: '🇲🇷', lat: 18.0735, lng: -15.9582 },
    { country: 'Cameroun', city: 'Yaoundé', code: 'CM', flag: '🇨🇲', lat: 3.8480, lng: 11.5021 },
    { country: 'Tchad', city: 'N\'Djamena', code: 'TD', flag: '🇹🇩', lat: 12.1348, lng: 15.0557 },
    { country: 'Gabon', city: 'Libreville', code: 'GA', flag: '🇬🇦', lat: 0.4162, lng: 9.4673 },
    // Afrique du Nord
    { country: 'Maroc', city: 'Rabat', code: 'MA', flag: '🇲🇦', lat: 34.0209, lng: -6.8416 },
    { country: 'Algérie', city: 'Alger', code: 'DZ', flag: '🇩🇿', lat: 36.7538, lng: 3.0588 },
    { country: 'Tunisie', city: 'Tunis', code: 'TN', flag: '🇹🇳', lat: 36.8065, lng: 10.1815 },
    { country: 'Égypte', city: 'Le Caire', code: 'EG', flag: '🇪🇬', lat: 30.0444, lng: 31.2357 },
    // Europe
    { country: 'France', city: 'Paris', code: 'FR', flag: '🇫🇷', lat: 48.8566, lng: 2.3522 },
    { country: 'Belgique', city: 'Bruxelles', code: 'BE', flag: '🇧🇪', lat: 50.8503, lng: 4.3517 },
    { country: 'Suisse', city: 'Genève', code: 'CH', flag: '🇨🇭', lat: 46.2044, lng: 6.1432 },
    { country: 'Allemagne', city: 'Berlin', code: 'DE', flag: '🇩🇪', lat: 52.5200, lng: 13.4050 },
    { country: 'Royaume-Uni', city: 'Londres', code: 'GB', flag: '🇬🇧', lat: 51.5074, lng: -0.1278 },
    // Moyen-Orient
    { country: 'Arabie Saoudite', city: 'La Mecque', code: 'SA', flag: '🇸🇦', lat: 21.4225, lng: 39.8262 },
    { country: 'Émirats Arabes Unis', city: 'Dubaï', code: 'AE', flag: '🇦🇪', lat: 25.2048, lng: 55.2708 },
    { country: 'Qatar', city: 'Doha', code: 'QA', flag: '🇶🇦', lat: 25.2854, lng: 51.5310 },
    { country: 'Turquie', city: 'Istanbul', code: 'TR', flag: '🇹🇷', lat: 41.0082, lng: 28.9784 },
];

interface LocationData {
    city: string;
    country: string;
    code?: string;
    flag?: string;
    lat: number;
    lng: number;
}

interface HeaderProps {
    city?: string;
    nextPrayer?: {
        name: string;
        time: string;
        countdown: string;
    };
    hijriDate?: {
        day: number;
        month: string;
        year: number;
    };
    gregorianDate?: string;
    onLocationChange?: (location: LocationData) => void;
}

export function Header({ city, nextPrayer, hijriDate, gregorianDate, onLocationChange }: HeaderProps) {
    const [isDark, setIsDark] = useState(false);
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);

    useEffect(() => {
        // Check saved theme first, then system preference
        const savedTheme = localStorage.getItem('ramadan_theme');
        if (savedTheme) {
            const isDarkMode = savedTheme === 'dark';
            setIsDark(isDarkMode);
            document.documentElement.classList.toggle('dark', isDarkMode);
        } else {
            const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            setIsDark(darkModeMediaQuery.matches);
            document.documentElement.classList.toggle('dark', darkModeMediaQuery.matches);
        }

        // Load saved location
        const savedLocation = storage.get<LocationData | null>(STORAGE_KEYS.LOCATION, null);
        if (savedLocation) {
            setCurrentLocation(savedLocation);
        }
    }, []);

    const toggleTheme = () => {
        const newIsDark = !isDark;
        setIsDark(newIsDark);
        document.documentElement.classList.toggle('dark', newIsDark);
        localStorage.setItem('ramadan_theme', newIsDark ? 'dark' : 'light');
    };

    const selectLocation = (loc: typeof COUNTRIES[0]) => {
        const locationData: LocationData = {
            city: loc.city,
            country: loc.country,
            code: loc.code,
            flag: loc.flag,
            lat: loc.lat,
            lng: loc.lng,
        };
        setCurrentLocation(locationData);
        storage.set(STORAGE_KEYS.LOCATION, locationData);
        setShowLocationModal(false);
        setSearchQuery('');
        onLocationChange?.(locationData);
        // Reload page to refresh prayer times
        window.location.reload();
    };

    const filteredCountries = COUNTRIES.filter(c =>
        c.country.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const displayLocation = currentLocation
        ? `${currentLocation.flag || ''} ${currentLocation.country}`
        : city || '🇸🇳 Sénégal';

    return (
        <>
            <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-card-border safe-top w-full">
                <div className="px-4 py-3 w-full max-w-full">
                    {/* Top Row: Location & Theme Toggle */}
                    <div className="flex items-center justify-between mb-2">
                        <button
                            onClick={() => setShowLocationModal(true)}
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <span className="truncate max-w-[180px]">{displayLocation}</span>
                            <ChevronDown className="w-3 h-3" />
                        </button>

                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-muted transition-colors"
                            aria-label="Toggle theme"
                        >
                            {isDark ? (
                                <Sun className="w-5 h-5 text-gold-400" />
                            ) : (
                                <Moon className="w-5 h-5 text-emerald-700" />
                            )}
                        </button>
                    </div>

                    {/* Date Display */}
                    <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                            {hijriDate && (
                                <p className="text-lg font-semibold text-foreground font-arabic truncate" dir="rtl">
                                    {hijriDate.day} {hijriDate.month} {hijriDate.year}
                                </p>
                            )}
                            <p className="text-sm text-muted-foreground truncate">
                                {gregorianDate || new Date().toLocaleDateString('fr-FR', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long',
                                })}
                            </p>
                        </div>

                        {/* Next Prayer Badge */}
                        {nextPrayer && (
                            <div className="bg-primary/10 border border-primary/20 rounded-xl px-3 py-2 text-right flex-shrink-0 ml-2">
                                <p className="text-xs text-muted-foreground">{nextPrayer.name}</p>
                                <p className="text-lg font-bold text-primary">{nextPrayer.time}</p>
                                <p className="text-xs text-gold-500 font-medium">{nextPrayer.countdown}</p>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Location Modal */}
            {showLocationModal && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setShowLocationModal(false)}
                    />
                    <div
                        className="relative w-full max-w-lg bg-card rounded-t-3xl sm:rounded-3xl max-h-[80vh] overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header - Fixed */}
                        <div className="p-4 border-b border-card-border flex-shrink-0">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Globe className="w-5 h-5 text-primary" />
                                    <h3 className="text-lg font-semibold">Choisir un pays</h3>
                                </div>
                                <button onClick={() => setShowLocationModal(false)} className="p-2 rounded-full hover:bg-muted">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Search - Fixed in header */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Rechercher un pays..."
                                    className="input input-with-icon"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Countries List - Scrollable */}
                        <div className="overflow-y-auto flex-1 p-4 space-y-2">
                            {filteredCountries.map((loc) => {
                                const isSelected = currentLocation?.code === loc.code;
                                return (
                                    <button
                                        key={loc.code}
                                        onClick={() => selectLocation(loc)}
                                        className={cn(
                                            "w-full flex items-center justify-between p-3 rounded-xl text-left transition-colors",
                                            isSelected
                                                ? "bg-primary text-primary-foreground"
                                                : "hover:bg-muted bg-background border border-card-border"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{loc.flag}</span>
                                            <div>
                                                <p className="font-medium text-sm">{loc.country}</p>
                                                <p className={cn(
                                                    "text-xs",
                                                    isSelected ? "opacity-80" : "text-muted-foreground"
                                                )}>Capitale: {loc.city}</p>
                                            </div>
                                        </div>
                                        {isSelected && <Check className="w-5 h-5" />}
                                    </button>
                                );
                            })}

                            {filteredCountries.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    Aucun pays trouvé
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

// Compact header for inner pages
export function CompactHeader({
    title,
    subtitle,
    rightElement
}: {
    title: string;
    subtitle?: string;
    rightElement?: React.ReactNode;
}) {
    return (
        <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-card-border safe-top w-full">
            <div className="px-4 py-4 flex items-center justify-between w-full max-w-full">
                <div className="min-w-0 flex-1">
                    <h1 className="text-xl font-bold text-foreground truncate">{title}</h1>
                    {subtitle && (
                        <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
                    )}
                </div>
                {rightElement}
            </div>
        </header>
    );
}
