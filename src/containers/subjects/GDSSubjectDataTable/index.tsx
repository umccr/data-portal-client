import React, { useState } from 'react';
import { useQuery } from 'react-query';
import API from '@aws-amplify/api';
import { ColumnProps } from 'primereact/column';

import DataActionButton from '../../../components/DataActionButton';
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
import FilePreviewButton from '../../../components/FilePreviewButton';

const fetchGDSSubjectData = async (
  subjectId: string,
  params: { [key: string]: string | number }
) => {
  const APIConfig = {
    queryStringParameters: {
      subject: subjectId,
      ...params,
    },
  };
  return await API.get('portal', `/gds/`, APIConfig);
};

type ObjectStringValType = { id: number } & { [key: string]: string };
type Props = { subjectId: string };

function GDSSubjectDataTable(props: Props) {
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
    ['getGDSSubjectData', apiQueryParameter],
    () => fetchGDSSubjectData(subjectId, apiQueryParameter)
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
    'volume_name',
    'path',
    'preview',
    'action',
    'size_in_bytes',
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

    if (column == 'preview') {
      newColToShow = {
        ...newColToShow,
        header: (
          <p className='w-2 capitalize text-left font-bold text-color white-space-nowrap overflow-visible'>
            {showDisplayText(column)}
          </p>
        ),
        className: 'text-center white-space-nowrap overflow-visible',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        body: (rowData: any): React.ReactNode => {
          const filename = rowData.path.split('/').pop();
          const fileSizeInBytes = rowData.size_in_bytes;
          return (
            <FilePreviewButton
              filename={filename}
              fileSizeInBytes={fileSizeInBytes}
              type='gds'
              id={rowData.id}
              presignedUrl={rowData.presigned_url}
              handleUpdateData={(url: string) => {
                rowData.presigned_url = url;
              }}
            />
          );
        },
      };
    } else if (column == 'action') {
      newColToShow = {
        ...newColToShow,
        body: (rowData: ObjectStringValType): React.ReactNode => {
          return <DataActionButton id={rowData.id} type='gds' pathOrKey={rowData.key} />;
        },
        className: 'text-center white-space-nowrap overflow-visible',
      };
    } else if (column == 'size_in_bytes') {
      newColToShow = {
        ...newColToShow,
        body: (rowData: ObjectStringValType): React.ReactNode => {
          let sizeNumber = 0;
          if (typeof rowData.size_in_bytes == 'string') {
            sizeNumber = parseInt(rowData.size_in_bytes);
          } else {
            sizeNumber = rowData.size_in_bytes === null ? 0 : rowData.size_in_bytes;
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

export default GDSSubjectDataTable;
