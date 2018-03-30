import * as React from 'react';
import * as JSX from 'glamor/jsxstyle';

export const View = JSX.View;
export const Row = JSX.Row;
export const Col = JSX.Column;
export const Block = JSX.Block;
export const Flex = JSX.Flex;
export const InlineBlock = JSX.InlineBlock;
export const Inline: React.SFC<any> = p => <View display="inline" {...p} />;
