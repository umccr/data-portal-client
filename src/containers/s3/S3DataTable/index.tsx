import React, { useCallback, useEffect, useState } from 'react';
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
import { S3Row, usePortalS3API } from '../../../api/s3';
import { InputText } from 'primereact/inputtext';
import PresetButton from '../../../components/search/PresetButton';

type Props = {
  defaultQueryParam: { search?: string } & Record<string, string | number>;
  chipData?: Record<string, string | number>[];
};

function S3DataTable({ defaultQueryParam, chipData }: Props) {
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
  const [apiQueryParameter, setApiQueryParameter] = useState<{ [key: string]: string | number }>({
    rowsPerPage: paginationProps.currentNumberOfRows,
    ...defaultQueryParam,
  });
  const handleTablePaginationPropChange = (event: { [key: string]: number }) => {
    const paginationProps = convertPaginationEventToDjangoQueryParams(event);

    setApiQueryParameter((prev) => ({ ...prev, ...paginationProps }));
  };

  // Data states
  let subjectDataList: Record<string, string | number>[] = [];

  const { isFetching, isLoading, isError, data } = usePortalS3API({
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
    subjectDataList = data.results;
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
        dataTableValue={subjectDataList}
        paginationProps={paginationProps}
        handlePaginationPropsChange={handleTablePaginationPropChange}
      />
    </>
  );
}

export default S3DataTable;

/**
 * TABLE COLUMN PROPERTIES
 */
const textBodyTemplate = (text: string | number | boolean | null): React.ReactNode => {
  return <div>{text?.toString()}</div>;
};
const column_to_display = [
  'bucket',
  'key',
  'preview',
  'action',
  'size',
  'last_modified_date',
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

  // Customize column from the template column above
  if (column == 'preview') {
    columnList.push({
      ...defaultProps,
      className: 'text-center white-space-nowrap overflow-visible',
      body: (rowData: S3Row): React.ReactNode => {
        const filename = rowData.key.split('/').pop() ?? rowData.key;
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
    });
  } else if (column == 'action') {
    columnList.push({
      ...defaultProps,
      body: (rowData: S3Row): React.ReactNode => {
        // Side note for not enforcing the IGV presigned mode or disable restore object here (use case for cttsov2)
        // The results from the `/s3` path is not shown here as it is filtered out based on SubjectId
        // The cttsov2 results do not have the `subject_id` linked in the portal.

        return (
          <DataActionButton
            id={rowData.id}
            type='s3'
            pathOrKey={rowData.key}
            bucketOrVolume={rowData.bucket}
          />
        );
      },
      className: 'text-center white-space-nowrap',
    });
  } else if (column == 'size') {
    columnList.push({
      ...defaultProps,
      body: (rowData: S3Row): React.ReactNode => {
        let sizeNumber = 0;
        if (typeof rowData.size == 'string') {
          sizeNumber = parseInt(rowData.size);
        } else {
          sizeNumber = rowData.size === null ? 0 : rowData.size;
        }
        return textBodyTemplate(getStringReadableBytes(sizeNumber));
      },
    });
  } else if (column == 'last_modified_date') {
    columnList.push({
      ...defaultProps,
      body: (rowData: S3Row): React.ReactNode => {
        return textBodyTemplate(moment(rowData.last_modified_date).toString());
      },
    });
  } else {
    columnList.push({
      ...defaultProps,
      body: (rowData: S3Row): React.ReactNode => {
        return textBodyTemplate(rowData[column]);
      },
    });
  }
}
