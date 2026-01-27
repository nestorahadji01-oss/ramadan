'use client';

import { useState, useEffect } from 'react';
import AppWrapper from '@/components/AppWrapper';
import { CompactHeader } from '@/components/layout/Header';
import { Folder, FileText, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import dynamic from 'next/dynamic';

// Dynamically import PDFViewer to avoid SSR issues
const PDFViewer = dynamic(() => import('@/components/PDFViewer'), { ssr: false });

interface EBook {
    id: string;
    title: string;
    author: string | null;
    category: string;
    description: string | null;
    file_url: string;
    cover_url: string | null;
    pages: number | null;
    created_at: string;
}

const categories = [
    { id: 'all', name: 'Tous' },
    { id: 'Coran', name: 'Coran' },
    { id: 'Hadith', name: 'Hadith' },
    { id: 'Fiqh', name: 'Fiqh' },
    { id: 'Sira', name: 'Sira' },
    { id: 'Spiritualité', name: 'Spiritualité' },
    { id: 'Ramadan', name: 'Ramadan' },
    { id: 'Invocations', name: 'Invocations' },
];

export default function LibraryPage() {
    const [books, setBooks] = useState<EBook[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBook, setSelectedBook] = useState<EBook | null>(null);

    // Fetch e-books from Supabase
    useEffect(() => {
        async function fetchBooks() {
            setLoading(true);
            const { data, error } = await supabase
                .from('ebooks')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching ebooks:', error);
            } else {
                setBooks(data || []);
            }
            setLoading(false);
        }

        fetchBooks();
    }, []);

    const filteredBooks = books.filter(book => {
        const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;
        const matchesSearch =
            book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (book.author?.toLowerCase() || '').includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const openBook = (book: EBook) => {
        setSelectedBook(book);
    };

    const closeBook = () => {
        setSelectedBook(null);
    };

    // PDF Viewer Modal
    if (selectedBook) {
        return (
            <AppWrapper>
                <PDFViewer
                    url={selectedBook.file_url}
                    title={selectedBook.title}
                    bookId={selectedBook.id}
                    onClose={closeBook}
                />
            </AppWrapper>
        );
    }

    return (
        <AppWrapper>
            <div className="min-h-screen bg-background safe-bottom w-full max-w-full overflow-x-hidden">
                <CompactHeader title="Bibliothèque" subtitle="E-Books Islamiques" />

                <div className="p-4 space-y-4 w-full max-w-full">
                    {/* Loading */}
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-6 h-6 text-primary animate-spin" />
                        </div>
                    ) : (
                        <>
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

                            {/* Books Grid */}
                            {filteredBooks.length > 0 ? (
                                <div className="grid grid-cols-2 gap-3 w-full">
                                    {filteredBooks.map((book) => (
                                        <button
                                            key={book.id}
                                            onClick={() => openBook(book)}
                                            className="bg-card border border-card-border rounded-xl p-3 w-full text-left transition-all active:scale-95"
                                        >
                                            {/* Cover */}
                                            <div className="aspect-[3/4] bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900 dark:to-emerald-800 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                                                {book.cover_url ? (
                                                    <img
                                                        src={book.cover_url}
                                                        alt={book.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <FileText className="w-8 h-8 text-emerald-600/50" />
                                                )}
                                            </div>
                                            {/* Info */}
                                            <h3 className="font-medium text-xs text-foreground line-clamp-2 mb-0.5">
                                                {book.title}
                                            </h3>
                                            <p className="text-[10px] text-muted-foreground truncate">
                                                {book.author || 'Anonyme'}
                                            </p>
                                            {/* Badge */}
                                            <span className="inline-block mt-1.5 px-2 py-0.5 text-[9px] font-medium rounded-full bg-primary/10 text-primary">
                                                {book.category}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Folder className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-1">Aucun livre trouvé</p>
                                    <p className="text-xs text-muted-foreground">
                                        Les livres seront ajoutés depuis l&apos;admin
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </AppWrapper>
    );
}
