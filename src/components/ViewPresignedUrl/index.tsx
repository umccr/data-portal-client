import React from 'react';

const IMAGE_FILETYPE_LIST: string[] = ['png', 'jpg', 'jpeg'];
const HTML_FILETYPE_LIST: string[] = ['html'];
/**
 * For Temporary only support Image filetype due to cors-origin policy
 * TODO: Uncomment the following constants below
 */
// const DELIMITER_SERPERATED_VALUE_FILETYPE_LIST: string[] = ['csv', 'tsv'];
// const PLAIN_FILETYPE_LIST: string[] = ['txt', 'md5sum'];
// const OTHER_FILETYPE_LIST: string[] = ['json', 'yaml'];

export const DATA_TYPE_SUPPORTED = [
  ...IMAGE_FILETYPE_LIST,
  ...HTML_FILETYPE_LIST,
  /**
   * For Temporary only support Image filetype due to cors-origin policy
   * TODO: Uncomment the following constants below
   */
  // ...DELIMITER_SERPERATED_VALUE_FILETYPE_LIST,
  // ...PLAIN_FILETYPE_LIST,
  // ...OTHER_FILETYPE_LIST,
];
type Props = { presingedUrl: string };

function ViewPresignedUrl({ presingedUrl }: Props) {
  let pathname = '';
  try {
    const url = new URL(presingedUrl);
    pathname = url.pathname;
  } catch (error) {
    return <div className='pi pi-exclamation-triangle text-xl' />;
  }

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
