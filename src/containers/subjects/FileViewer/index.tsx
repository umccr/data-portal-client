import React, { useState, useEffect } from 'react';

import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import { Splitter, SplitterPanel } from 'primereact/splitter';
import { ProgressSpinner } from 'primereact/progressspinner';

import './index.css';
import { useToastContext } from '../../../providers/ToastProvider';
import ViewPresignedUrl from '../../../components/ViewPresignedUrl';
import CircularLoaderWithText from '../../../components/CircularLoaderWithText';
import {
  usePortalS3API,
  S3ApiData,
  S3Row,
  usePortalS3PresignAPI,
  PresignApiData,
} from '../../../api/s3';

// CONSTANT
type pipelineOptionType = {
  name: string;
  regexKey: string;
};

const GPL_PIPELINE_OPTIONS: pipelineOptionType[] = [
  { name: 'GPL - all', regexKey: 'gridss_purple_linx/(.*)(.png|.html)$' },
  { name: 'GPL - purple', regexKey: 'gridss_purple_linx/purple/(.*)(.png|.html)$' },
  { name: 'GPL - linx', regexKey: 'gridss_purple_linx/linx/(.*)(.png|.html)$' },
];
const WTS_PIPELINE_OPTIONS: pipelineOptionType[] = [
  { name: 'WTS - all', regexKey: 'WTS/(.*)(.png|.html)$' },
  { name: 'WTS - RNAsum', regexKey: 'WTS/(.*)RNAsum/(.*)(.png|.html)$' },
];
const WGS_PIPELINE_OPTIONS: pipelineOptionType[] = [
  { name: 'WGS - all', regexKey: 'WGS/(.*)(.png|.html)$' },
];

const UMCCRISED_PIPELINE_OPTIONS: pipelineOptionType[] = [
  { name: 'UMCCRISE - all', regexKey: 'umccrised/(.*)(.png|.html)$' },
];
const DEFAULT_PIPELINE_OPTIONS: pipelineOptionType = {
  name: 'All',
  regexKey: '(.*)(.png|.html)$',
};

const PIPELINE_OPTIONS_LIST: pipelineOptionType[] = [
  DEFAULT_PIPELINE_OPTIONS,
  ...GPL_PIPELINE_OPTIONS,
  ...WTS_PIPELINE_OPTIONS,
  ...WGS_PIPELINE_OPTIONS,
  ...UMCCRISED_PIPELINE_OPTIONS,
];

type Props = { subjectId: string };
function FileViewer({ subjectId }: Props) {
  const { toastShow } = useToastContext();

  const [selectedFilter, setSelectedFilter] =
    useState<pipelineOptionType>(DEFAULT_PIPELINE_OPTIONS);

  const [selectedFile, setSelectedFile] = useState<S3Row | null>(null);
  const [fileList, setFileList] = useState<S3Row[]>([]);

  const [apiQueryParameter, setApiQueryParameter] = useState<
    Record<string, string | number | null>
  >({
    subject: subjectId,
    search: selectedFilter.regexKey,
    rowsPerPage: 25,
    ordering: 'key',
  });

  const s3QueryRes = usePortalS3API({
    queryStringParameters: { ...apiQueryParameter },
  });
  const s3Data: S3ApiData = s3QueryRes.data;

  if (s3QueryRes.isError) {
    toastShow({
      severity: 'error',
      summary: 'Something went wrong!',
      detail: 'Unable to fetch data from Portal API',
      life: 3000,
    });
  }

  useEffect(() => {
    let componentUnmount = false;
    if (s3Data) {
      const dataResults = s3Data.results;
      setFileList((prev) => [...prev, ...dataResults]);
      if (dataResults.length > 0 && !selectedFile) {
        setSelectedFile(dataResults[0]);
      }
    }
    if (componentUnmount) return;
    return () => {
      componentUnmount = true;
    };
  }, [s3Data]);

  const fetchPresignedRes = usePortalS3PresignAPI(selectedFile?.id);
  const fetchPresignedData: PresignApiData | undefined = fetchPresignedRes.data;

  const paginateNext = () => {
    const nextLink = s3Data.links.next;
    if (nextLink) {
      const searchParamsObj = new URLSearchParams(nextLink);
      setApiQueryParameter(Object.fromEntries(searchParamsObj));
    }
  };

  return (
    <Card
      style={{ height: '100%' }}
      title={`${subjectId} - Analysis Results: ${selectedFilter.name}`}>
      <div id='input'>
        <div className='mb-2'>Pipeline Report</div>
        <Dropdown
          className='w-full'
          value={selectedFilter}
          options={PIPELINE_OPTIONS_LIST}
          onChange={(e) => setSelectedFilter(e.value)}
          optionLabel='name'
        />
      </div>
      <div id='body-display' className='mt-5 h-full'>
        {fileList.length == 0 && s3QueryRes.isLoading ? (
          <CircularLoaderWithText />
        ) : fileList.length == 0 ? (
          <div className='flex align-items-center justify-content-center'>No Data</div>
        ) : (
          <Splitter style={{ height: 'calc(100vh - 21rem)' }}>
            <SplitterPanel className='flex align-items-start justify-content-start overflow-x-auto overflow-y-auto'>
              <div className='flex flex-column w-full'>
                <div className='bg-blue-50 font-bold text-2xl p-3'>Filename</div>
                {fileList.map((item, index) => {
                  const filename = item.key.split('/').pop();
                  const isSelected = selectedFile && selectedFile.id === item.id;
                  let additionalClass = '';
                  if (isSelected) additionalClass = `surface-200`;
                  return (
                    <div
                      key={index}
                      className={`hover:surface-100 p-2 cursor-pointer white-space-nowrap ${additionalClass}`}
                      onClick={() => {
                        setSelectedFile(item);
                      }}>
                      {filename}
                    </div>
                  );
                })}

                {fileList.length > 0 && s3QueryRes.isLoading ? (
                  <div
                    style={{ height: '3rem' }}
                    className='surface-100 flex align-items-center justify-content-center'>
                    <ProgressSpinner style={{ width: '2rem', height: '2rem' }} />
                  </div>
                ) : s3Data?.links.next ? (
                  <div
                    onClick={paginateNext}
                    className='surface-100 cursor-pointer flex align-items-center justify-content-center p-2 cursor-pointer'>
                    Load More
                  </div>
                ) : (
                  <></>
                )}
                <div></div>
              </div>
            </SplitterPanel>
            <SplitterPanel className='flex align-items-center justify-content-center'>
              {fetchPresignedRes.isLoading ? (
                <CircularLoaderWithText />
              ) : fetchPresignedData?.signed_url ? (
                <div className='flex align-items-center justify-content-center relative h-full w-full'>
                  <ViewPresignedUrl presingedUrl={fetchPresignedData?.signed_url} />
                </div>
              ) : fetchPresignedData?.signed_url && selectedFile && selectedFile.size > 60000000 ? (
                <div
                  className='flex align-items-center justify-content-center relative h-full w-full cursor-pointer'
                  onClick={() => window.open(fetchPresignedData?.signed_url, '_blank')}>
                  <div>FileSize exceed 60MB. Click here to open in a new tab.</div>
                </div>
              ) : (
                <></>
              )}
            </SplitterPanel>
          </Splitter>
        )}
      </div>
    </Card>
  );
}

export default FileViewer;
