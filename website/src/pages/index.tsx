import * as React from 'react';
import { Block } from 'components/Primitives';
import Link from 'gatsby-link';

// Please note that you can use https://github.com/dotansimha/graphql-code-generator
// to generate all types from graphQL schema
interface IndexPageProps {
  data: {
    site: {
      siteMetadata: {
        siteName: string;
      };
    };
  };
}

export default class Index extends React.Component<IndexPageProps, {}> {
  constructor(props: IndexPageProps, context: any) {
    super(props, context);
  }

  render() {
    return (
      <div>
        <Block component="h1">Formik</Block>
        <Link to="/docs/basics">Basics</Link>
        <Link to="/docs/api">API Reference</Link>
      </div>
    );
  }
}

export const pageQuery = graphql`
  query IndexQuery {
    site {
      siteMetadata {
        siteName
      }
    }
  }
`;
