import '@docsearch/css';
import '../styles/index.css';
import { Analytics } from '@vercel/analytics/react';

function MyApp({ Component, pageProps }) {
  return (
    <div id='container'>
      <Component {...pageProps} />
      <Analytics />
    </div>
  );
}

export default MyApp;
