import React, { useCallback, useEffect, useState } from 'react';
import { GDSRow, usePortalGDSAPI } from '../../../api/gds';
import DataTableWrapper, {
  convertPaginationEventToDjangoQueryParams,
  djangoToTablePaginationFormat,
  PaginationProps,
  paginationPropsInitValue,
} from '../../../components/DataTableWrapper';
import { useToastContext } from '../../../providers/ToastProvider';
import { ColumnProps } from 'primereact/column';
import { getStringReadableBytes, showDisplayText } from '../../../utils/util';
import moment from 'moment';
import DataActionButton from '../../utils/DataActionButton';
import FilePreviewButton from '../../../components/FilePreviewButton';
import { InputText } from 'primereact/inputtext';
import PresetButton from '../../../components/search/PresetButton';

type Props = {
  defaultQueryParam: { search?: string } & Record<string, string | number>;
  chipData?: Record<string, string | number>[];
};

function GDSDataTable({ defaultQueryParam, chipData }: Props) {
  const { toastShow } = useToastContext();

  // Search
  const defaultSearch: string | undefined = defaultQueryParam['search'];
  const [searchField, setSearchField] = useState<string>(defaultSearch ? defaultSearch : '');
  const [searchInput, setSearchInput] = useState<string>(defaultSearch ? defaultSearch : '');

  const handleSearchEnter = (event: { key: string }) => {
    if (event.key === 'Enter') {
      setSearchField(searchInput);
    }
  };

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
    queryParams: {
      ...apiQueryParameter,
      search: searchField,
    },
  });

  useEffect(() => {
    if (isError) {
      toastShow({
        severity: 'error',
        summary: 'Something went wrong!',
        detail: 'Unable to fetch data from Portal API',
        life: 3000,
      });
    }
  }, [isError]);

  if (data && !isFetching && !isLoading) {
    runDataList = data.results;
    paginationProps = djangoToTablePaginationFormat(data.pagination);
  }

  const handlePresetButtonClicked = useCallback(
    (keyword: string) => {
      setSearchField(keyword);
      setSearchInput(keyword);
    },
    [chipData]
  );

  return (
    <>
      {chipData && <PresetButton chipData={chipData} handleClick={handlePresetButtonClicked} />}
      <div className='w-full pb-1'>
        <span className='lg:w-4 p-input-icon-left'>
          {/*<i className='pi pi-search' />*/}
          <InputText
            className='w-full p-inputtext'
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder='Search'
            onKeyDown={handleSearchEnter}
          />
        </span>
      </div>
      <DataTableWrapper
        isLoading={isFetching}
        columns={columnList}
        dataTableValue={runDataList}
        paginationProps={paginationProps}
        handlePaginationPropsChange={handleTablePaginationPropChange}
      />
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
const column_to_display = [
  'volume_name',
  'path',
  'preview',
  'action',
  'size_in_bytes',
  'time_modified',
] as const;
const columnList: ColumnProps[] = [];

// Creating column properties based on field to display
for (const column of column_to_display) {
  const defaultProps = {
    field: column,
    alignHeader: 'left' as const,
    header: (
      <p className='w-2 uppercase text-left font-bold text-color white-space-nowrap'>
        {showDisplayText(column)}
      </p>
    ),
    className: 'text-left white-space-nowrap',
  };

  if (column == 'preview') {
    columnList.push({
      ...defaultProps,
      header: (
        <p className='w-2 uppercase text-left font-bold text-color white-space-nowrap overflow-visible'>
          {showDisplayText(column)}
        </p>
      ),
      className: 'text-center white-space-nowrap overflow-visible',
      body: (rowData: GDSRow): React.ReactNode => {
        const filename = rowData.path.split('/').pop() ?? rowData.path;
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
    });
  } else if (column == 'action') {
    columnList.push({
      ...defaultProps,
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
    });
  } else if (column == 'size_in_bytes') {
    columnList.push({
      ...defaultProps,
      body: (rowData: GDSRow): React.ReactNode => {
        let sizeNumber = 0;
        if (typeof rowData.size_in_bytes == 'string') {
          sizeNumber = parseInt(rowData.size_in_bytes);
        } else {
          sizeNumber = rowData.size_in_bytes === null ? 0 : rowData.size_in_bytes;
        }
        return textBodyTemplate(getStringReadableBytes(sizeNumber));
      },
    });
  } else if (column == 'time_modified') {
    columnList.push({
      ...defaultProps,
      body: (rowData: GDSRow): React.ReactNode => {
        return textBodyTemplate(moment(rowData.time_modified).toString());
      },
    });
  } else {
    columnList.push({
      ...defaultProps,
      body: (rowData: GDSRow): React.ReactNode => {
        return textBodyTemplate(rowData[column]);
      },
    });
  }
}
