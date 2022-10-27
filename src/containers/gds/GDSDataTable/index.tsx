import React, { useState } from 'react';
import { GDSRow, usePortalGDSAPI } from '../../../api/gds';
import CircularLoaderWithText from '../../../components/CircularLoaderWithText';
import DataTableWrapper, {
  PaginationProps,
  paginationPropsInitValue,
  djangoToTablePaginationFormat,
  convertPaginationEventToDjangoQueryParams,
} from '../../../components/DataTableWrapper';
import { useToastContext } from '../../../providers/ToastProvider';
import { ColumnProps } from 'primereact/column';
import { getStringReadableBytes, showDisplayText } from '../../../utils/util';
import moment from 'moment';
import DataActionButton from '../../../components/DataActionButton';
import FilePreviewButton from '../../../components/FilePreviewButton';
import DataSearchFilterButton from '../../../components/DataSearchFilterButton';

type Props = { defaultQueryParam: { search?: string } & Record<string, string | number> };
function GDSDataTable({ defaultQueryParam }: Props) {
  const { toastShow } = useToastContext();

  // Search
  const defaultSearch: string | undefined = defaultQueryParam['search'];
  const [searchField, setSearchField] = useState<string>(defaultSearch ? defaultSearch : '');

  // Pagination Properties
  let paginationProps: PaginationProps = paginationPropsInitValue;
  const [apiQueryParameter, setApiQueryParameter] = useState<Record<string, string | number>>({
    rowsPerPage: paginationProps.currentNumberOfRows,
    ...defaultQueryParam,
  });
  const handleTablePaginationPropChange = (event: Record<string, number>) => {
    const paginationProps = convertPaginationEventToDjangoQueryParams(event);

    setApiQueryParameter((prev) => ({ ...prev, ...paginationProps }));
  };

  // Data states
  let runDataList: Record<string, string | number>[] = [];

  const { isFetching, isLoading, isError, data } = usePortalGDSAPI({
    queryStringParameters: {
      ...apiQueryParameter,
      search: searchField,
    },
  });

  if (isError) {
    toastShow({
      severity: 'error',
      summary: 'Something went wrong!',
      detail: 'Unable to fetch data from Portal API',
      life: 3000,
    });
  }

  if (data && !isFetching && !isLoading) {
    runDataList = data.results;
    paginationProps = djangoToTablePaginationFormat(data.pagination);
  }
  return (
    <>
      <div className={isFetching || isLoading ? '' : 'hidden'}>
        <CircularLoaderWithText text='Please wait, we are fetching data from the portal' />
      </div>
      <div className={isFetching || isLoading ? 'hidden' : ''}>
        <DataSearchFilterButton
          currentFilter={searchField}
          handleFilterChange={(s: string) => setSearchField(s)}
        />
        <DataTableWrapper
          isLoading={isFetching}
          columns={columnList}
          dataTableValue={runDataList}
          paginationProps={paginationProps}
          handlePaginationPropsChange={handleTablePaginationPropChange}
        />
      </div>
    </>
  );
}

export default GDSDataTable;

/**
 * TABLE COLUMN PROPERTIES
 */
const textBodyTemplate = (text: string | number | boolean | null): React.ReactNode => {
  return <div>{text?.toString()}</div>;
};
const column_to_display: string[] = [
  'volume_name',
  'path',
  'preview',
  'action',
  'size_in_bytes',
  'time_modified',
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
    body: (rowData: GDSRow): React.ReactNode => {
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
          />
        );
      },
    };
  } else if (column == 'action') {
    newColToShow = {
      ...newColToShow,
      body: (rowData: GDSRow): React.ReactNode => {
        return (
          <DataActionButton
            id={rowData.id}
            type='gds'
            pathOrKey={rowData.path}
            bucketOrVolume={rowData.volume_name}
          />
        );
      },
      className: 'text-center white-space-nowrap overflow-visible',
    };
  } else if (column == 'size_in_bytes') {
    newColToShow = {
      ...newColToShow,
      body: (rowData: GDSRow): React.ReactNode => {
        let sizeNumber = 0;
        if (typeof rowData.size_in_bytes == 'string') {
          sizeNumber = parseInt(rowData.size_in_bytes);
        } else {
          sizeNumber = rowData.size_in_bytes === null ? 0 : rowData.size_in_bytes;
        }
        return textBodyTemplate(getStringReadableBytes(sizeNumber));
      },
    };
  } else if (column == 'time_modified') {
    newColToShow = {
      ...newColToShow,
      body: (rowData: GDSRow): React.ReactNode => {
        return textBodyTemplate(moment(rowData.time_modified).local().format('LLL'));
      },
    };
  }

  columnList.push(newColToShow);
}
