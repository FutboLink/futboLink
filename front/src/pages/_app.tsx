import '@/app/globals.css';
import type { AppProps } from 'next/app';
import { UserProvider } from '@/components/Context/UserContext';
import { TranslationProvider } from '@/components/Context/TranslationContext';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <UserProvider>
      <TranslationProvider>
        <Component {...pageProps} />
      </TranslationProvider>
    </UserProvider>
  );
} 