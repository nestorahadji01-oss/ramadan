'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

// Configure PDF.js worker
if (typeof window !== 'undefined') {
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

interface PDFViewerProps {
    url: string;
    onClose: () => void;
    title: string;
    bookId: string;
}

export default function PDFViewer({ url, onClose, title, bookId }: PDFViewerProps) {
    const [numPages, setNumPages] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [containerWidth, setContainerWidth] = useState(0);
    const [bookmarkedPage, setBookmarkedPage] = useState<number | null>(null);
    const [showBookmarkToast, setShowBookmarkToast] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [pdfText, setPdfText] = useState<string[]>([]);

    const containerRef = useRef<HTMLDivElement>(null);
    const pagesRef = useRef<HTMLDivElement>(null);

    // Load bookmark from localStorage
    useEffect(() => {
        const saved = localStorage.getItem(`bookmark_${bookId}`);
        if (saved) {
            setBookmarkedPage(parseInt(saved));
        }
    }, [bookId]);

    // Measure container width for full-width pages
    useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.clientWidth - 32); // padding
            }
        };
        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, []);

    // Track current page on scroll
    useEffect(() => {
        const container = pagesRef.current;
        if (!container || numPages === 0) return;

        const handleScroll = () => {
            const pages = container.querySelectorAll('.pdf-page');
            let visiblePage = 1;

            pages.forEach((page, index) => {
                const rect = page.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();

                if (rect.top < containerRect.top + containerRect.height / 2) {
                    visiblePage = index + 1;
                }
            });

            setCurrentPage(visiblePage);
        };

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, [numPages]);

    const onDocumentLoadSuccess = async ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
        setLoading(false);
    };

    const onDocumentLoadError = () => {
        setError(true);
        setLoading(false);
    };

    // Bookmark current page
    const toggleBookmark = () => {
        if (bookmarkedPage === currentPage) {
            localStorage.removeItem(`bookmark_${bookId}`);
            setBookmarkedPage(null);
            setShowBookmarkToast(true);
            setTimeout(() => setShowBookmarkToast(false), 2000);
        } else {
            localStorage.setItem(`bookmark_${bookId}`, currentPage.toString());
            setBookmarkedPage(currentPage);
            setShowBookmarkToast(true);
            setTimeout(() => setShowBookmarkToast(false), 2000);
        }
    };

    // Go to bookmark
    const goToBookmark = () => {
        if (bookmarkedPage && pagesRef.current) {
            const pages = pagesRef.current.querySelectorAll('.pdf-page');
            if (pages[bookmarkedPage - 1]) {
                pages[bookmarkedPage - 1].scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    // Text-to-Speech using Web Speech API
    const toggleSpeech = useCallback(() => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        } else {
            // Get text from current visible page
            if (pagesRef.current) {
                const pages = pagesRef.current.querySelectorAll('.pdf-page');
                const currentPageEl = pages[currentPage - 1];
                if (currentPageEl) {
                    const text = currentPageEl.textContent || '';
                    if (text.trim()) {
                        const utterance = new SpeechSynthesisUtterance(text);
                        utterance.lang = 'ar-SA'; // Arabic
                        utterance.rate = 0.9;
                        utterance.onend = () => setIsSpeaking(false);
                        utterance.onerror = () => setIsSpeaking(false);
                        window.speechSynthesis.speak(utterance);
                        setIsSpeaking(true);
                    }
                }
            }
        }
    }, [isSpeaking, currentPage]);

    // Stop speech on unmount
    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel();
        };
    }, []);

    return (
        <div className="fixed inset-0 bg-background z-50 flex flex-col">
            {/* Header */}
            <div className="bg-card border-b border-card-border px-4 py-3 flex items-center justify-between safe-top">
                <button onClick={onClose} className="p-2 -ml-2 text-muted-foreground">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <div className="flex-1 text-center">
                    <h1 className="text-sm font-semibold text-foreground truncate px-2">
                        {title}
                    </h1>
                    {numPages > 0 && (
                        <p className="text-xs text-muted-foreground">
                            {currentPage} / {numPages}
                        </p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                    {/* Audio Button */}
                    <button
                        onClick={toggleSpeech}
                        className={`p-2 rounded-lg transition-colors ${isSpeaking ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
                        title={isSpeaking ? 'Arrêter la lecture' : 'Lire à voix haute'}
                    >
                        {isSpeaking ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            </svg>
                        )}
                    </button>

                    {/* Bookmark Button */}
                    <button
                        onClick={toggleBookmark}
                        className={`p-2 rounded-lg transition-colors ${bookmarkedPage === currentPage ? 'text-primary' : 'text-muted-foreground'}`}
                        title={bookmarkedPage === currentPage ? 'Retirer le marque-page' : 'Marquer cette page'}
                    >
                        <svg className="w-5 h-5" fill={bookmarkedPage === currentPage ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Bookmark indicator */}
            {bookmarkedPage && bookmarkedPage !== currentPage && (
                <button
                    onClick={goToBookmark}
                    className="absolute top-16 right-4 z-10 bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5"
                >
                    <svg className="w-3.5 h-3.5" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    Page {bookmarkedPage}
                </button>
            )}

            {/* Toast */}
            {showBookmarkToast && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 bg-card border border-card-border text-sm px-4 py-2 rounded-lg shadow-lg">
                    {bookmarkedPage === currentPage ? '📖 Marque-page ajouté' : '📖 Marque-page retiré'}
                </div>
            )}

            {/* PDF Viewer - Scroll Mode */}
            <div
                ref={containerRef}
                className="flex-1 overflow-hidden bg-muted/30"
            >
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                {error ? (
                    <div className="flex flex-col items-center justify-center h-full py-8">
                        <p className="text-muted-foreground text-sm mb-4">Erreur de chargement du PDF</p>
                        <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm"
                        >
                            Ouvrir dans le navigateur
                        </a>
                    </div>
                ) : (
                    <div
                        ref={pagesRef}
                        className="h-full overflow-auto scroll-smooth"
                        style={{ scrollSnapType: 'y proximity' }}
                    >
                        <Document
                            file={url}
                            onLoadSuccess={onDocumentLoadSuccess}
                            onLoadError={onDocumentLoadError}
                            loading={null}
                        >
                            {Array.from(new Array(numPages), (_, index) => (
                                <div
                                    key={`page_${index + 1}`}
                                    className="pdf-page flex justify-center py-2"
                                    style={{ scrollSnapAlign: 'start' }}
                                >
                                    <Page
                                        pageNumber={index + 1}
                                        width={containerWidth}
                                        className="shadow-lg"
                                        renderTextLayer={true}
                                        renderAnnotationLayer={false}
                                    />
                                </div>
                            ))}
                        </Document>
                    </div>
                )}
            </div>

            {/* Bottom Progress Bar */}
            {numPages > 0 && (
                <div className="bg-card border-t border-card-border px-4 py-2 safe-bottom">
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-8">{currentPage}</span>
                        <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all duration-300"
                                style={{ width: `${(currentPage / numPages) * 100}%` }}
                            />
                        </div>
                        <span className="text-xs text-muted-foreground w-8 text-right">{numPages}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
