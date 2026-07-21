import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en" suppressHydrationWarning>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content="Echo - Your Social Audio Journal" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function() { try { var storedTheme = localStorage.getItem('echo-theme'); var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches; var theme = storedTheme === 'dark' || (!storedTheme && systemDark) ? 'dark' : 'light'; var root = document.documentElement; root.classList.toggle('dark', theme === 'dark'); root.style.colorScheme = theme; } catch (error) {} })();`,
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
