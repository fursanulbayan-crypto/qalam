import type { Metadata } from 'next';
import './globals.css';
import { THEME_INIT_SCRIPT } from '@/lib/theme';

export const metadata: Metadata = {
  title: 'Qalam — Arabic & English Typing Trainer',
  description: 'Practice typing in Arabic and English, with authentic Qur\u2019an and Hadith sources.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Runs before paint so the stored theme applies immediately — no flash of the wrong theme. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
