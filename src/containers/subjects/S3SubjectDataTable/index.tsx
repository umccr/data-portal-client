import React, { useState } from 'react';
import { useQuery } from 'react-query';
import API from '@aws-amplify/api';
import { ColumnProps } from 'primereact/column';
import moment from 'moment';

// Custom component
import { useToastContext } from '../../../providers/ToastProvider';
import DataTableWrapper, {
  PaginationProps,
  paginationPropsInitValue,
  djangoToTablePaginationFormat,
  convertPaginationEventToDjangoQueryParams,
} from '../../../components/DataTableWrapper';
import { getStringReadableBytes, showDisplayText } from '../../../utils/util';

const fetchS3SubjectData = async (
  subjectId: string,
  params: { [key: string]: string | number }
) => {
  const APIConfig = {
    queryStringParameters: {
      subject: subjectId,
      ...params,
    },
  };
  return await API.get('portal', `/s3/`, APIConfig);
};

type ObjectStringValType = { [key: string]: string | number | null };
type Props = { subjectId: string };

function S3SubjectDataTable(props: Props) {
  const toast = useToastContext();
  const { subjectId } = props;

  // Pagination Properties
  let paginationProps: PaginationProps = paginationPropsInitValue;
  const [apiQueryParameter, setApiQueryParameter] = useState<{ [key: string]: string | number }>({
    rowsPerPage: paginationProps.currentNumberOfRows,
  });
  const handleTablePaginationPropChange = (event: { [key: string]: number }) => {
    const paginationProps = convertPaginationEventToDjangoQueryParams(event);

    const mergedObj = {
      ...apiQueryParameter,
      ...paginationProps,
    };
    setApiQueryParameter(mergedObj);
  };

  // Data states
  type ObjKeyType = { [key: string]: string | number };
  let subjectDataList: ObjKeyType[] = [];

  const { isFetching, isLoading, isError, data } = useQuery(
    ['getS3SubjectData', apiQueryParameter],
    () => fetchS3SubjectData(subjectId, apiQueryParameter)
  );

  if (isError) {
    toast?.show({
      severity: 'error',
      summary: 'Something went wrong!',
      detail: 'Unable to fetch data from Portal API',
      life: 3000,
    });
  }

  if (data && !isFetching && !isLoading) {
    subjectDataList = data.results;
    paginationProps = djangoToTablePaginationFormat(data.pagination);
  }

  /**
   * TABLE COLUMN PROPERTIES
   */
  const textBodyTemplate = (text: string | number | null): React.ReactNode => {
    return <div>{text}</div>;
  };
  const column_to_display: string[] = [
    'bucket',
    'key',
    // 'preview', TODO
    // 'action', TODO
    'size',
    'last_modified_date',
  ];
  const columnList: ColumnProps[] = [];

  // Creating column properties based on field to display
  for (const column of column_to_display) {
    let newColToShow = {
      field: column,
      alignHeader: 'left' as const,
      header: (
        <p className='w-2 capitalize text-left font-bold text-color white-space-nowrap'>
          {showDisplayText(column)}
        </p>
      ),
      body: (rowData: ObjectStringValType): React.ReactNode => {
        return textBodyTemplate(rowData[column]);
      },
      className: 'text-left white-space-nowrap',
    };

    // Some custom column to be added here
    // TODO: below
    // if (column == 'preview') {
    //   newColToShow = {
    //     ...newColToShow,
    //     header: (
    //       <p className='w-2 capitalize text-left font-bold text-color white-space-nowrap'>
    //         {showDisplayText('column')}
    //       </p>
    //     ),
    //     body: (rowData: ObjectStringValType): React.ReactNode => {
    //       return textBodyTemplate('rowData[column]');
    //     },
    //   };
    // } else if (column == 'action') {
    //   newColToShow = {
    //     field: column,
    //     alignHeader: 'left' as const,
    //     header: (
    //       <p className='w-2 capitalize text-left font-bold text-color white-space-nowrap'>
    //         {showDisplayText('column')}
    //       </p>
    //     ),
    //     body: (rowData: ObjectStringValType): React.ReactNode => {
    //       return textBodyTemplate('rowData[column]');
    //     },
    //     className: 'text-left white-space-nowrap',
    //   };
    // } else
    if (column == 'size') {
      newColToShow = {
        ...newColToShow,
        body: (rowData: ObjectStringValType): React.ReactNode => {
          let sizeNumber = 0;
          if (typeof rowData.size == 'string') {
            sizeNumber = parseInt(rowData.size);
          } else {
            sizeNumber = rowData.size === null ? 0 : rowData.size;
          }
          return textBodyTemplate(getStringReadableBytes(sizeNumber));
        },
      };
    } else if (column == 'last_modified_date') {
      newColToShow = {
        ...newColToShow,
        body: (rowData: ObjectStringValType): React.ReactNode => {
          return textBodyTemplate(moment(rowData.last_modified_date).local().format('LLL'));
        },
      };
    }

    columnList.push(newColToShow);
  }

  return (
    <DataTableWrapper
      isLoading={isFetching}
      columns={columnList}
      dataTableValue={subjectDataList}
      paginationProps={paginationProps}
      handlePaginationPropsChange={handleTablePaginationPropChange}
    />
  );
}

export default S3SubjectDataTable;
