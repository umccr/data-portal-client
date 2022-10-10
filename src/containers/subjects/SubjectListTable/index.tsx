import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { useNavigate, Link } from 'react-router-dom';
import API from '@aws-amplify/api';
import { useQuery } from 'react-query';

import DataTableWrapper, {
  PaginationProps,
  paginationPropsInitValue,
  djangoToTablePaginationFormat,
  convertPaginationEventToDjangoQueryParams,
} from '../../../components/DataTableWrapper';
import { useToastContext } from '../../../providers/ToastProvider';
import './index.css';

const fetchS3SubjectList = async (params: { [key: string]: string | number }) => {
  const APIConfig = {
    queryStringParameters: {
      ...params,
    },
  };
  return await API.get('portal', '/subjects/', APIConfig);
};

function SubjectListTable() {
  const toast = useToastContext();
  const navigate = useNavigate();

  // Pagination Properties
  let paginationProps: PaginationProps = paginationPropsInitValue;
  const handleTablePaginationPropChange = (event: { [key: string]: number }) => {
    const paginationProps = convertPaginationEventToDjangoQueryParams(event);

    const mergedObj = {
      ...apiQueryParameter,
      ...paginationProps,
    };
    setApiQueryParameter(mergedObj);
  };

  // API properties
  type subjectObjectList = { subject: string };
  let subjectList: subjectObjectList[] = [];
  const [apiQueryParameter, setApiQueryParameter] = useState<{ [key: string]: string | number }>({
    rowsPerPage: paginationProps.currentNumberOfRows,
  });

  const { isFetching, isLoading, isError, data } = useQuery(
    ['getSubjectList', apiQueryParameter],
    () => fetchS3SubjectList(apiQueryParameter)
  );

  if (data && !isFetching && !isLoading) {
    subjectList = convertListOfSubjectToSubjectObject(data.results);
    paginationProps = djangoToTablePaginationFormat(data.pagination);
  }

  if (isError) {
    toast?.show({
      severity: 'error',
      summary: 'Something went wrong!',
      detail: 'Unable to fetch data from Portal API',
      life: 3000,
    });
  }

  // Column Templates
  const SubjectTemplate = (rowData: subjectObjectList) => {
    return (
      <Link to={`${rowData.subject}/overview`} className='w-2 text-center text-color'>
        {rowData.subject}
      </Link>
    );
  };
  const IGVColumnTemplate = (rowData: subjectObjectList) => {
    return (
      <Button
        className='p-button-rounded p-button-secondary p-button-text p-button-icon'
        aria-label='IGV'
        onClick={() => navigate(`${rowData.subject}/igv`)}>
        <i className='pi igv-icon p-2' />
      </Button>
    );
  };

  const FileViewerColumnTemplate = (rowData: subjectObjectList) => {
    return (
      <Button
        icon='pi pi-file '
        className='p-button-rounded p-button-secondary p-button-text'
        aria-label='File'
        onClick={() => navigate(`${rowData.subject}/file-viewer`)}
      />
    );
  };

  const LaunchPadColumnTemplate = (rowData: subjectObjectList) => {
    return (
      <Button
        icon='pi pi-chevron-circle-right'
        className='p-button-rounded p-button-secondary p-button-text'
        aria-label='Bookmark'
        onClick={() => navigate(`${rowData.subject}/launch-pad`)}
      />
    );
  };

  // Column Component Properties
  const columnsList = [
    {
      field: 'subject',
      header: <p className='w-2 font-bold text-color mr-3'>Subject</p>,
      body: SubjectTemplate,
    },
    {
      field: 'subject',
      alignHeader: 'center' as const,
      header: <p className='w-2 text-center font-bold text-color'>IGV</p>,
      body: IGVColumnTemplate,
      className: 'text-center justify-content-center',
    },
    {
      field: 'subject',
      alignHeader: 'center' as const,
      header: (
        <p className='w-2 text-center font-bold text-color white-space-nowrap'>File Viewer</p>
      ),
      body: FileViewerColumnTemplate,
      className: 'text-center justify-content-center',
    },
    {
      field: 'subject',
      alignHeader: 'center' as const,
      header: <p className='w-2 text-center font-bold text-color white-space-nowrap'>Launch Pad</p>,
      body: LaunchPadColumnTemplate,
      className: 'text-center justify-content-center',
    },
  ];

  return (
    <DataTableWrapper
      isLoading={isLoading || isFetching}
      columns={columnsList}
      dataTableValue={subjectList}
      paginationProps={paginationProps}
      handlePaginationPropsChange={handleTablePaginationPropChange}
    />
  );
}

export default SubjectListTable;

/**
 * Helper Function
 */
function convertListOfSubjectToSubjectObject(subjectList: string[]): { subject: string }[] {
  const objectSubjectList: { subject: string }[] = [];

  for (const element of subjectList) {
    objectSubjectList.push({ subject: element });
  }
  return objectSubjectList;
}
