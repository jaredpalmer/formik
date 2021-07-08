import * as React from 'react';

export const Collapse: React.FC = props => {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div>
      <button type="button" onClick={() => setCollapsed(!collapsed)}>
        Collapse
      </button>
      <div
        style={{
          overflow: 'hidden',
          height: collapsed ? 0 : 'auto',
        }}
      >
        {props.children}
      </div>
    </div>
  );
};
