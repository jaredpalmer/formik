import * as React from 'react';

export const DebugProps = (props?: any) => {
  const renderCount = React.useRef(0);
  return (
    <div style={{ margin: '1rem 0' }}>
      <pre
        style={{
          background: '#f6f8fa',
          fontSize: '.65rem',
          padding: '.5rem',
        }}
      >
        <strong>props</strong> = {JSON.stringify(props, null, 2)}
        <strong>renders</strong> = {renderCount.current++}
      </pre>
    </div>
  );
};
