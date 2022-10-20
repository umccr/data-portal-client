import React, { useState } from 'react';
import { ColumnProps } from 'primereact/column';
import CircularLoaderWithText from '../../../components/CircularLoaderWithText';
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
import DataActionButton from '../../../components/DataActionButton';
import { usePortalS3API } from '../../../api/s3';

type ObjectStringValType = { id: number } & { [key: string]: string };
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

  const { isFetching, isLoading, isError, data } = usePortalS3API({
    queryStringParameters: {
      subject: subjectId,
      ...apiQueryParameter,
    },
  });

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
    'preview',
    'action',
    'size',
    'last_modified_date',
  ];
  const columnList: ColumnProps[] = [];

  // Creating column properties based on field to display
  for (const column of column_to_display) {
    // Column template
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

    // Customize column from the template column above
    if (column == 'preview') {
      newColToShow = {
        ...newColToShow,
        className: 'text-center white-space-nowrap overflow-visible',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        body: (rowData: any): React.ReactNode => {
          const filename = rowData.key.split('/').pop();
          const fileSizeInBytes = rowData.size;
          return (
            <FilePreviewButton
              fileSizeInBytes={fileSizeInBytes}
              filename={filename}
              type='s3'
              id={rowData.id}
            />
          );
        },
      };
    } else if (column == 'action') {
      newColToShow = {
        ...newColToShow,
        body: (rowData: ObjectStringValType): React.ReactNode => {
          return <DataActionButton id={rowData.id} type='s3' pathOrKey={rowData.key} />;
        },
        className: 'text-center white-space-nowrap',
      };
    } else if (column == 'size') {
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
    <>
      <div className={isFetching || isLoading ? '' : 'hidden'}>
        <CircularLoaderWithText text='Please wait, we are fetching data from the portal' />
      </div>
      <div className={isFetching || isLoading ? 'hidden' : ''}>
        <DataTableWrapper
          isLoading={isFetching}
          columns={columnList}
          dataTableValue={subjectDataList}
          paginationProps={paginationProps}
          handlePaginationPropsChange={handleTablePaginationPropChange}
        />
      </div>
    </>
  );
}

export default S3SubjectDataTable;
