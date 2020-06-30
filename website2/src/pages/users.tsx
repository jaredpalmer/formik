import * as React from 'react';
import { siteConfig } from 'siteConfig';
import { Footer } from 'components/Footer';
import { Banner } from 'components/Banner';
import { Sticky } from 'components/Sticky';
import { Nav } from 'components/Nav';
import { Container } from 'components/Container';
import { Seo } from 'components/Seo';

export interface UsersProps {}

const Users: React.FC<UsersProps> = props => {
  const editUrl = `${siteConfig.repoUrl}/edit/master/website/src/siteConfig.ts`;
  const showcase = siteConfig.users.map(user => (
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
    <div className="bg-gray-50 h-full min-h-full overflow-y-auto">
      <Banner />
      <Sticky>
        <Nav />
      </Sticky>
      <Seo title="Showcase" />
      <Container>
        <div className="my-12 space-y-12">
          <div className="lg:text-center">
            <p className="text-base leading-6 text-blue-600 font-semibold tracking-wide uppercase">
              Showcase
            </p>
            <h1 className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 font-semibold">
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
          <div className="text-center space-y-6">
            <div className="mt-4 max-w-2xl text-2xl leading-7 text-gray-900 lg:mx-auto">
              Are you using Formik?
            </div>
            <a
              href={editUrl}
              target="_blank"
              className="button-secondary text-xl"
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
