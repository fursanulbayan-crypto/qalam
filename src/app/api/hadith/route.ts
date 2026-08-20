import { NextRequest, NextResponse } from 'next/server';
import * as hadithProvider from '@/lib/content/hadithProvider';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');

  try {
    switch (action) {
      case 'collections': {
        const data = await hadithProvider.getCollections();
        return NextResponse.json({ ok: true, data });
      }
      case 'byCollection': {
        const slug = searchParams.get('slug');
        const page = Number(searchParams.get('page') || '1');
        if (!slug) return NextResponse.json({ ok: false, error: 'Missing collection slug' }, { status: 400 });
        const data = await hadithProvider.getHadithsByCollection(slug, page);
        return NextResponse.json({ ok: true, data });
      }
      case 'search': {
        const q = searchParams.get('q') || '';
        if (!q.trim()) return NextResponse.json({ ok: false, error: 'Missing query' }, { status: 400 });
        const data = await hadithProvider.searchHadith(q);
        return NextResponse.json({ ok: true, data });
      }
      case 'random': {
        const slug = searchParams.get('slug') || undefined;
        const data = await hadithProvider.getRandomHadith(slug);
        return NextResponse.json({ ok: true, data });
      }
      default:
        return NextResponse.json({ ok: false, error: 'Unknown action' }, { status: 400 });
    }
  } catch (err) {
    // Never leak raw provider/API errors (which could include key-related messages) to the client.
    console.error('Hadith API error:', err);
    return NextResponse.json({ ok: false, error: 'Hadith source unavailable' }, { status: 502 });
  }
}
