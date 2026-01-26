'use client';

import { useEffect, useState } from 'react';
import { MapPin, Moon, Sun, ChevronDown, X, Search } from 'lucide-react';
import { cn, storage, STORAGE_KEYS } from '@/lib/utils';

// List of cities with coordinates
const CITIES = [
    // Sénégal
    { name: 'Dakar', country: 'Sénégal', lat: 14.6928, lng: -17.4467 },
    { name: 'Thiès', country: 'Sénégal', lat: 14.7910, lng: -16.9359 },
    { name: 'Touba', country: 'Sénégal', lat: 14.8667, lng: -15.8833 },
    { name: 'Saint-Louis', country: 'Sénégal', lat: 16.0179, lng: -16.4897 },
    // Mali
    { name: 'Bamako', country: 'Mali', lat: 12.6392, lng: -8.0029 },
    // Côte d'Ivoire
    { name: 'Abidjan', country: "Côte d'Ivoire", lat: 5.3600, lng: -4.0083 },
    { name: 'Bouaké', country: "Côte d'Ivoire", lat: 7.6833, lng: -5.0167 },
    // Togo
    { name: 'Lomé', country: 'Togo', lat: 6.1256, lng: 1.2254 },
    { name: 'Kara', country: 'Togo', lat: 9.5511, lng: 1.1861 },
    // Bénin
    { name: 'Cotonou', country: 'Bénin', lat: 6.3703, lng: 2.3912 },
    { name: 'Porto-Novo', country: 'Bénin', lat: 6.4969, lng: 2.6289 },
    // Burkina Faso
    { name: 'Ouagadougou', country: 'Burkina Faso', lat: 12.3714, lng: -1.5197 },
    // Niger
    { name: 'Niamey', country: 'Niger', lat: 13.5116, lng: 2.1254 },
    // Guinée
    { name: 'Conakry', country: 'Guinée', lat: 9.6412, lng: -13.5784 },
    // Cameroun
    { name: 'Douala', country: 'Cameroun', lat: 4.0511, lng: 9.7679 },
    { name: 'Yaoundé', country: 'Cameroun', lat: 3.8480, lng: 11.5021 },
    // Gabon
    { name: 'Libreville', country: 'Gabon', lat: 0.4162, lng: 9.4673 },
    // Europe
    { name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522 },
    { name: 'Lyon', country: 'France', lat: 45.7640, lng: 4.8357 },
    { name: 'Marseille', country: 'France', lat: 43.2965, lng: 5.3698 },
    { name: 'Bruxelles', country: 'Belgique', lat: 50.8503, lng: 4.3517 },
];

interface LocationData {
    city: string;
    country: string;
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
        // Check theme
        const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        setIsDark(darkModeMediaQuery.matches);
        const savedTheme = localStorage.getItem('ramadan_theme');
        if (savedTheme) {
            setIsDark(savedTheme === 'dark');
            document.documentElement.classList.toggle('dark', savedTheme === 'dark');
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

    const selectLocation = (loc: typeof CITIES[0]) => {
        const locationData: LocationData = {
            city: loc.name,
            country: loc.country,
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

    const filteredCities = CITIES.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.country.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const displayCity = currentLocation
        ? `${currentLocation.city}, ${currentLocation.country}`
        : city || 'Dakar, Sénégal';

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
                            <MapPin className="w-4 h-4" />
                            <span className="truncate max-w-[150px]">{displayCity}</span>
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
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={() => setShowLocationModal(false)}>
                    <div
                        className="w-full max-w-lg bg-card rounded-t-3xl p-4 max-h-[70vh] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Choisir une ville</h3>
                            <button onClick={() => setShowLocationModal(false)} className="p-2 rounded-full hover:bg-muted">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Search */}
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Rechercher..."
                                className="w-full pl-10 pr-4 py-2.5 bg-muted rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                autoFocus
                            />
                        </div>

                        {/* Cities List */}
                        <div className="overflow-y-auto max-h-[50vh] space-y-1">
                            {filteredCities.map((loc) => (
                                <button
                                    key={`${loc.name}-${loc.country}`}
                                    onClick={() => selectLocation(loc)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors",
                                        currentLocation?.city === loc.name
                                            ? "bg-primary text-primary-foreground"
                                            : "hover:bg-muted"
                                    )}
                                >
                                    <MapPin className="w-4 h-4 flex-shrink-0" />
                                    <div className="min-w-0">
                                        <p className="font-medium text-sm truncate">{loc.name}</p>
                                        <p className={cn(
                                            "text-xs truncate",
                                            currentLocation?.city === loc.name ? "opacity-80" : "text-muted-foreground"
                                        )}>{loc.country}</p>
                                    </div>
                                </button>
                            ))}
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
