import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { useToastContext } from '../../providers/ToastProvider';
import CircularLoaderWithText from '../CircularLoaderWithText';
// Other Dependencies
import JSONPretty from 'react-json-pretty';

import './index.css';
import { SelectButton } from 'primereact/selectbutton';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

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

  // Return HTML (via iframe) display
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
        life: 3000,
      });
    }
  }, [isError]);

  if (isLoading || isFetching || !data) {
    return <CircularLoaderWithText text='Fetching Content' />;
  }

  // Return JSON
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
    const [isTablePreview, setIsTablePreview] = useState<boolean>(true);
    const options = ['Table', 'Raw'];
    return (
      <div className='w-full m-3 text-center' style={{ maxHeight: '80vh' }}>
        <SelectButton
          id='toggle-table-view'
          className='pb-2'
          value={isTablePreview ? 'Table' : 'Raw'}
          onChange={(e) => setIsTablePreview(e.value == 'Table' ? true : false)}
          options={options}
        />

        {isTablePreview ? (
          <DataTable
            showGridlines
            rowHover
            value={allRows.slice(1)}
            tableClassName={allRows.length == 0 ? 'hidden' : ''}>
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
                headerClassName='text-color font-bold surface-200'
                field={`${idx}`}
                body={cellContentTemplate}
                bodyClassName='py-1'
              />
            ))}
          </DataTable>
        ) : (
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
        )}
      </div>
    );
  }

  // Return Raw plain text display
  if (
    [...DELIMITER_SEPARATED_VALUE_FILETYPE_LIST, ...PLAIN_FILETYPE_LIST, 'yaml'].includes(filetype)
  ) {
    return (
      <div className='w-full m-3 text-center' style={{ maxHeight: '80vh' }}>
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

  return <div>Cannot display file</div>;
}
