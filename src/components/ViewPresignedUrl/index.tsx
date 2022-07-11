import React from 'react';

type Props = { presingedUrl: string };

function ViewPresignedUrl({ presingedUrl }: Props) {
  const url = new URL(presingedUrl);
  const pathname = url.pathname;

  // Find the filetype from the s3_key
  const split_path = pathname.split('.');
  const filetype = split_path[split_path.length - 1];

  if (['png', 'jpg'].includes(filetype)) {
    return (
      <img
        style={{
          maxHeight: '100%',
          maxWidth: '100%',
          backgroundColor: 'white',
          padding: '1px',
        }}
        onClick={() => window.open(presingedUrl, '_blank')}
        src={presingedUrl}
      />
    );
  }

  if (filetype == 'html') {
    return (
      <iframe
        src={presingedUrl}
        style={{
          height: '100%',
          maxWidth: '100%',
          backgroundColor: 'white',
          padding: '1px',
          position: 'absolute',
          left: 0,
          width: '100%',
        }}
      />
    );
  }

  return <div>Cannot display file</div>;
}

export default ViewPresignedUrl;
