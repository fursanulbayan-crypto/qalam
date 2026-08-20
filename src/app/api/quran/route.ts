import { NextRequest, NextResponse } from 'next/server';
import * as quranProvider from '@/lib/content/quranProvider';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');

  try {
    switch (action) {
      case 'surahList': {
        const data = await quranProvider.getSurahList();
        return NextResponse.json({ ok: true, data });
      }
      case 'surah': {
        const number = Number(searchParams.get('number'));
        if (!number) return NextResponse.json({ ok: false, error: 'Missing surah number' }, { status: 400 });
        const data = await quranProvider.getSurah(number);
        return NextResponse.json({ ok: true, data });
      }
      case 'ayah': {
        const surah = Number(searchParams.get('surah'));
        const ayah = Number(searchParams.get('ayah'));
        if (!surah || !ayah) return NextResponse.json({ ok: false, error: 'Missing surah/ayah' }, { status: 400 });
        const data = await quranProvider.getAyah(surah, ayah);
        return NextResponse.json({ ok: true, data });
      }
      case 'juz': {
        const number = Number(searchParams.get('number'));
        if (!number) return NextResponse.json({ ok: false, error: 'Missing juz number' }, { status: 400 });
        const data = await quranProvider.getJuz(number);
        return NextResponse.json({ ok: true, data });
      }
      case 'search': {
        const q = searchParams.get('q') || '';
        if (!q.trim()) return NextResponse.json({ ok: false, error: 'Missing query' }, { status: 400 });
        const data = await quranProvider.searchQuran(q);
        return NextResponse.json({ ok: true, data });
      }
      case 'random': {
        const data = await quranProvider.getRandomAyah();
        return NextResponse.json({ ok: true, data });
      }
      default:
        return NextResponse.json({ ok: false, error: 'Unknown action' }, { status: 400 });
    }
  } catch (err) {
    console.error('Qur\u2019an API error:', err);
    return NextResponse.json({ ok: false, error: 'Qur\u2019an source unavailable' }, { status: 502 });
  }
}
