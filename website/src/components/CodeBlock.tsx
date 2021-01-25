import { mdx } from '@mdx-js/react';
import Component from '@reactions/component';
import React, { useState } from 'react';
import { useButton } from 'react-aria';
import { LiveEditor, LiveError, LivePreview, LiveProvider } from 'react-live';
import { TWButton } from './TWButton';
import { useClipboard } from './useClipboard';

export const liveEditorStyle: any = {
  fontSize: 14,
  overflowX: 'auto',
  color: '#f8f8f2',
  fontFamily: 'SFMono-Regular,Consolas,Liberation Mono,Menlo,monospace',
  height: '100%',
  background: '#161e2e',
};

export const liveErrorStyle: any = {
  fontFamily: 'SFMono-Regular,Consolas,Liberation Mono,Menlo,monospace',
  fontSize: 12,
  padding: '1em',

  overflowX: 'auto',
  color: 'white',
  backgroundColor: 'red',
};

const LiveCodePreview = (props: any) => (
  <div className="font-sans text-gray-900 rounded-md p-4 overflow-x-scroll">
    <LivePreview {...props} />
  </div>
);

const EditableNotice = (props: any) => {
  return (
    <div className="absolute right-0 top-0 p-3 text-gray-400 text-xs font-sans uppercase">
      Editable Example
    </div>
  );
};

const CopyButton = (props: {
  onPress: () => void;
  children: React.ReactNode;
}) => {
  const { children } = props;
  const ref = React.useRef<HTMLButtonElement | null>(null);
  const { buttonProps } = useButton(props, ref);
  return (
    <button
      {...buttonProps}
      className="text-gray-600 py-2 bg-gray-100 font-semibold w-full text-sm hover:bg-gray-200 transition duration-100 ease-in-out"
      ref={ref}
    >
      {children}
    </button>
  );
};

const CodeBlock = ({
  className,
  live = false,
  noInline = false,
  collapsed = false,
  isManual,
  render,
  children,
  ...props
}: any) => {
  const initialCode = React.useRef(children.trim());
  const [editorCode, setEditorCode] = useState(children.trim());

  const language = className && className.replace(/language-/, '');
  const [hasCopied, onCopy] = useClipboard(editorCode);
  const [isCollapsed, setCollapse] = React.useState<boolean>(collapsed);
  const liveProviderProps = {
    theme: {
      plain: {},
      styles: [],
    },
    language,

    code: editorCode,
    transformCode: (code: string) => `<>${code}</>`,
    scope: {
      mdx,
      Component,
    },
    noInline,
    ...props,
  };

  const handleCodeChange = (newCode?: any) =>
    setEditorCode(newCode ? newCode.trim() : '');

  if (language === 'jsx' && live === true) {
    return (
      <LiveProvider {...liveProviderProps}>
        <div className="border relative rounded shadow-sm">
          <LiveCodePreview />
          <EditableNotice />
          {isCollapsed ? (
            <div className="border-t">
              <CopyButton onPress={() => setCollapse(false)}>
                Show Code
              </CopyButton>
            </div>
          ) : (
            <>
              <div className="relative">
                <LiveEditor
                  onChange={handleCodeChange}
                  style={liveEditorStyle}
                  className="outline-none "
                />
                <div className="absolute right-0 top-0 p-2">
                  <TWButton
                    size="xs"
                    className="font-sans mr-2"
                    onPress={onCopy}
                  >
                    {hasCopied ? 'Copied' : 'Copy'}
                  </TWButton>
                  <TWButton
                    size="xs"
                    className="font-sans"
                    onPress={() => setEditorCode(initialCode.current)}
                  >
                    Reset
                  </TWButton>
                </div>
              </div>

              <LiveError style={liveErrorStyle} />
              <div className="border-t">
                <button
                  className="text-gray-600 py-2 bg-gray-100 font-semibold w-full text-sm hover:bg-gray-200 transition duration-100 ease-in-out"
                  onClick={() => setCollapse(true)}
                >
                  Hide Code
                </button>
              </div>
            </>
          )}
        </div>
      </LiveProvider>
    );
  }

  if (render) {
    return (
      <div style={{ marginTop: '40px' }}>
        <LiveProvider {...liveProviderProps}>
          <LiveCodePreview className="font-sans" />
        </LiveProvider>
      </div>
    );
  }

  return (
    <LiveProvider disabled {...liveProviderProps}>
      <div className="relative">
        <LiveEditor style={liveEditorStyle} className="rounded shadow-sm" />
        <div className="absolute right-0 top-0 p-2">
          <TWButton size="xs" className="font-sans" onPress={onCopy}>
            {hasCopied ? 'Copied' : 'Copy'}
          </TWButton>
        </div>
      </div>
    </LiveProvider>
  );
};

CodeBlock.defaultProps = {
  mountStylesheet: false,
};

export default CodeBlock;
