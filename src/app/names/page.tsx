'use client';

import { useState } from 'react';
import AppWrapper from '@/components/AppWrapper';
import { CompactHeader } from '@/components/layout/Header';
import { Search, Volume2, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

// The 99 Names of Allah with French translations
const namesOfAllah = [
    { number: 1, arabic: 'الرَّحْمَنُ', transliteration: 'Ar-Rahman', french: 'Le Tout Miséricordieux' },
    { number: 2, arabic: 'الرَّحِيمُ', transliteration: 'Ar-Rahim', french: 'Le Très Miséricordieux' },
    { number: 3, arabic: 'الْمَلِكُ', transliteration: 'Al-Malik', french: 'Le Roi, Le Souverain' },
    { number: 4, arabic: 'الْقُدُّوسُ', transliteration: 'Al-Quddus', french: 'Le Saint, Le Pur' },
    { number: 5, arabic: 'السَّلَامُ', transliteration: 'As-Salam', french: 'La Paix, La Sécurité' },
    { number: 6, arabic: 'الْمُؤْمِنُ', transliteration: 'Al-Mu\'min', french: 'Le Fidèle, Le Sécurisant' },
    { number: 7, arabic: 'الْمُهَيْمِنُ', transliteration: 'Al-Muhaymin', french: 'Le Dominateur Suprême' },
    { number: 8, arabic: 'الْعَزِيزُ', transliteration: 'Al-Aziz', french: 'Le Tout Puissant' },
    { number: 9, arabic: 'الْجَبَّارُ', transliteration: 'Al-Jabbar', french: 'Celui qui contraint' },
    { number: 10, arabic: 'الْمُتَكَبِّرُ', transliteration: 'Al-Mutakabbir', french: 'Le Superbe, L\'Orgueilleux' },
    { number: 11, arabic: 'الْخَالِقُ', transliteration: 'Al-Khaliq', french: 'Le Créateur' },
    { number: 12, arabic: 'الْبَارِئُ', transliteration: 'Al-Bari', french: 'Le Producteur' },
    { number: 13, arabic: 'الْمُصَوِّرُ', transliteration: 'Al-Musawwir', french: 'Le Façonneur' },
    { number: 14, arabic: 'الْغَفَّارُ', transliteration: 'Al-Ghaffar', french: 'Le Très Pardonnant' },
    { number: 15, arabic: 'الْقَهَّارُ', transliteration: 'Al-Qahhar', french: 'Le Dominateur Suprême' },
    { number: 16, arabic: 'الْوَهَّابُ', transliteration: 'Al-Wahhab', french: 'Le Donateur Généreux' },
    { number: 17, arabic: 'الرَّزَّاقُ', transliteration: 'Ar-Razzaq', french: 'Le Pourvoyeur' },
    { number: 18, arabic: 'الْفَتَّاحُ', transliteration: 'Al-Fattah', french: 'Le Juge Suprême' },
    { number: 19, arabic: 'اَلْعَلِيْمُ', transliteration: 'Al-Alim', french: 'L\'Omniscient' },
    { number: 20, arabic: 'الْقَابِضُ', transliteration: 'Al-Qabid', french: 'Celui qui retient' },
    { number: 21, arabic: 'الْبَاسِطُ', transliteration: 'Al-Basit', french: 'Celui qui étend' },
    { number: 22, arabic: 'الْخَافِضُ', transliteration: 'Al-Khafid', french: 'Celui qui abaisse' },
    { number: 23, arabic: 'الرَّافِعُ', transliteration: 'Ar-Rafi', french: 'Celui qui élève' },
    { number: 24, arabic: 'الْمُعِزُّ', transliteration: 'Al-Muizz', french: 'Celui qui donne puissance' },
    { number: 25, arabic: 'المُذِلُّ', transliteration: 'Al-Mudhill', french: 'Celui qui humilie' },
    { number: 26, arabic: 'السَّمِيعُ', transliteration: 'As-Sami', french: 'L\'Audient' },
    { number: 27, arabic: 'الْبَصِيرُ', transliteration: 'Al-Basir', french: 'Le Clairvoyant' },
    { number: 28, arabic: 'الْحَكَمُ', transliteration: 'Al-Hakam', french: 'Le Juge' },
    { number: 29, arabic: 'الْعَدْلُ', transliteration: 'Al-Adl', french: 'Le Juste' },
    { number: 30, arabic: 'اللَّطِيفُ', transliteration: 'Al-Latif', french: 'Le Subtil Bienveillant' },
    { number: 31, arabic: 'الْخَبِيرُ', transliteration: 'Al-Khabir', french: 'Le Parfaitement Informé' },
    { number: 32, arabic: 'الْحَلِيمُ', transliteration: 'Al-Halim', french: 'Le Longanime' },
    { number: 33, arabic: 'الْعَظِيمُ', transliteration: 'Al-Azim', french: 'L\'Immense' },
    { number: 34, arabic: 'الْغَفُورُ', transliteration: 'Al-Ghafur', french: 'Le Tout Pardonnant' },
    { number: 35, arabic: 'الشَّكُورُ', transliteration: 'Ash-Shakur', french: 'Le Très Reconnaissant' },
    { number: 36, arabic: 'الْعَلِيُّ', transliteration: 'Al-Ali', french: 'Le Très Haut' },
    { number: 37, arabic: 'الْكَبِيرُ', transliteration: 'Al-Kabir', french: 'L\'Infiniment Grand' },
    { number: 38, arabic: 'الْحَفِيظُ', transliteration: 'Al-Hafiz', french: 'Le Gardien' },
    { number: 39, arabic: 'المُقيِت', transliteration: 'Al-Muqit', french: 'Le Nourricier' },
    { number: 40, arabic: 'الْحسِيبُ', transliteration: 'Al-Hasib', french: 'Celui qui suffit' },
    { number: 41, arabic: 'الْجَلِيلُ', transliteration: 'Al-Jalil', french: 'Le Majestueux' },
    { number: 42, arabic: 'الْكَرِيمُ', transliteration: 'Al-Karim', french: 'Le Généreux' },
    { number: 43, arabic: 'الرَّقِيبُ', transliteration: 'Ar-Raqib', french: 'Le Vigilant' },
    { number: 44, arabic: 'الْمُجِيبُ', transliteration: 'Al-Mujib', french: 'Celui qui exauce' },
    { number: 45, arabic: 'الْوَاسِعُ', transliteration: 'Al-Wasi', french: 'L\'Immense' },
    { number: 46, arabic: 'الْحَكِيمُ', transliteration: 'Al-Hakim', french: 'Le Sage' },
    { number: 47, arabic: 'الْوَدُودُ', transliteration: 'Al-Wadud', french: 'Le Très Aimant' },
    { number: 48, arabic: 'الْمَجِيدُ', transliteration: 'Al-Majid', french: 'Le Très Glorieux' },
    { number: 49, arabic: 'الْبَاعِثُ', transliteration: 'Al-Ba\'ith', french: 'Celui qui ressuscite' },
    { number: 50, arabic: 'الشَّهِيدُ', transliteration: 'Ash-Shahid', french: 'Le Témoin' },
    { number: 51, arabic: 'الْحَقُّ', transliteration: 'Al-Haqq', french: 'La Vérité' },
    { number: 52, arabic: 'الْوَكِيلُ', transliteration: 'Al-Wakil', french: 'Le Gérant' },
    { number: 53, arabic: 'الْقَوِيُّ', transliteration: 'Al-Qawiyy', french: 'Le Fort' },
    { number: 54, arabic: 'الْمَتِينُ', transliteration: 'Al-Matin', french: 'Le Ferme' },
    { number: 55, arabic: 'الْوَلِيُّ', transliteration: 'Al-Waliyy', french: 'Le Protecteur' },
    { number: 56, arabic: 'الْحَمِيدُ', transliteration: 'Al-Hamid', french: 'Le Digne de Louange' },
    { number: 57, arabic: 'الْمُحْصِي', transliteration: 'Al-Muhsi', french: 'Celui qui dénombre' },
    { number: 58, arabic: 'الْمُبْدِئُ', transliteration: 'Al-Mubdi', french: 'Celui qui commence' },
    { number: 59, arabic: 'الْمُعِيدُ', transliteration: 'Al-Mu\'id', french: 'Celui qui répète' },
    { number: 60, arabic: 'الْمُحْيِي', transliteration: 'Al-Muhyi', french: 'Celui qui donne la vie' },
    { number: 61, arabic: 'اَلْمُمِيتُ', transliteration: 'Al-Mumit', french: 'Celui qui donne la mort' },
    { number: 62, arabic: 'الْحَيُّ', transliteration: 'Al-Hayy', french: 'Le Vivant' },
    { number: 63, arabic: 'الْقَيُّومُ', transliteration: 'Al-Qayyum', french: 'L\'Immuable' },
    { number: 64, arabic: 'الْوَاجِدُ', transliteration: 'Al-Wajid', french: 'L\'Opulent' },
    { number: 65, arabic: 'الْمَاجِدُ', transliteration: 'Al-Majid', french: 'Le Noble' },
    { number: 66, arabic: 'الْواحِدُ', transliteration: 'Al-Wahid', french: 'L\'Unique' },
    { number: 67, arabic: 'اَلاَحَدُ', transliteration: 'Al-Ahad', french: 'L\'Un' },
    { number: 68, arabic: 'الصَّمَدُ', transliteration: 'As-Samad', french: 'Le Soutien Universel' },
    { number: 69, arabic: 'الْقَادِرُ', transliteration: 'Al-Qadir', french: 'L\'Omnipotent' },
    { number: 70, arabic: 'الْمُقْتَدِرُ', transliteration: 'Al-Muqtadir', french: 'Le Tout Puissant' },
    { number: 71, arabic: 'الْمُقَدِّمُ', transliteration: 'Al-Muqaddim', french: 'Celui qui avance' },
    { number: 72, arabic: 'الْمُؤَخِّرُ', transliteration: 'Al-Mu\'akhkhir', french: 'Celui qui retarde' },
    { number: 73, arabic: 'الأوَّلُ', transliteration: 'Al-Awwal', french: 'Le Premier' },
    { number: 74, arabic: 'الآخِرُ', transliteration: 'Al-Akhir', french: 'Le Dernier' },
    { number: 75, arabic: 'الظَّاهِرُ', transliteration: 'Az-Zahir', french: 'L\'Apparent' },
    { number: 76, arabic: 'الْبَاطِنُ', transliteration: 'Al-Batin', french: 'Le Caché' },
    { number: 77, arabic: 'الْوَالِي', transliteration: 'Al-Wali', french: 'Le Maître' },
    { number: 78, arabic: 'الْمُتَعَالِي', transliteration: 'Al-Muta\'ali', french: 'Le Très Élevé' },
    { number: 79, arabic: 'الْبَرُّ', transliteration: 'Al-Barr', french: 'Le Bienfaisant' },
    { number: 80, arabic: 'التَّوَّابُ', transliteration: 'At-Tawwab', french: 'Celui qui accepte le repentir' },
    { number: 81, arabic: 'الْمُنْتَقِمُ', transliteration: 'Al-Muntaqim', french: 'Le Vengeur' },
    { number: 82, arabic: 'العَفُوُّ', transliteration: 'Al-Afuww', french: 'L\'Indulgent' },
    { number: 83, arabic: 'الرَّؤُوفُ', transliteration: 'Ar-Ra\'uf', french: 'Le Compatissant' },
    { number: 84, arabic: 'مَالِكُ الْمُلْكِ', transliteration: 'Malik-ul-Mulk', french: 'Le Possesseur du Royaume' },
    { number: 85, arabic: 'ذُوالْجَلاَلِ وَالإكْرَامِ', transliteration: 'Dhul-Jalali-wal-Ikram', french: 'Le Majestueux' },
    { number: 86, arabic: 'الْمُقْسِطُ', transliteration: 'Al-Muqsit', french: 'L\'Équitable' },
    { number: 87, arabic: 'الْجَامِعُ', transliteration: 'Al-Jami', french: 'Le Rassembleur' },
    { number: 88, arabic: 'الْغَنِيُّ', transliteration: 'Al-Ghaniyy', french: 'Le Riche' },
    { number: 89, arabic: 'الْمُغْنِي', transliteration: 'Al-Mughni', french: 'Celui qui enrichit' },
    { number: 90, arabic: 'اَلْمَانِعُ', transliteration: 'Al-Mani', french: 'Celui qui empêche' },
    { number: 91, arabic: 'الضَّارَّ', transliteration: 'Ad-Darr', french: 'Celui qui peut nuire' },
    { number: 92, arabic: 'النَّافِعُ', transliteration: 'An-Nafi', french: 'Celui qui profite' },
    { number: 93, arabic: 'النُّورُ', transliteration: 'An-Nur', french: 'La Lumière' },
    { number: 94, arabic: 'الْهَادِي', transliteration: 'Al-Hadi', french: 'Le Guide' },
    { number: 95, arabic: 'الْبَدِيعُ', transliteration: 'Al-Badi', french: 'L\'Inventeur' },
    { number: 96, arabic: 'اَلْبَاقِي', transliteration: 'Al-Baqi', french: 'L\'Éternel' },
    { number: 97, arabic: 'الْوَارِثُ', transliteration: 'Al-Warith', french: 'L\'Héritier' },
    { number: 98, arabic: 'الرَّشِيدُ', transliteration: 'Ar-Rashid', french: 'Le Guide' },
    { number: 99, arabic: 'الصَّبُورُ', transliteration: 'As-Sabur', french: 'Le Patient' },
];

export default function NamesOfAllahPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedName, setSelectedName] = useState<typeof namesOfAllah[0] | null>(null);

    const filteredNames = namesOfAllah.filter(name =>
        name.transliteration.toLowerCase().includes(searchQuery.toLowerCase()) ||
        name.french.toLowerCase().includes(searchQuery.toLowerCase()) ||
        name.arabic.includes(searchQuery)
    );

    return (
        <AppWrapper>
            <div className="min-h-screen bg-background safe-bottom">
                <CompactHeader
                    title="99 Noms d'Allah"
                    subtitle="أسماء الله الحسنى"
                />

                <div className="p-4 space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Rechercher un nom..."
                            className="input input-with-icon"
                        />
                    </div>

                    {/* Info Card */}
                    <div className="card bg-gradient-to-br from-emerald-700 to-emerald-900 text-white">
                        <div className="flex items-center gap-3 mb-2">
                            <Star className="w-6 h-6 text-gold-400" />
                            <h3 className="font-semibold">Les Plus Beaux Noms</h3>
                        </div>
                        <p className="text-sm opacity-90">
                            "C&apos;est à Allah qu&apos;appartiennent les noms les plus beaux. Invoquez-Le par ces noms"
                            <span className="block mt-1 opacity-70">— Sourate Al-A'raf 7:180</span>
                        </p>
                    </div>

                    {/* Names Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {filteredNames.map((name) => (
                            <button
                                key={name.number}
                                onClick={() => setSelectedName(name)}
                                className="card text-center hover:scale-[1.02] transition-transform"
                            >
                                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <span className="text-xs font-bold text-primary">{name.number}</span>
                                </div>
                                <p className="text-2xl font-arabic text-primary mb-1" dir="rtl">
                                    {name.arabic}
                                </p>
                                <p className="text-sm font-medium text-foreground">{name.transliteration}</p>
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{name.french}</p>
                            </button>
                        ))}
                    </div>

                    {/* Empty State */}
                    {filteredNames.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">Aucun nom trouvé</p>
                        </div>
                    )}
                </div>

                {/* Name Detail Modal */}
                {selectedName && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
                        onClick={() => setSelectedName(null)}
                    >
                        <div
                            className="bg-card w-full max-w-sm rounded-3xl p-6 text-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-primary">{selectedName.number}</span>
                            </div>

                            <p className="text-4xl font-arabic text-primary mb-4" dir="rtl">
                                {selectedName.arabic}
                            </p>

                            <h3 className="text-xl font-semibold text-foreground mb-2">
                                {selectedName.transliteration}
                            </h3>

                            <p className="text-muted-foreground mb-6">
                                {selectedName.french}
                            </p>

                            <button
                                onClick={() => setSelectedName(null)}
                                className="btn btn-primary w-full"
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AppWrapper>
    );
}
