import React, { useEffect } from 'react';
import { useQuery } from 'react-query';
import { useToastContext } from '../../providers/ToastProvider';
import CircularLoaderWithText from '../CircularLoaderWithText';
// Other Dependencies
import JSONPretty from 'react-json-pretty';

import './index.css';

export const IMAGE_FILETYPE_LIST: string[] = ['png', 'jpg', 'jpeg'];
export const HTML_FILETYPE_LIST: string[] = ['html'];
export const DELIMITER_SEPARATED_VALUE_FILETYPE_LIST: string[] = ['csv', 'tsv'];
export const PLAIN_FILETYPE_LIST: string[] = ['txt', 'md5sum'];
export const OTHER_FILETYPE_LIST: string[] = ['json', 'yaml'];

export const DATA_TYPE_SUPPORTED = [
  ...IMAGE_FILETYPE_LIST,
  ...HTML_FILETYPE_LIST,
  ...DELIMITER_SEPARATED_VALUE_FILETYPE_LIST,
  ...PLAIN_FILETYPE_LIST,
  ...OTHER_FILETYPE_LIST,
];

async function getPreSignedUrlData(url: string) {
  const fetchResponse = await fetch(url);

  if (fetchResponse.status < 200 && fetchResponse.status >= 300) {
    throw Error('Non 20X status response from presigned url');
  }

  const responseString = await fetchResponse.text();
  return responseString;
}

type Props = { presingedUrl: string };
function ViewPresignedUrl({ presingedUrl }: Props) {
  const { toastShow } = useToastContext();

  let pathname = '';
  try {
    const url = new URL(presingedUrl);
    pathname = url.pathname;
  } catch (error) {
    return (
      <div className='h-full flex justify-content-center align-items-center pi pi-exclamation-triangle text-xl' />
    );
  }

  // Find the filetype from the s3_key
  const split_path = pathname.split('.');
  const filetype = split_path[split_path.length - 1];

  // Download data if needed be
  const isDownloadable = ![...IMAGE_FILETYPE_LIST, ...HTML_FILETYPE_LIST].includes(filetype);

  if (!isDownloadable) {
    if (IMAGE_FILETYPE_LIST.includes(filetype)) {
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

    if (HTML_FILETYPE_LIST.includes(filetype)) {
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
  } else {
    const { isFetching, isLoading, isError, data } = useQuery(
      ['getPresignedContent', presingedUrl],
      () => getPreSignedUrlData(presingedUrl),
      { enabled: isDownloadable }
    );

    useEffect(() => {
      if (isError) {
        toastShow({
          severity: 'error',
          summary: 'Something went wrong!',
          detail: 'Unable to load presignedUrl content.',
          life: 3000,
        });
      }
    }, [isError]);

    if (isLoading || isFetching || !data) {
      return <CircularLoaderWithText text='Fetching Content' />;
    }

    if (filetype == 'json') {
      const cssTheme = {
        main: 'line-height:1.3;color:#a21515;background:#ffffff;overflow:auto;',
        error: 'line-height:1.3;color:#a21515;background:#ffffff;overflow:auto;',
        key: 'color:#a21515;',
        string: 'color:#0551a5;',
        value: 'color:#0b8658;',
        boolean: 'color:#0551a5;',
      };

      // Sanitize if JSON is
      try {
        const JSONParse = JSON.parse(data);
        return (
          <JSONPretty
            id='json-pretty'
            data={JSONParse}
            theme={cssTheme}
            style={{
              borderRadius: '5px',
              width: '100%',
              minWidth: '100%',
            }}
          />
        );
      } catch (err) {
        return (
          <div>
            <p>ERROR</p>
          </div>
        );
      }
    }

    if (
      [...DELIMITER_SEPARATED_VALUE_FILETYPE_LIST, ...PLAIN_FILETYPE_LIST, 'yaml'].includes(
        filetype
      )
    ) {
      return (
        <div style={{ maxHeight: '80vh', maxWidth: '100%', margin: '1rem' }}>
          <pre
            style={{
              minWidth: '50vw',
              display: 'inline-block',
              borderRadius: '5px',
              border: '1px solid black',
              backgroundColor: 'white',
              padding: '1rem',
              margin: 0,
            }}>
            {data}
          </pre>
        </div>
      );
    }
  }

  return <div>Cannot display file</div>;
}

export default ViewPresignedUrl;
