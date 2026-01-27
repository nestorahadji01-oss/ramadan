'use client';

import { useEffect, useState, useRef } from 'react';
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

    const containerRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Load bookmark from localStorage
    useEffect(() => {
        const saved = localStorage.getItem(`bookmark_${bookId}`);
        if (saved) {
            const page = parseInt(saved);
            setBookmarkedPage(page);
            // Auto-scroll to bookmark after load
            setTimeout(() => {
                if (scrollRef.current && page > 1) {
                    const pages = scrollRef.current.querySelectorAll('.pdf-page-container');
                    if (pages[page - 1]) {
                        pages[page - 1].scrollIntoView({ behavior: 'auto' });
                    }
                }
            }, 1000);
        }
    }, [bookId, numPages]);

    // Measure container width for full-width pages
    useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                // Full width minus small padding
                setContainerWidth(containerRef.current.clientWidth - 16);
            }
        };
        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, []);

    // Track current page on scroll
    useEffect(() => {
        const container = scrollRef.current;
        if (!container || numPages === 0) return;

        const handleScroll = () => {
            const pages = container.querySelectorAll('.pdf-page-container');
            const containerRect = container.getBoundingClientRect();
            let visiblePage = 1;

            pages.forEach((page, index) => {
                const rect = page.getBoundingClientRect();
                // Page is considered "current" when its top is near the top of the viewport
                if (rect.top < containerRect.top + 150) {
                    visiblePage = index + 1;
                }
            });

            setCurrentPage(visiblePage);
        };

        container.addEventListener('scroll', handleScroll, { passive: true });
        return () => container.removeEventListener('scroll', handleScroll);
    }, [numPages]);

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
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
        } else {
            localStorage.setItem(`bookmark_${bookId}`, currentPage.toString());
            setBookmarkedPage(currentPage);
        }
        setShowBookmarkToast(true);
        setTimeout(() => setShowBookmarkToast(false), 1500);
    };

    // Go to bookmark
    const goToBookmark = () => {
        if (bookmarkedPage && scrollRef.current) {
            const pages = scrollRef.current.querySelectorAll('.pdf-page-container');
            if (pages[bookmarkedPage - 1]) {
                pages[bookmarkedPage - 1].scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
            {/* Header */}
            <div className="bg-black/90 backdrop-blur px-4 py-3 flex items-center justify-between safe-top border-b border-white/10">
                <button
                    onClick={onClose}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="flex-1 text-center px-3">
                    <h1 className="text-sm font-medium text-white truncate">
                        {title}
                    </h1>
                    {numPages > 0 && (
                        <p className="text-xs text-white/60">
                            {currentPage} / {numPages}
                        </p>
                    )}
                </div>

                {/* Bookmark Button */}
                <button
                    onClick={toggleBookmark}
                    className={`w-10 h-10 flex items-center justify-center rounded-full ${bookmarkedPage === currentPage ? 'bg-primary text-white' : 'bg-white/10 text-white'
                        }`}
                >
                    <svg
                        className="w-5 h-5"
                        fill={bookmarkedPage === currentPage ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                </button>
            </div>

            {/* Bookmark jump button */}
            {bookmarkedPage && bookmarkedPage !== currentPage && (
                <button
                    onClick={goToBookmark}
                    className="absolute top-20 left-1/2 -translate-x-1/2 z-10 bg-primary text-white text-xs px-4 py-2 rounded-full shadow-lg flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    Aller à la page {bookmarkedPage}
                </button>
            )}

            {/* Toast */}
            {showBookmarkToast && (
                <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20 bg-white text-black text-sm px-4 py-2 rounded-full shadow-lg font-medium">
                    {bookmarkedPage === currentPage ? '📖 Marque-page ajouté' : '📖 Marque-page retiré'}
                </div>
            )}

            {/* PDF Viewer */}
            <div ref={containerRef} className="flex-1 overflow-hidden bg-neutral-900">
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black">
                        <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                {error ? (
                    <div className="flex flex-col items-center justify-center h-full py-8">
                        <p className="text-white/70 text-sm mb-4">Impossible de charger le PDF</p>
                        <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-5 py-2.5 bg-primary text-white rounded-full text-sm font-medium"
                        >
                            Ouvrir dans le navigateur
                        </a>
                    </div>
                ) : (
                    <div
                        ref={scrollRef}
                        className="h-full overflow-auto"
                    >
                        <Document
                            file={url}
                            onLoadSuccess={onDocumentLoadSuccess}
                            onLoadError={onDocumentLoadError}
                            loading={null}
                            className="flex flex-col items-center"
                        >
                            {Array.from(new Array(numPages), (_, index) => (
                                <div
                                    key={`page_${index + 1}`}
                                    className="pdf-page-container w-full flex justify-center py-1 bg-neutral-900"
                                >
                                    <Page
                                        pageNumber={index + 1}
                                        width={containerWidth}
                                        renderTextLayer={false}
                                        renderAnnotationLayer={false}
                                        className="shadow-2xl"
                                    />
                                </div>
                            ))}
                            {/* Bottom padding for safe area */}
                            <div className="h-20" />
                        </Document>
                    </div>
                )}
            </div>

            {/* Progress Bar */}
            {numPages > 0 && !loading && (
                <div className="bg-black/90 backdrop-blur px-4 py-3 safe-bottom border-t border-white/10">
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-white/60 w-8 text-center">{currentPage}</span>
                        <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary rounded-full transition-all duration-200"
                                style={{ width: `${(currentPage / numPages) * 100}%` }}
                            />
                        </div>
                        <span className="text-xs text-white/60 w-8 text-center">{numPages}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
