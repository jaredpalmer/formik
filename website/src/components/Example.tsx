import 'css/example.css';
import * as React from 'react';
import { Nav } from 'components/Nav';
import { Col, Block } from 'components/Primitives';
import { media, COLORS } from 'theme';
import { Head } from 'components/Head';

const prism = require('prismjs');

export interface ExampleProps {
  js: string;
  component: React.ReactNode;
  color: string;
  title: string;
  description: string;
}

export interface ExampleState {
  isOpen: boolean;
  visible: 'js' | 'ts';
}

export class Example extends React.Component<ExampleProps, ExampleState> {
  constructor(props: ExampleProps, context: any) {
    super(props, context);

    this.state = {
      isOpen: false,
      visible: 'js',
    };
  }

  toggle = () => {
    this.setState(s => ({ isOpen: !s.isOpen }));
  };

  showTs = () => {
    this.setState({ visible: 'ts' });
  };

  showJs = () => {
    this.setState({ visible: 'js' });
  };

  render() {
    const { color, title, description } = this.props;
    const themeColor =
      color === 'base'
        ? COLORS.base
        : color === 'black' ? COLORS.black : COLORS[color][5];
    return (
      <Nav title={title}>
        <Head title={title} description={description} />
        <div id="debugger-portal-target" />
        <Block
          className={`formik-example formik-example--${color}`}
          height="100%"
        >
          <Col
            height="100%"
            css={{
              [media.greaterThan('xlarge')]: {
                flexDirection: 'row',
                height: '100vh',
              },
            }}
          >
            <Block
              background={themeColor}
              padding="4rem 2rem"
              flex="4"
              position="relative"
            >
              <Block
                borderRadius="4px"
                boxShadow="0 8px 16px rgba(0,0,0,.2)"
                background="#fff"
                maxWidth={400}
                margin="0 auto"
                padding="2rem"
              >
                {(this.props.component as any)()}
              </Block>
            </Block>

            <Col
              flex="5"
              alignItems="flex-start"
              justifyContent="flex-start"
              overflowX="scroll"
              background="#2d2d2d"
            >
              <Block
                component="pre"
                className="language-js"
                margin="auto"
                padding="2rem"
                width="100%"
                flex="1"
                fontSize={13}
                props={{
                  dangerouslySetInnerHTML: {
                    __html: prism.highlight(
                      this.props.js
                        .replace(`<Debugger />`, '')
                        .replace(
                          `import { Debugger } from '../components/Debugger';\n`,
                          ''
                        ),
                      prism.languages.javascript
                    ),
                  },
                }}
              />
            </Col>
          </Col>
        </Block>
      </Nav>
    );
  }
}
