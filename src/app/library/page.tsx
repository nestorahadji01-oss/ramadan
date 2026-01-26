'use client';

import { useState } from 'react';
import AppWrapper from '@/components/AppWrapper';
import { CompactHeader } from '@/components/layout/Header';
import { BookOpen, Folder, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EBook {
    id: string;
    title: string;
    author: string;
    category: string;
    coverUrl?: string;
    pdfUrl?: string;
}

const categories = [
    { id: 'all', name: 'Tous' },
    { id: 'ramadan', name: 'Ramadan' },
    { id: 'quran', name: 'Coran' },
    { id: 'fiqh', name: 'Fiqh' },
    { id: 'hadith', name: 'Hadiths' },
];

const sampleBooks: EBook[] = [
    { id: '1', title: 'Guide du Ramadan', author: 'Collectif', category: 'ramadan' },
    { id: '2', title: 'Les 40 Hadiths', author: 'Imam Nawawi', category: 'hadith' },
    { id: '3', title: 'Le Nectar Cacheté', author: 'Al-Mubarakfuri', category: 'sira' },
    { id: '4', title: 'Riyad as-Salihin', author: 'Imam Nawawi', category: 'hadith' },
    { id: '5', title: 'La Citadelle du Musulman', author: 'Al-Qahtani', category: 'fiqh' },
    { id: '6', title: 'Tafsir Ibn Kathir', author: 'Ibn Kathir', category: 'quran' },
];

export default function LibraryPage() {
    const [books] = useState<EBook[]>(sampleBooks);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredBooks = books.filter(book => {
        const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;
        const matchesSearch =
            book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.author.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <AppWrapper>
            <div className="min-h-screen bg-background safe-bottom w-full max-w-full overflow-x-hidden">
                <CompactHeader title="Bibliothèque" subtitle="E-Books Islamiques" />

                <div className="p-4 space-y-4 w-full max-w-full">
                    {/* Info Banner */}
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 w-full">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                <BookOpen className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-sm text-foreground">En construction</h3>
                                <p className="text-xs text-muted-foreground">
                                    Les e-books seront bientôt disponibles.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Search */}
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Rechercher..."
                        className="w-full px-4 py-2.5 bg-card border border-card-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />

                    {/* Categories - Horizontal scroll */}
                    <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
                        <div className="flex gap-2 w-max">
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => setSelectedCategory(category.id)}
                                    className={cn(
                                        "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap",
                                        selectedCategory === category.id
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted text-muted-foreground"
                                    )}
                                >
                                    {category.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Books Grid - 2 columns, proper sizing */}
                    <div className="grid grid-cols-2 gap-2 w-full">
                        {filteredBooks.map((book) => (
                            <div key={book.id} className="bg-card border border-card-border rounded-xl p-2 w-full">
                                {/* Cover */}
                                <div className="aspect-[3/4] bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900 dark:to-emerald-800 rounded-lg mb-2 flex items-center justify-center">
                                    <FileText className="w-6 h-6 text-emerald-600/50" />
                                </div>
                                {/* Info */}
                                <h3 className="font-medium text-xs text-foreground line-clamp-2 mb-0.5">
                                    {book.title}
                                </h3>
                                <p className="text-[10px] text-muted-foreground truncate">{book.author}</p>
                                {/* Button */}
                                <button
                                    className="w-full mt-2 py-1.5 text-[10px] font-medium rounded-lg bg-primary/10 text-primary"
                                    disabled
                                >
                                    Bientôt
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Empty State */}
                    {filteredBooks.length === 0 && (
                        <div className="text-center py-8">
                            <Folder className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                            <p className="text-sm text-muted-foreground">Aucun livre trouvé</p>
                        </div>
                    )}
                </div>
            </div>
        </AppWrapper>
    );
}
