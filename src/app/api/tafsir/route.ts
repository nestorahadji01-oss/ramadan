import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy API route to fetch tafsir data from QuranEnc
 * This avoids CORS issues when calling the external API from the browser
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const surah = searchParams.get('surah');

    if (!surah) {
        return NextResponse.json({ error: 'Surah number required' }, { status: 400 });
    }

    try {
        const response = await fetch(
            `https://quranenc.com/api/v1/translation/sura/french_mokhtasar/${surah}`,
            {
                headers: { 'Accept': 'application/json' },
            }
        );

        if (!response.ok) {
            return NextResponse.json({ error: 'QuranEnc API error' }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Tafsir proxy error:', error);
        return NextResponse.json({ error: 'Failed to fetch tafsir' }, { status: 500 });
    }
}
