'use client';

import { useState, useMemo } from 'react';
import AppWrapper from '@/components/AppWrapper';
import { CompactHeader } from '@/components/layout/Header';
import { Calculator, DollarSign, Coins, TrendingUp, Info, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

// Current gold/silver prices (in XOF - West African CFA franc)
// These would ideally come from an API
const GOLD_PRICE_PER_GRAM = 45000; // XOF per gram
const SILVER_PRICE_PER_GRAM = 550; // XOF per gram

// Nisab thresholds
const NISAB_GOLD_GRAMS = 85; // 85 grams of gold
const NISAB_SILVER_GRAMS = 595; // 595 grams of silver

// Zakat rate
const ZAKAT_RATE = 0.025; // 2.5%

interface ZakatValues {
    cash: string;
    bankAccounts: string;
    savings: string;
    goldWeight: string;
    silverWeight: string;
    investments: string;
    businessAssets: string;
    receivables: string;
    debts: string;
}

export default function ZakatPage() {
    const [values, setValues] = useState<ZakatValues>({
        cash: '',
        bankAccounts: '',
        savings: '',
        goldWeight: '',
        silverWeight: '',
        investments: '',
        businessAssets: '',
        receivables: '',
        debts: '',
    });
    const [showInfo, setShowInfo] = useState(false);

    const handleChange = (field: keyof ZakatValues, value: string) => {
        // Only allow numbers and decimal point
        const sanitized = value.replace(/[^0-9.]/g, '');
        setValues(prev => ({ ...prev, [field]: sanitized }));
    };

    const parseValue = (val: string) => parseFloat(val) || 0;

    const calculations = useMemo(() => {
        // Calculate gold/silver value
        const goldValue = parseValue(values.goldWeight) * GOLD_PRICE_PER_GRAM;
        const silverValue = parseValue(values.silverWeight) * SILVER_PRICE_PER_GRAM;

        // Total assets
        const totalAssets =
            parseValue(values.cash) +
            parseValue(values.bankAccounts) +
            parseValue(values.savings) +
            goldValue +
            silverValue +
            parseValue(values.investments) +
            parseValue(values.businessAssets) +
            parseValue(values.receivables);

        // Deduct liabilities
        const totalLiabilities = parseValue(values.debts);

        // Net zakatable wealth
        const netWealth = totalAssets - totalLiabilities;

        // Calculate nisab thresholds
        const nisabGold = NISAB_GOLD_GRAMS * GOLD_PRICE_PER_GRAM;
        const nisabSilver = NISAB_SILVER_GRAMS * SILVER_PRICE_PER_GRAM;
        const nisab = Math.min(nisabGold, nisabSilver);

        // Check if zakat is due
        const isZakatDue = netWealth >= nisab;

        // Calculate zakat amount
        const zakatAmount = isZakatDue ? netWealth * ZAKAT_RATE : 0;

        return {
            goldValue,
            silverValue,
            totalAssets,
            totalLiabilities,
            netWealth,
            nisabGold,
            nisabSilver,
            nisab,
            isZakatDue,
            zakatAmount,
        };
    }, [values]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount) + ' FCFA';
    };

    return (
        <AppWrapper>
            <div className="min-h-screen bg-background safe-bottom">
                <CompactHeader
                    title="Calculateur de Zakat"
                    subtitle="حاسبة الزكاة"
                    rightElement={
                        <button
                            onClick={() => setShowInfo(!showInfo)}
                            className="p-2 rounded-full hover:bg-muted transition-colors"
                        >
                            <Info className="w-5 h-5 text-muted-foreground" />
                        </button>
                    }
                />

                <div className="p-4 space-y-6">
                    {/* Info Card */}
                    {showInfo && (
                        <div className="card bg-primary/5 border-primary/20">
                            <h3 className="font-semibold text-foreground mb-2">À propos de la Zakat</h3>
                            <p className="text-sm text-muted-foreground mb-3">
                                La Zakat est l&apos;un des cinq piliers de l&apos;Islam. Elle est obligatoire pour tout musulman dont la richesse dépasse le Nisab pendant une année lunaire complète.
                            </p>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• Taux: 2.5% de la richesse zakatable</li>
                                <li>• Nisab (Or): {NISAB_GOLD_GRAMS}g = {formatCurrency(NISAB_GOLD_GRAMS * GOLD_PRICE_PER_GRAM)}</li>
                                <li>• Nisab (Argent): {NISAB_SILVER_GRAMS}g = {formatCurrency(NISAB_SILVER_GRAMS * SILVER_PRICE_PER_GRAM)}</li>
                            </ul>
                        </div>
                    )}

                    {/* Assets Section */}
                    <section>
                        <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-3">
                            <DollarSign className="w-5 h-5 text-primary" />
                            Avoirs
                        </h3>

                        <div className="space-y-3">
                            <div>
                                <label className="text-sm text-muted-foreground mb-1 block">Espèces (FCFA)</label>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    value={values.cash}
                                    onChange={(e) => handleChange('cash', e.target.value)}
                                    placeholder="0"
                                    className="input"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-muted-foreground mb-1 block">Comptes bancaires (FCFA)</label>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    value={values.bankAccounts}
                                    onChange={(e) => handleChange('bankAccounts', e.target.value)}
                                    placeholder="0"
                                    className="input"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-muted-foreground mb-1 block">Épargne (FCFA)</label>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    value={values.savings}
                                    onChange={(e) => handleChange('savings', e.target.value)}
                                    placeholder="0"
                                    className="input"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Gold & Silver Section */}
                    <section>
                        <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-3">
                            <Coins className="w-5 h-5 text-gold-500" />
                            Or et Argent
                        </h3>

                        <div className="space-y-3">
                            <div>
                                <label className="text-sm text-muted-foreground mb-1 block">
                                    Or (grammes) - {formatCurrency(GOLD_PRICE_PER_GRAM)}/g
                                </label>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    value={values.goldWeight}
                                    onChange={(e) => handleChange('goldWeight', e.target.value)}
                                    placeholder="0"
                                    className="input"
                                />
                                {parseValue(values.goldWeight) > 0 && (
                                    <p className="text-sm text-gold-500 mt-1">
                                        Valeur: {formatCurrency(calculations.goldValue)}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="text-sm text-muted-foreground mb-1 block">
                                    Argent (grammes) - {formatCurrency(SILVER_PRICE_PER_GRAM)}/g
                                </label>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    value={values.silverWeight}
                                    onChange={(e) => handleChange('silverWeight', e.target.value)}
                                    placeholder="0"
                                    className="input"
                                />
                                {parseValue(values.silverWeight) > 0 && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Valeur: {formatCurrency(calculations.silverValue)}
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Investments Section */}
                    <section>
                        <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-3">
                            <TrendingUp className="w-5 h-5 text-emerald-600" />
                            Investissements & Business
                        </h3>

                        <div className="space-y-3">
                            <div>
                                <label className="text-sm text-muted-foreground mb-1 block">Actions & Investissements (FCFA)</label>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    value={values.investments}
                                    onChange={(e) => handleChange('investments', e.target.value)}
                                    placeholder="0"
                                    className="input"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-muted-foreground mb-1 block">Actifs commerciaux (FCFA)</label>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    value={values.businessAssets}
                                    onChange={(e) => handleChange('businessAssets', e.target.value)}
                                    placeholder="0"
                                    className="input"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-muted-foreground mb-1 block">Créances (à recevoir) (FCFA)</label>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    value={values.receivables}
                                    onChange={(e) => handleChange('receivables', e.target.value)}
                                    placeholder="0"
                                    className="input"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Liabilities Section */}
                    <section>
                        <h3 className="text-lg font-semibold text-foreground mb-3">
                            Passifs (à déduire)
                        </h3>

                        <div>
                            <label className="text-sm text-muted-foreground mb-1 block">Dettes (FCFA)</label>
                            <input
                                type="text"
                                inputMode="decimal"
                                value={values.debts}
                                onChange={(e) => handleChange('debts', e.target.value)}
                                placeholder="0"
                                className="input"
                            />
                        </div>
                    </section>

                    {/* Results Section */}
                    <section className="card card-gold">
                        <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
                            <Calculator className="w-5 h-5" />
                            Résultat
                        </h3>

                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span>Total des actifs:</span>
                                <span className="font-semibold">{formatCurrency(calculations.totalAssets)}</span>
                            </div>

                            <div className="flex justify-between">
                                <span>Total des passifs:</span>
                                <span className="font-semibold">- {formatCurrency(calculations.totalLiabilities)}</span>
                            </div>

                            <div className="border-t border-current/20 pt-3 flex justify-between">
                                <span>Richesse nette zakatable:</span>
                                <span className="font-semibold">{formatCurrency(calculations.netWealth)}</span>
                            </div>

                            <div className="flex justify-between text-sm opacity-80">
                                <span>Seuil Nisab:</span>
                                <span>{formatCurrency(calculations.nisab)}</span>
                            </div>

                            <div className={cn(
                                "border-t border-current/20 pt-3",
                                calculations.isZakatDue ? "" : "opacity-60"
                            )}>
                                <div className="flex justify-between items-center">
                                    <span className="text-lg">Zakat à payer:</span>
                                    <span className="text-2xl font-bold">
                                        {formatCurrency(calculations.zakatAmount)}
                                    </span>
                                </div>
                                {!calculations.isZakatDue && (
                                    <p className="text-sm mt-2 opacity-80">
                                        Votre richesse est en dessous du Nisab. La Zakat n&apos;est pas obligatoire.
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Note */}
                    <p className="text-xs text-center text-muted-foreground">
                        Ce calculateur est fourni à titre indicatif. Consultez un savant pour des questions spécifiques.
                    </p>
                </div>
            </div>
        </AppWrapper>
    );
}
