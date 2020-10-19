import React from 'react';
import Link from 'next/link';

function Home() {
  return (
    <main>
      <h1>Formik Examples and Fixtures</h1>
      <ul>
        <li>
          <Link href="/basic">
            <a>Basic</a>
          </Link>
        </li>
        <li>
          <Link href="/async-submission">
            <a>Async Submission</a>
          </Link>
        </li>
      </ul>
      <style jsx>{`
        main {
          max-width: 500px;
          margin: 2rem auto;
          padding-bottom: 20rem;
        }
        a {
          display: block;
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
          color: rgb(68, 122, 221);
          text-decoration: underline;
          font-size: 20px;
        }
        ul {
          margin: 0;
          padding: 0;
        }
        li {
          margin-left: 1rem;
        }
      `}</style>
    </main>
  );
}

export default Home;
