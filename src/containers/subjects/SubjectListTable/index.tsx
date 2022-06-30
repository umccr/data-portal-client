import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { useNavigate, Link } from 'react-router-dom';
import API from '@aws-amplify/api';

import DataTableWrapper, {
  PaginationProps,
  paginationPropsInitValue,
  djangoToTablePaginationFormat,
} from '../../../components/DataTableWrapper';
import { useToastContext } from '../../../providers/ToastProvider';
import './index.css';

function SubjectListTable() {
  const toast = useToastContext();
  const navigate = useNavigate();

  // Pagination Properties
  const [paginationProps, setPaginationProps] = useState<PaginationProps>(paginationPropsInitValue);

  // API properties
  const [apiQueryParameter, setApiQueryParameter] = useState<{ [key: string]: string | number }>({
    rowsPerPage: paginationProps.currentNumberOfRows,
  });
  const handleTablePaginationPropChange = (event: { [key: string]: number }) => {
    const newNumberOfRows = event.rows;
    const newNumberOfFirstIndex = event.first;
    const newCurrentPageNumber = Math.ceil(newNumberOfFirstIndex / newNumberOfRows) + 1;

    const mergedObj = {
      ...apiQueryParameter,
      rowsPerPage: newNumberOfRows,
      page: newCurrentPageNumber,
    };
    setApiQueryParameter(mergedObj);
  };

  // API Calling
  type subjectObjectList = { subject: string };
  const [subjectList, setSubjectList] = useState<subjectObjectList[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    let isComponentUnmount = false;
    setIsLoading(true);
    const fetchData = async () => {
      setIsLoading(true);

      const APIConfig = {
        queryStringParameters: {
          ...apiQueryParameter,
        },
      };
      try {
        const subjectApiResponse = await API.get('portal', '/subjects/', APIConfig);

        if (isComponentUnmount) return;

        setPaginationProps(djangoToTablePaginationFormat(subjectApiResponse.pagination));
        setSubjectList(convertListOfSubjectToSubjectObject(subjectApiResponse.results));
      } catch (err) {
        toast?.show({
          severity: 'error',
          summary: 'Something went wrong!',
          detail: 'Unable to fetch data from Portal API',
          life: 3000,
        });
      }
      setIsLoading(false);
    };
    fetchData();

    return () => {
      isComponentUnmount = true;
    };
  }, [apiQueryParameter]);

  // Column Templates
  const SubjectTemplate = (rowData: subjectObjectList) => {
    return (
      <Link to={`${rowData.subject}`} className='w-2 text-center text-color'>
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
        onClick={() => navigate(`${rowData.subject}/files`)}
      />
    );
  };

  const LaunchPadColumnTemplate = (rowData: subjectObjectList) => {
    return (
      <Button
        icon='pi pi-chevron-circle-right'
        className='p-button-rounded p-button-secondary p-button-text'
        aria-label='Bookmark'
        onClick={() => navigate(`${rowData.subject}/launch`)}
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
      isLoading={isLoading}
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
