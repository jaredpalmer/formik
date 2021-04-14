import React from 'react';
import Link from 'next/link';

function Home() {
  return (
    <main>
      <h1>Formik Tutorial and Fixtures</h1>
      <nav>
        <h2>Tutorial</h2>
        <ul>
          <li>
            <Link href="/tutorial/basic">
              <a>Basic Form</a>
            </Link>
          </li>
          <li>
            <Link href="/tutorial/sign-in">
              <a>Sign In</a>
            </Link>
          </li>
          <li>
            <Link href="/tutorial/parse-format">
              <a>Parse / Format</a>
            </Link>
          </li>
          <li>
            <Link href="/tutorial/field-array">
              <a>Field Array</a>
            </Link>
          </li>
        </ul>
      </nav>
      <nav>
        <h2>Development and Testing Fixtures</h2>
        <ul>
          <li>
            <Link href="/fixtures/components">
              <a>Components</a>
            </Link>
          </li>
          <li>
            <Link href="/fixtures/perf">
              <a>Performance (general)</a>
            </Link>
          </li>
          <li>
            <Link href="/fixtures/perf500">
              <a>Performance (500 different inputs)</a>
            </Link>
          </li>
          <li>
            <Link href="/fixtures/perf500-same">
              <a>Performance (500 same inputs)</a>
            </Link>
          </li>
          <li>
            <Link href="/fixtures/tearing">
              <a>Tearing Tests</a>
            </Link>
          </li>
        </ul>
      </nav>
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
