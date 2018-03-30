import * as React from 'react';
import { Block, View } from 'components/Primitives';
import { Text } from 'components/Text';

export interface AppBarProps {
  renderLeftArea?: () => React.ReactNode | React.ReactNode;
  renderCenterArea?: () => React.ReactNode | React.ReactNode;
  renderRightArea?: () => React.ReactNode | React.ReactNode;
  title?: string;
}

export const AppBar: React.SFC<AppBarProps> = ({
  renderLeftArea,
  renderCenterArea,
  renderRightArea,
  title,
}) => {
  return (
    <Block
      zIndex="999"
      position="fixed"
      top="0"
      left="0"
      right="0"
      background="#fff"
      paddingLeft="1rem"
      paddingRight="1rem"
    >
      <View
        display="table"
        verticalAlign="top"
        paddingLeft="1rem"
        paddingRight="1rem"
        height={50}
        width="100%"
      >
        <View
          display="table-cell"
          textAlign="left"
          verticalAlign="middle"
          width="10%"
          zIndex="400"
        >
          {renderLeftArea && renderLeftArea()}
        </View>
        <View
          display="table-cell"
          textAlign="center"
          verticalAlign="middle"
          width="80%"
          zIndex="400"
        >
          {renderCenterArea && renderCenterArea()}
          {title && (
            <Text component="h1" size={6} fontWeight="800">
              {title}
            </Text>
          )}
        </View>
        <View
          display="table-cell"
          textAlign="right"
          verticalAlign="middle"
          width="10%"
          zIndex="400"
        >
          {renderRightArea && renderRightArea()}
        </View>
      </View>
    </Block>
  );
};

AppBar.displayName = 'AppBar';
