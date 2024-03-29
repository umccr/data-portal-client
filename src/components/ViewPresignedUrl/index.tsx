import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { useToastContext } from '../../providers/ToastProvider';
import CircularLoaderWithText from '../CircularLoaderWithText';
import StyledJsonPretty from '../StyledJsonPretty';

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Checkbox } from 'primereact/checkbox';

export const IMAGE_FILETYPE_LIST: string[] = ['png', 'jpg', 'jpeg'];
export const IFRAME_FILETYPE_LIST: string[] = ['html', 'pdf'];
export const DELIMITER_SEPARATED_VALUE_FILETYPE_LIST: string[] = ['csv', 'tsv'];
export const PLAIN_FILETYPE_LIST: string[] = ['txt', 'md5sum'];
export const OTHER_FILETYPE_LIST: string[] = ['json', 'yaml'];

export const DATA_TYPE_SUPPORTED = [
  ...IMAGE_FILETYPE_LIST,
  ...IFRAME_FILETYPE_LIST,
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
export default function ViewPresignedUrl({ presingedUrl }: Props) {
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
  const filetype = split_path[split_path.length - 1].toLowerCase();

  // Return IMAGE display
  if (IMAGE_FILETYPE_LIST.includes(filetype)) {
    return (
      <div className='w-full h-full text-center'>
        <img
          className='max-w-full max-h-full bg-white'
          onClick={() => window.open(presingedUrl, '_blank')}
          src={presingedUrl}
        />
      </div>
    );
  }

  // Return HTML (via iframe) display
  if (IFRAME_FILETYPE_LIST.includes(filetype)) {
    return (
      <div className='w-full h-full'>
        <iframe className='w-full h-full bg-white' src={presingedUrl} />
      </div>
    );
  }

  // Data fetching
  const { isFetching, isLoading, isError, data } = useQuery(
    ['getPresignedContent', presingedUrl],
    () => getPreSignedUrlData(presingedUrl),
    {}
  );

  useEffect(() => {
    if (isError) {
      toastShow({
        severity: 'error',
        summary: 'Something went wrong!',
        detail: 'Unable to load presignedUrl content.',
        sticky: true,
      });
    }
  }, [isError]);
  const [isPrettifyPreview, setIsPrettifyPreview] = useState<boolean>(true);

  if (isLoading || isFetching || !data) {
    return <CircularLoaderWithText text='Fetching Content' />;
  }

  // Return JSON
  if (filetype == 'json') {
    // Sanitize if JSON is
    try {
      const JSONParse = JSON.parse(data);
      return (
        <div className='w-full h-full overflow-auto'>
          <StyledJsonPretty data={JSONParse} />
        </div>
      );
    } catch (err) {
      return (
        <div>
          <p>ERROR</p>
        </div>
      );
    }
  }

  // Return Delimiter Value Content
  if (DELIMITER_SEPARATED_VALUE_FILETYPE_LIST.includes(filetype)) {
    let delimiter = '';
    if (filetype == 'tsv') delimiter = '\t';
    if (filetype == 'csv') delimiter = ',';

    // Sanitize and split string
    const sanitizeContent: string = data.replaceAll('\r\n', '\n');
    const allRows: string[] = sanitizeContent.split('\n');
    const headerRow: string[] = allRows[0].split(delimiter);

    // Template for each cell
    const cellContentTemplate = (rowString: string, prop: { field: string }) => {
      const rowData = rowString.split(delimiter);
      return <div>{rowData[parseInt(prop.field)]} </div>;
    };
    const rowNumTemplate = (_: string, prop: { rowIndex: number }) => {
      return <pre className='m-0'>{prop.rowIndex + 2} </pre>;
    };
    return (
      <div className='w-full h-full flex flex-column'>
        <div className='mb-2 flex align-items-center'>
          <Checkbox
            className='ml-1'
            checked={isPrettifyPreview}
            onChange={() => setIsPrettifyPreview((p) => !p)}
          />
          <div className='ml-2'>Table View</div>
        </div>

        {isPrettifyPreview ? (
          <DataTable
            showGridlines
            rowHover
            value={Object.assign(allRows.slice(1))}
            className={allRows.length == 0 ? 'hidden' : 'overflow-auto'}>
            <Column
              body={rowNumTemplate}
              header={<pre className='m-0'>1</pre>}
              headerClassName='text-color bg-white border-right-1 border-y-none'
              bodyClassName='border-right-1 border-y-none py-1'
            />
            {headerRow.map((colName, idx) => (
              <Column
                key={idx}
                header={colName}
                headerClassName='text-color font-bold surface-200 border-none'
                field={`${idx}`}
                body={cellContentTemplate}
                bodyClassName='py-1'
              />
            ))}
          </DataTable>
        ) : (
          <pre
            className='overflow-auto inline-block m-0 p-3 w-full bg-white border-1 border-solid border-900 border-round-xs'
            style={{
              minWidth: '50vw',
            }}>
            {data}
          </pre>
        )}
      </div>
    );
  }

  // Return Raw plain text display
  if (
    [...DELIMITER_SEPARATED_VALUE_FILETYPE_LIST, ...PLAIN_FILETYPE_LIST, 'yaml'].includes(filetype)
  ) {
    return (
      <div className='w-full h-full flex'>
        <pre
          className='overflow-auto inline-block m-0 p-3 w-full bg-white border-1 border-solid border-900 border-round-xs'
          style={{
            minWidth: '50vw',
          }}>
          {data}
        </pre>
      </div>
    );
  }

  return <div>Cannot display file</div>;
}

/**
 * HELPER FUNCTION
 */

/**
 * This would be useful to determine whether the requested URL need to be `inline` or `attachment` content disposition.
 * HTML and Image by default will need to be inline as the behaviour desired is to open in browser/iframe without download.
 * @param filetype
 * @returns
 */
export function isRequestInlineContentDisposition(filetype: string): boolean {
  return [...IFRAME_FILETYPE_LIST, ...IMAGE_FILETYPE_LIST].includes(filetype);
}
