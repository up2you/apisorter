import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en" className="bg-midnight">
        <Head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
            rel="stylesheet"
          />
          <meta name="theme-color" content="#0d1117" />
        </Head>
        <body className="bg-midnight">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;





