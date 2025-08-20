import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { IBM_Plex_Mono } from 'next/font/google';
import Head from 'next/head';
import { Analytics } from '@vercel/analytics/react';

import { ToastContainer } from 'react-toastify';

import { AppProvider } from '@/lib/context';

const ibmPlexMono = IBM_Plex_Mono({
  weight: ['400', '500', '600'],
  variable: '--font-ibm-plex-mono',
  subsets: ['latin'],
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Yeezy Money</title>
        <meta property="og:title" content="Yeezy Money" />
        <meta property="og:image" content="/og-image.png" />
        <link rel="icon" type="image/png" href="/favicon-fixed.png" />
      </Head>

      <AppProvider>
              <div
                className={`${ibmPlexMono.variable} font-mono h-full font-medium`}
              >
                {/* <div className={`${ibmPlexMono.variable} font-mono h-full`}> */}
                <ToastContainer
                  className={'custom-toast-class'}
                  theme={'light'}
                  autoClose={5000}
                  pauseOnHover
                  draggable={false}
                  pauseOnFocusLoss={false}
                  hideProgressBar
                />

                <Component {...pageProps} />
                <Analytics />
              </div>
              </AppProvider>
    </>
  );
}
