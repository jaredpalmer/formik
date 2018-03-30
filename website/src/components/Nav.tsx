import * as React from 'react';

import { Route, RouteComponentProps, Switch } from 'react-router-dom';

import { Sidebar } from 'components/Sidebar';
import { SidebarInner } from 'components/SidebarInner';
import { Block } from 'components/Primitives';
import { media } from 'theme';
import { AppBar } from 'components/AppBar';

const Media = require('react-media');
export interface NavProps {
  children?: any;
  title: string;
}

export interface NavState {
  isOpen: boolean;
}

export class Nav extends React.Component<NavProps, NavState> {
  state = {
    isOpen: false,
  };

  componentDidMount() {
    window.addEventListener('resize', this.forceClose, false);
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.forceClose, false);
  }

  forceClose = () => {
    if (window.matchMedia(media.greaterThan('small', true)).matches) {
      this.setState({ isOpen: false });
    }
  };

  toggle = () => this.setState(s => ({ isOpen: !s.isOpen }));

  render() {
    const { isOpen } = this.state;
    const { title } = this.props;
    return (
      <Media query={media.greaterThan('small', true)}>
        {(isDesktop: boolean) => (
          <Block height="100%" flex="1">
            {!isDesktop && <AppBar title={title} />}
            <Block paddingTop={isDesktop ? 0 : 50}>
              {!isDesktop && isOpen /** destroy errthing when nav is open */ ? (
                <Sidebar isDesktop={isDesktop} />
              ) : (
                <Switch>
                  <Route
                    path="/docs"
                    render={(props: RouteComponentProps<any>) => (
                      <Block>
                        {isDesktop ? <Sidebar isDesktop={isDesktop} /> : null}
                        <SidebarInner>{this.props.children}</SidebarInner>
                      </Block>
                    )}
                  />
                  <Route
                    path="/examples"
                    render={(props: RouteComponentProps<any>) => (
                      <Block>
                        {isDesktop ? <Sidebar isDesktop={isDesktop} /> : null}
                        <SidebarInner>{this.props.children}</SidebarInner>
                      </Block>
                    )}
                  />
                  <Route
                    path="/"
                    exact={true}
                    render={(props: RouteComponentProps<any>) => (
                      <Block>{this.props.children}</Block>
                    )}
                  />
                </Switch>
              )}
            </Block>
          </Block>
        )}
      </Media>
    );
  }
}
