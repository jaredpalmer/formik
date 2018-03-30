import * as React from 'react';
import { Helmet } from 'react-helmet';

export interface HeadProps {
  title: string;
  description: string;
  image?: string;
}

export const Head: React.SFC<HeadProps> = ({ title, description, image }) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta property="og:site_name" content="Formik" />
      <meta name="og:url" content="http://jaredpalmer.com/formik" />
      <meta name="og:title" content={title} />
      <meta name="og:description" content={description} />
      {image && <meta name="og:image" content={image} />}
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={title} />
      {image && <meta name="twitter:image" content={image} />}
      <meta name="twitter:url" content="" />
      <meta name="twitter:site" content="@jaredpalmer" />
      <meta name="twitter:description" content={description} />
      <meta name="description" content={description} />
    </Helmet>
  );
};

Head.displayName = 'Head';
