import * as React from 'react';
import { siteConfig } from 'siteConfig';
import { Footer } from 'components/Footer';
import { Banner } from 'components/Banner';
import { Sticky } from 'components/Sticky';
import { Nav } from 'components/Nav';
import { Container } from 'components/Container';
import { Seo } from 'components/Seo';
import { users } from 'users';
export interface UsersProps {}

const Users: React.FC<UsersProps> = props => {
  const editUrl = `${siteConfig.repoUrl}/edit/master/docs/src/users.ts`;
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
    <div className=" h-full min-h-full">
      <Banner />
      <Sticky>
        <Nav />
      </Sticky>
      <Seo
        title="User Showcase"
        description="Companies and projects using Formik in production."
      />
      <Container>
        <div className="my-12 space-y-12">
          <div className="lg:text-center">
            <p className="text-base leading-6 text-blue-600 font-semibold tracking-wide uppercase">
              Showcase
            </p>
            <h1 className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10">
              Who's using Formik?
            </h1>
            <p className="mt-4 max-w-2xl text-xl leading-7 text-gray-500 lg:mx-auto">
              Formik is the world's most popular form library for React and
              React Native. It's trusted by hundreds of thousands of developers
              in production including teams at Airbnb, Walmart, Stripe, Lyft,
              NASA, US Army and more.
            </p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-16 items-center ">
            {showcase}
          </div>
          <div className="text-center space-y-6 md:space-y-10">
            <div className="mt-4 max-w-2xl text-2xl md:text-5xl leading-7 text-gray-900 font-bold lg:mx-auto">
              Are you using Formik?
            </div>
            <a
              href={editUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex max-w-sm mx-auto items-center justify-center px-8 py-3 border border-transparent text-base leading-6 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:border-blue-700 focus:shadow-outline-blue transition duration-150 ease-in-out md:py-4 md:text-lg md:px-10 text-xl"
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
