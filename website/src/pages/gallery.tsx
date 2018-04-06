import * as React from 'react';
import { Row, Block } from 'components/Primitives';

import { Container } from 'components/Container';
import { Card } from 'components/Card';

// Please note that you can use https://github.com/dotansimha/graphql-code-generator
// to generate all types from graphQL schema
interface GalleryPageProps {
  data: {
    site: {
      siteMetadata: {
        siteName: string;
      };
    };
  };
}

export default class Gallery extends React.Component<GalleryPageProps, {}> {
  constructor(props: GalleryPageProps, context: any) {
    super(props, context);
  }
  render() {
    return (
      <Block height="100%">
        <Container>
          <Block fontWeight={800}>Formik</Block>
        </Container>
        <Block padding="4rem 0" background="#fff">
          <Container>
            <Block
              component="h1"
              fontWeight={800}
              fontSize="4rem"
              letterSpacing="-.02em"
            >
              Gallery
            </Block>

            {/* <Link to="/docs/philosophy">Get Started</Link> */}
          </Container>
        </Block>

        <Block padding="2rem 0">
          <Container>
            <Row
              justifyContent="space-around"
              textAlign="center"
              alignItems="center"
              flexWrap="wrap"
            >
              <Block>Basic</Block>
            </Row>
          </Container>
        </Block>

        <Block padding="4rem 0" background="#fff">
          <Container>
            <Row
              justifyContent="space-between"
              padding="4rem 0"
              margin="0 auto"
              maxWidth="67rem"
              textAlign="center"
              alignItems="center"
              flexWrap="wrap"
            >
              <Block flex="1" textAlign="left">
                <Block
                  fontWeight={800}
                  fontSize="2rem"
                  marginBottom=".5rem"
                  lineHeight="1.3"
                >
                  Async Validation
                </Block>
                <Block fontWeight={800} color="#777" fontSize="1.2rem">
                  Tyler Martinez, UI Engineer @ Docker
                </Block>
              </Block>
              <Block flex="1">
                <Card>
                  <input type="text" />
                </Card>
              </Block>
            </Row>
          </Container>
        </Block>
      </Block>
    );
  }
}

export const pageQuery = graphql`
  query GalleryQuery {
    site {
      siteMetadata {
        siteName
      }
    }
  }
`;
