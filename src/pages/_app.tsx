import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';

import '@/styles/globals.css';

import { ThemeProvider } from '@/components/ThemeProvider';

export default function App({ Component, pageProps }: AppProps) {
  const { session, ...rest } = pageProps as { session?: any };
  return (
    <SessionProvider session={session}>
      <ThemeProvider>
        <Component {...rest} />
      </ThemeProvider>
    </SessionProvider>
  );
}





