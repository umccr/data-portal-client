import React from 'react';
import JSONPretty from 'react-json-pretty';

import './index.css';

const cssTheme = {
  main: 'line-height:1.3;color:#a21515;background:#ffffff;overflow:auto;',
  error: 'line-height:1.3;color:#a21515;background:#ffffff;overflow:auto;',
  key: 'color:#a21515;',
  string: 'color:#0551a5;',
  value: 'color:#0b8658;',
  boolean: 'color:#0551a5;',
};

type Props = { data: Record<string, any>; wrapperClassName?: string };

export default function StyledJsonPretty({ data, wrapperClassName }: Props) {
  return (
    <div className={wrapperClassName}>
      <JSONPretty
        id='json-pretty'
        data={data}
        theme={cssTheme}
        style={{
          borderRadius: '5px',
          width: '100%',
          minWidth: '100%',
        }}
      />
    </div>
  );
}
