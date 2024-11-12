import * as React from 'react';
import { siteConfig } from 'siteConfig';
import { Footer } from 'components/Footer';
import { Banner } from 'components/Banner';
import { Sticky } from 'components/Sticky';
import { Nav } from 'components/Nav';
import { Container } from 'components/Container';
import { Seo } from 'components/Seo';
import { users } from 'users';
import { Inter } from 'next/font/google';
import cn from 'classnames';
const inter = Inter({ subsets: ['latin'] });

export interface UsersProps {}

const Users: React.FC<UsersProps> = props => {
  const editUrl = `${siteConfig.repoUrl}/edit/main/website/src/users.ts`;
  const showcase = users.map(user => (
    <a
      href={user.infoLink}
      key={user.infoLink}
      className="flex items-center justify-center"
    >
      <img
        src={user.image}
        alt={user.caption}
        title={user.caption}
        style={user.style}
      />
    </a>
  ));
  return (
    <div className={cn('h-full min-h-full', inter.className)}>
      <Banner />
      <Sticky>
        <Nav />
      </Sticky>
      <Seo
        title="User Showcase"
        description="Companies and projects using Formik in production."
      />
      <Container>
        <div className="container px-4 lg:px-0 my-12 space-y-12">
          <div className="lg:text-center">
            <p className="text-base font-semibold leading-6 tracking-wide text-blue-600 uppercase">
              Showcase
            </p>
            <h1 className="mt-2 text-3xl font-extrabold leading-8 tracking-tight text-gray-900 sm:text-4xl sm:leading-10">
              Who's using Formik?
            </h1>
            <p className="max-w-2xl mt-4 text-xl leading-7 text-gray-500 lg:mx-auto">
              Formik is the world's most popular form library for React and
              React Native. It's trusted by hundreds of thousands of developers
              in production including teams at Airbnb, Walmart, Stripe, Lyft,
              NASA, US Army and more.
            </p>
          </div>

          <div className="px-4 grid items-center grid-cols-3 gap-16 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 ">
            {showcase}
          </div>
          <div className="space-y-6 text-center md:space-y-10">
            <div className="max-w-2xl mt-4 text-2xl font-bold leading-7 text-gray-900 md:text-5xl lg:mx-auto">
              Are you using Formik?
            </div>
            <a
              href={editUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center max-w-sm px-8 py-3 mx-auto text-base font-medium leading-6 text-white transition duration-150 ease-in-out bg-blue-600 border border-transparent rounded-md hover:bg-blue-500 focus:outline-none focus:border-blue-700 focus:ring focus:ring-blue md:py-4 md:text-lg md:px-10"
            >
              Add your company
            </a>
          </div>
        </div>
      </Container>

      <Footer />
    </div>
  );
};

Users.displayName = 'Users';

export default Users;
