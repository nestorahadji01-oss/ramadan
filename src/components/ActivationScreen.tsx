'use client';

import { useState } from 'react';
import { useActivation } from '@/contexts/ActivationContext';
import { Moon, Phone, ArrowRight, Loader2, AlertCircle, CheckCircle2, ShoppingCart } from 'lucide-react';

export default function ActivationScreen() {
    const { activate } = useActivation();
    const [phone, setPhone] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!phone.trim()) {
            setError('Veuillez entrer votre numéro de téléphone');
            return;
        }

        setIsLoading(true);
        setError(null);

        const result = await activate(phone);

        if (result.success) {
            setSuccess(true);
            // The ActivationProvider will handle the redirect
        } else {
            setError(result.error || 'Activation échouée');
        }

        setIsLoading(false);
    };

    const formatPhoneInput = (value: string) => {
        // Allow only digits, +, and spaces
        return value.replace(/[^\d+\s]/g, '');
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 flex flex-col items-center justify-center p-6 pattern-islamic-dark">
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-10 w-32 h-32 bg-gold-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Logo & Title */}
                <div className="text-center mb-10 animate-fade-in">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gold-500 to-gold-400 rounded-full mb-6 shadow-lg shadow-gold-500/20">
                        <Moon className="w-10 h-10 text-emerald-950" />
                    </div>

                    <h1 className="text-3xl font-bold text-white mb-2">
                        Niyyah
                    </h1>
                    <p className="text-emerald-300/80 text-lg font-arabic" dir="rtl">
                        نية
                    </p>
                </div>

                {/* Activation Card */}
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    <h2 className="text-xl font-semibold text-white text-center mb-2">
                        Activez votre application
                    </h2>
                    <p className="text-emerald-300/70 text-center text-sm mb-6">
                        Entrez le numéro de téléphone utilisé lors de votre achat
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Phone Input */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Phone className="w-5 h-5 text-emerald-400" />
                            </div>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
                                placeholder="+221 77 123 45 67"
                                className="w-full pl-12 pr-4 py-4 bg-white/10 border-2 border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-gold-500 transition-colors text-lg"
                                disabled={isLoading || success}
                            />
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm animate-fade-in">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Success Message */}
                        {success && (
                            <div className="flex items-center gap-2 p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-300 text-sm animate-fade-in">
                                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                                <span>Activation réussie! Bienvenue!</span>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading || success}
                            className="w-full py-4 bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-300 text-emerald-950 font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-gold-500/20"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Vérification...
                                </>
                            ) : success ? (
                                <>
                                    <CheckCircle2 className="w-5 h-5" />
                                    Activé
                                </>
                            ) : (
                                <>
                                    Activer
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* CTA for Purchase */}
                <div className="mt-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <a
                        href="https://toutenpdf.com/prd_mz134b"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-4 px-6 bg-white text-emerald-800 font-semibold rounded-xl flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-200"
                    >
                        <ShoppingCart className="w-5 h-5" />
                        <span>Pas encore de code? Acheter maintenant</span>
                    </a>
                    <p className="text-center text-emerald-400/50 text-xs mt-3">
                        Accès à vie • Toutes les fonctionnalités • Support 24/7
                    </p>
                </div>
            </div>
        </div>
    );
}
