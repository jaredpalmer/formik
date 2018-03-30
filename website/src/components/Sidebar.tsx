import * as React from 'react';

import { Block, InlineBlock } from './Primitives';

import { Link } from 'components/Link';
import { Mark } from 'components/Mark';
import { APILINKS } from 'navigation';
import { COLORS, SIDEBAR_WIDTH, TYPE_SCALE, FONTS } from 'theme';
import { Text } from 'components/Text';
import { css } from 'glamor';

export interface SidebarProps {
  isDesktop: boolean;
}

export interface SidebarState {}

export class Sidebar extends React.Component<SidebarProps, SidebarState> {
  render() {
    const { isDesktop } = this.props;
    const sidebarWidth = isDesktop ? SIDEBAR_WIDTH : '100%';
    return (
      <Block width={sidebarWidth} height="100%">
        <Block
          width={sidebarWidth}
          height="100%"
          position="fixed"
          background="#fff"
          top="0"
          left="0"
          overflow="scroll"
        >
          <Block margin="2rem 2rem 0" textAlign="center">
            <Mark color={COLORS.black} height={72} width={66} />
            <Block>
              <Text color="#000" size={3} fontWeight={800}>
                Formik
              </Text>
            </Block>
          </Block>
          <Block>
            <Block
              component="input"
              fontSize="1rem"
              margin="1rem auto"
              padding=".25rem .5rem"
              borderRadius="4px"
              outline="0"
              border={`1px solid ${COLORS.gray[2]}`}
              props={{
                placeholder: 'Search docs...',
              }}
            />
          </Block>
          {APILINKS.map((section, i) => (
            <Block key={`section-${section.title + i}`} width="100%">
              <Link
                className={
                  css({
                    display: 'block',
                    padding: '1.5rem 2rem .5rem',
                    textTransform: 'uppercase',
                    fontWeight: 500,
                    fontSize: TYPE_SCALE[7],
                    letterSpacing: '.1em',
                    color: COLORS.gray[6],
                  }) as any
                }
                activeClassName={css({ color: COLORS.base }) as any}
                to={section.to}
              >
                {section.title}
              </Link>

              {Object.keys(section.links).length > 0 &&
                Object.keys(section.links).map((link: any, j: number) => (
                  <Block
                    padding=".5rem 2rem"
                    fontSize={TYPE_SCALE[7]}
                    key={`section-link-${link}${j}`}
                  >
                    {(section.links[link] as any).links ? (
                      <Link
                        className="nav-link"
                        activeClassName="active"
                        to={(section.links[link] as any).to}
                      >
                        <InlineBlock
                          fontFamily={FONTS.monospace}
                          color={COLORS.black}
                          fontWeight="600"
                          padding=".5rem 0 .25rem"
                        >
                          {link}
                        </InlineBlock>
                      </Link>
                    ) : (
                      <Link
                        className="nav-link"
                        activeClassName="active"
                        to={(section.links[link] as any) as any}
                      >
                        {link}
                      </Link>
                    )}

                    {((section.links[link] as any) as any).links &&
                      Object.keys(
                        ((section.links[link] as any) as any).links
                      ).map(kid => (
                        <Block
                          padding=".25rem .5rem"
                          key={`section-link-${kid}`}
                        >
                          <Link
                            className="nav-link"
                            activeClassName="active"
                            to={
                              ((section.links[link] as any) as any).links[kid]
                            }
                          >
                            <Text fontFamily={FONTS.monospace} size={8}>
                              {kid}
                            </Text>
                          </Link>
                        </Block>
                      ))}
                  </Block>
                ))}
            </Block>
          ))}
          <Text size={8} padding="1rem">
            Copyright 2017 Jared Palmer. {`Made with <3 in NYC.`}
          </Text>
        </Block>
      </Block>
    );
  }
}
