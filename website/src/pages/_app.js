import '@docsearch/css';
import '../styles/index.css';
import Head from 'next/head';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <script async defer src="https://buttons.github.io/buttons.js"></script>
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
