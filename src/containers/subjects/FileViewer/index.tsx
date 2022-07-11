import React, { useState, useEffect } from 'react';

import { useQuery } from 'react-query';
import API from '@aws-amplify/api';
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import { Splitter, SplitterPanel } from 'primereact/splitter';
import { ProgressSpinner } from 'primereact/progressspinner';

import './index.css';
import { useToastContext } from '../../../providers/ToastProvider';
import ViewPresignedUrl from '../../../components/ViewPresignedUrl';
import CircularLoaderWithText from '../../../components/CircularLoaderWithText';

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

// API Functions
const fetchFileListInit = async (subjectId: string, regexKey: string) => {
  const APIConfig = {
    queryStringParameters: {
      subject: subjectId,
      search: regexKey,
      rowsPerPage: 25,
      ordering: 'key',
    },
  };
  return await API.get('portal', `/s3/`, APIConfig);
};

const fetchS3FileFromURL = async (url: string) => {
  const queryString = url.split('?').pop();
  return await API.get('portal', `/s3?${queryString}`, {});
};

async function getPreSignedUrl(id: number) {
  const { error, signed_url } = await API.get('portal', `/s3/${id}/presign`, {});
  if (error) {
    throw Error('Unable to fetch get presigned url.');
  }
  return signed_url;
}

// Types

interface FileMetadata extends Record<string, string | number> {
  id: number;
  key: string;
  presignedUrl: string;
}

type Props = { subjectId: string };
function FileViewer({ subjectId }: Props) {
  const toast = useToastContext();

  const [selectedFilter, setSelectedFilter] =
    useState<pipelineOptionType>(DEFAULT_PIPELINE_OPTIONS);

  // Current selected File
  const [selectedFile, setSelectedFile] = useState<any>(null);

  // Fetching URL
  const [isFetchingPresignedUrl, setIsFetchingPresignedUrl] = useState<boolean>(true);

  // Isloading for fetching list
  const [isFetchingFileListLoading, setIsFetchingFileListLoading] = useState<boolean>(true);
  const [fileList, setFileList] = useState<FileMetadata[]>([]);
  const [nextQueryURLString, setNextQueryURLString] = useState<string | null>(null);
  const [isPaginationLoading, setIsPaginationLoading] = useState<boolean>(false);

  // API CALLS
  useEffect(() => {
    let componentUnmount = false;
    const fetchInitData = async () => {
      setIsFetchingFileListLoading(true);
      // Build API-config
      let apiResponse;
      try {
        apiResponse = await fetchFileListInit(subjectId, selectedFilter.regexKey);
      } catch (er) {
        toast?.show({
          severity: 'error',
          summary: 'Something went wrong!',
          detail: 'Unable to fetch data from Portal API',
          life: 3000,
        });
        apiResponse = {
          results: [],
          apiResponse: '',
        };
      }
      if (componentUnmount) return;

      setFileList(apiResponse['results']);
      setNextQueryURLString(apiResponse['links']['next']);
      if (apiResponse['results'].length > 0) setSelectedFile(apiResponse['results'][0]);
      setIsFetchingFileListLoading(false);
    };

    fetchInitData();
    return () => {
      componentUnmount = true;
    };
  }, [selectedFilter]);

  const paginateNext = async () => {
    if (nextQueryURLString) {
      setIsPaginationLoading(true);
      try {
        const apiResponse = await fetchS3FileFromURL(nextQueryURLString);
        const mergedList = [...fileList, ...apiResponse['results']];
        setFileList(mergedList);
        setNextQueryURLString(apiResponse['links']['next']);
      } catch (er) {
        toast?.show({
          severity: 'error',
          summary: 'Something went wrong!',
          detail: 'Unable paginate more data from Portal API',
          life: 3000,
        });
      }

      setIsPaginationLoading(false);
    }
  };

  useEffect(() => {
    let componentUnmount = false;
    setIsFetchingPresignedUrl(true);

    const fetchPresignedUrl = async (id: number) => {
      try {
        let newSelectedFile;
        const signed_url: string = await getPreSignedUrl(id);

        if (componentUnmount) return;
        const newState = [...fileList];

        for (const item of newState) {
          if (item.id === id) {
            item['presingedUrl'] = signed_url;
            newSelectedFile = item;
          }
        }
        setFileList(newState);
        if (newSelectedFile) setSelectedFile(newSelectedFile);
        setIsFetchingPresignedUrl(false);
      } catch (e) {
        if (componentUnmount) return;
        toast?.show({
          severity: 'error',
          summary: 'Something went wrong!',
          detail: 'Unable to fetch presign URL',
          life: 3000,
        });
        return;
      }
    };
    if (selectedFile && !selectedFile.presingedUrl) {
      fetchPresignedUrl(selectedFile.id);
    }
    return () => {
      componentUnmount = true;
    };
  }, [selectedFile]);

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
        {isFetchingFileListLoading ? (
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

                {isPaginationLoading ? (
                  <div
                    style={{ height: '3rem' }}
                    className='surface-100 flex align-items-center justify-content-center'>
                    <ProgressSpinner style={{ width: '2rem', height: '2rem' }} />
                  </div>
                ) : nextQueryURLString ? (
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
              {isFetchingPresignedUrl ? (
                <CircularLoaderWithText />
              ) : selectedFile.presingedUrl ? (
                <div className='flex align-items-center justify-content-cente relative h-full w-full'>
                  <ViewPresignedUrl presingedUrl={selectedFile.presingedUrl} />
                </div>
              ) : selectedFile.size > 60000000 ? (
                <div
                  className='flex align-items-center justify-content-cente relative h-full w-full cursor-pointer'
                  onClick={() => window.open(selectedFile.presigned_url, '_blank')}>
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
