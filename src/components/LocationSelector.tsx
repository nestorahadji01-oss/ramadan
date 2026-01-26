'use client';

import { useState, useEffect } from 'react';
import { MapPin, X, Search, Check } from 'lucide-react';
import { cn, storage, STORAGE_KEYS } from '@/lib/utils';

// Countries with major cities for prayer times
export const LOCATIONS = [
    // Afrique de l'Ouest
    { country: 'Sénégal', city: 'Dakar', code: 'SN' },
    { country: 'Sénégal', city: 'Saint-Louis', code: 'SN' },
    { country: 'Sénégal', city: 'Thiès', code: 'SN' },
    { country: 'Côte d\'Ivoire', city: 'Abidjan', code: 'CI' },
    { country: 'Côte d\'Ivoire', city: 'Bouaké', code: 'CI' },
    { country: 'Mali', city: 'Bamako', code: 'ML' },
    { country: 'Mali', city: 'Tombouctou', code: 'ML' },
    { country: 'Burkina Faso', city: 'Ouagadougou', code: 'BF' },
    { country: 'Burkina Faso', city: 'Bobo-Dioulasso', code: 'BF' },
    { country: 'Niger', city: 'Niamey', code: 'NE' },
    { country: 'Niger', city: 'Zinder', code: 'NE' },
    { country: 'Togo', city: 'Lomé', code: 'TG' },
    { country: 'Bénin', city: 'Cotonou', code: 'BJ' },
    { country: 'Bénin', city: 'Porto-Novo', code: 'BJ' },
    { country: 'Guinée', city: 'Conakry', code: 'GN' },
    { country: 'Guinée', city: 'Labé', code: 'GN' },
    { country: 'Mauritanie', city: 'Nouakchott', code: 'MR' },
    { country: 'Cameroun', city: 'Douala', code: 'CM' },
    { country: 'Cameroun', city: 'Yaoundé', code: 'CM' },
    { country: 'Tchad', city: 'N\'Djamena', code: 'TD' },
    { country: 'Gabon', city: 'Libreville', code: 'GA' },
    // Afrique du Nord
    { country: 'Maroc', city: 'Casablanca', code: 'MA' },
    { country: 'Maroc', city: 'Rabat', code: 'MA' },
    { country: 'Maroc', city: 'Marrakech', code: 'MA' },
    { country: 'Algérie', city: 'Alger', code: 'DZ' },
    { country: 'Tunisie', city: 'Tunis', code: 'TN' },
    // Europe
    { country: 'France', city: 'Paris', code: 'FR' },
    { country: 'France', city: 'Lyon', code: 'FR' },
    { country: 'France', city: 'Marseille', code: 'FR' },
    { country: 'Belgique', city: 'Bruxelles', code: 'BE' },
    { country: 'Belgique', city: 'Anvers', code: 'BE' },
    { country: 'Suisse', city: 'Genève', code: 'CH' },
    // Moyen-Orient
    { country: 'Arabie Saoudite', city: 'La Mecque', code: 'SA' },
    { country: 'Arabie Saoudite', city: 'Médine', code: 'SA' },
    { country: 'Émirats', city: 'Dubaï', code: 'AE' },
];

export interface LocationData {
    country: string;
    city: string;
    code: string;
}

interface LocationSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (location: LocationData) => void;
    currentLocation?: LocationData;
}

export function LocationSelector({ isOpen, onClose, onSelect, currentLocation }: LocationSelectorProps) {
    const [search, setSearch] = useState('');

    const filteredLocations = LOCATIONS.filter(loc =>
        loc.city.toLowerCase().includes(search.toLowerCase()) ||
        loc.country.toLowerCase().includes(search.toLowerCase())
    );

    // Group by country
    const groupedLocations = filteredLocations.reduce((acc, loc) => {
        if (!acc[loc.country]) acc[loc.country] = [];
        acc[loc.country].push(loc);
        return acc;
    }, {} as Record<string, LocationData[]>);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-background w-full max-w-md max-h-[80vh] rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 bg-background border-b border-card-border p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-xl font-bold text-foreground">Choisir une ville</h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-muted transition-colors"
                        >
                            <X className="w-5 h-5 text-muted-foreground" />
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Rechercher une ville ou un pays..."
                            className="input pl-10"
                            autoFocus
                        />
                    </div>
                </div>

                {/* Locations List */}
                <div className="overflow-y-auto max-h-[60vh] p-4">
                    {Object.entries(groupedLocations).map(([country, cities]) => (
                        <div key={country} className="mb-4">
                            <h3 className="text-sm font-semibold text-muted-foreground mb-2 sticky top-0 bg-background">
                                {country}
                            </h3>
                            <div className="space-y-1">
                                {cities.map((loc) => {
                                    const isSelected = currentLocation?.city === loc.city && currentLocation?.country === loc.country;
                                    return (
                                        <button
                                            key={`${loc.country}-${loc.city}`}
                                            onClick={() => {
                                                onSelect(loc);
                                                onClose();
                                            }}
                                            className={cn(
                                                "w-full flex items-center justify-between p-3 rounded-xl transition-colors",
                                                isSelected
                                                    ? "bg-primary text-primary-foreground"
                                                    : "hover:bg-muted"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <MapPin className="w-4 h-4" />
                                                <span className="font-medium">{loc.city}</span>
                                            </div>
                                            {isSelected && <Check className="w-5 h-5" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {Object.keys(groupedLocations).length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            Aucune ville trouvée
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
        code: 'SN'
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
