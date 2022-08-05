import React from 'react';
import { useFormikSelector } from 'formik';

export const Debug = () => {
  const rest = useFormikSelector(
    ({ validationSchema, validate, onSubmit, ...rest }) => rest
  );

  return (
    <div
      style={{
        margin: '3rem 1rem',
        borderRadius: 4,
        background: '#f6f8fa',
        boxShadow: '0 0 1px  #eee inset',
      }}
    >
      <div
        style={{
          textTransform: 'uppercase',
          fontSize: 11,
          borderTopLeftRadius: 4,
          borderTopRightRadius: 4,
          fontWeight: 500,
          padding: '.5rem',
          background: '#555',
          color: '#fff',
          letterSpacing: '1px',
        }}
      >
        Formik State
      </div>
      <pre
        style={{
          fontSize: '.85rem',
          padding: '.25rem .5rem',
          overflowX: 'scroll',
        }}
      >
        {JSON.stringify(rest, null, 2)}
      </pre>
    </div>
  );
};
