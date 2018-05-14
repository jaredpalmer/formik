import * as React from 'react';

import { Nav } from 'components/Nav';
import { Block } from 'components/Primitives';
import { Head } from 'components/Head';

interface BlogPostTemplateProps {
  data: {
    site: {
      siteMetadata: {
        siteName: string;
      };
    };
    markdownRemark: {
      id: string;
      html: string;
      frontmatter: {
        title: string;
        description: string;
        date: string;
        back: string;
      };
    };
  };
}

export default class BlogPostTemplate extends React.Component<
  BlogPostTemplateProps,
  {}
> {
  constructor(props: BlogPostTemplateProps, context: any) {
    super(props, context);
  }
  public render() {
    const post = this.props.data.markdownRemark;

    return (
      <Block>
        <Nav title={post.frontmatter.title}>
          <Head
            title={post.frontmatter.title}
            description={post.frontmatter.description}
          />
          <Block className="text-content-wrapper">
            <div
              className="text-content"
              dangerouslySetInnerHTML={{ __html: post.html }}
            />
          </Block>
        </Nav>
      </Block>
    );
  }
}

export const pageQuery = graphql`
  query BlogPostByPath($path: String!) {
    site {
      siteMetadata {
        siteName
      }
    }
    markdownRemark(frontmatter: { path: { eq: $path } }) {
      id
      html
      frontmatter {
        title
        description
        date
        back
      }
    }
  }
`;
