'use client';

import { useState, useEffect } from 'react';
import { MapPin, X, Search, Check, Globe } from 'lucide-react';
import { cn, storage, STORAGE_KEYS } from '@/lib/utils';

// Countries with capital cities for prayer times
export const COUNTRIES = [
    // Afrique de l'Ouest
    { country: 'Sénégal', city: 'Dakar', code: 'SN', flag: '🇸🇳' },
    { country: 'Côte d\'Ivoire', city: 'Abidjan', code: 'CI', flag: '🇨🇮' },
    { country: 'Mali', city: 'Bamako', code: 'ML', flag: '🇲🇱' },
    { country: 'Burkina Faso', city: 'Ouagadougou', code: 'BF', flag: '🇧🇫' },
    { country: 'Niger', city: 'Niamey', code: 'NE', flag: '🇳🇪' },
    { country: 'Togo', city: 'Lomé', code: 'TG', flag: '🇹🇬' },
    { country: 'Bénin', city: 'Cotonou', code: 'BJ', flag: '🇧🇯' },
    { country: 'Guinée', city: 'Conakry', code: 'GN', flag: '🇬🇳' },
    { country: 'Mauritanie', city: 'Nouakchott', code: 'MR', flag: '🇲🇷' },
    { country: 'Cameroun', city: 'Yaoundé', code: 'CM', flag: '🇨🇲' },
    { country: 'Tchad', city: 'N\'Djamena', code: 'TD', flag: '🇹🇩' },
    { country: 'Gabon', city: 'Libreville', code: 'GA', flag: '🇬🇦' },
    // Afrique du Nord
    { country: 'Maroc', city: 'Rabat', code: 'MA', flag: '🇲🇦' },
    { country: 'Algérie', city: 'Alger', code: 'DZ', flag: '🇩🇿' },
    { country: 'Tunisie', city: 'Tunis', code: 'TN', flag: '🇹🇳' },
    { country: 'Égypte', city: 'Le Caire', code: 'EG', flag: '🇪🇬' },
    // Europe
    { country: 'France', city: 'Paris', code: 'FR', flag: '🇫🇷' },
    { country: 'Belgique', city: 'Bruxelles', code: 'BE', flag: '🇧🇪' },
    { country: 'Suisse', city: 'Genève', code: 'CH', flag: '🇨🇭' },
    { country: 'Allemagne', city: 'Berlin', code: 'DE', flag: '🇩🇪' },
    { country: 'Royaume-Uni', city: 'Londres', code: 'GB', flag: '🇬🇧' },
    // Moyen-Orient
    { country: 'Arabie Saoudite', city: 'La Mecque', code: 'SA', flag: '🇸🇦' },
    { country: 'Émirats Arabes Unis', city: 'Dubaï', code: 'AE', flag: '🇦🇪' },
    { country: 'Qatar', city: 'Doha', code: 'QA', flag: '🇶🇦' },
    { country: 'Turquie', city: 'Istanbul', code: 'TR', flag: '🇹🇷' },
];

export interface LocationData {
    country: string;
    city: string;
    code: string;
    flag?: string;
}

interface LocationSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (location: LocationData) => void;
    currentLocation?: LocationData;
}

export function LocationSelector({ isOpen, onClose, onSelect, currentLocation }: LocationSelectorProps) {
    const [search, setSearch] = useState('');

    const filteredCountries = COUNTRIES.filter(loc =>
        loc.country.toLowerCase().includes(search.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-background w-full max-w-md max-h-[80vh] rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col">
                {/* Header - Fixed */}
                <div className="bg-background border-b border-card-border p-4 flex-shrink-0">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Globe className="w-5 h-5 text-primary" />
                            <h2 className="text-xl font-bold text-foreground">Choisir un pays</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-muted transition-colors"
                        >
                            <X className="w-5 h-5 text-muted-foreground" />
                        </button>
                    </div>

                    {/* Search - Fixed in header */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Rechercher un pays..."
                            className="input input-with-icon"
                            autoFocus
                        />
                    </div>
                </div>

                {/* Countries List - Scrollable */}
                <div className="overflow-y-auto flex-1 p-4">
                    <div className="space-y-2">
                        {filteredCountries.map((loc) => {
                            const isSelected = currentLocation?.code === loc.code;
                            return (
                                <button
                                    key={loc.code}
                                    onClick={() => {
                                        onSelect(loc);
                                        onClose();
                                    }}
                                    className={cn(
                                        "w-full flex items-center justify-between p-3 rounded-xl transition-colors",
                                        isSelected
                                            ? "bg-primary text-primary-foreground"
                                            : "hover:bg-muted bg-card border border-card-border"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{loc.flag}</span>
                                        <div className="text-left">
                                            <span className="font-medium block">{loc.country}</span>
                                            <span className={cn(
                                                "text-xs",
                                                isSelected ? "text-primary-foreground/70" : "text-muted-foreground"
                                            )}>
                                                Capitale: {loc.city}
                                            </span>
                                        </div>
                                    </div>
                                    {isSelected && <Check className="w-5 h-5" />}
                                </button>
                            );
                        })}
                    </div>

                    {filteredCountries.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            Aucun pays trouvé
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Hook to manage location state
export function useLocation() {
    const [location, setLocation] = useState<LocationData>({
        country: 'Sénégal',
        city: 'Dakar',
        code: 'SN',
        flag: '🇸🇳'
    });

    useEffect(() => {
        const saved = storage.get<LocationData | null>(STORAGE_KEYS.LOCATION, null);
        if (saved) {
            setLocation(saved);
        }
    }, []);

    const updateLocation = (newLocation: LocationData) => {
        setLocation(newLocation);
        storage.set(STORAGE_KEYS.LOCATION, newLocation);
    };

    return { location, updateLocation };
}
