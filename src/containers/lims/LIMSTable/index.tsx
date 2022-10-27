import React, { useState } from 'react';
import { ColumnProps } from 'primereact/column';
import { DataTablePFSEvent } from 'primereact/datatable';

// Custom component
import { useToastContext } from '../../../providers/ToastProvider';
import { showDisplayText } from '../../../utils/util';
import DataTableWrapper, {
  PaginationProps,
  paginationPropsInitValue,
  djangoToTablePaginationFormat,
  convertPaginationEventToDjangoQueryParams,
  convertDjangoStateToDjangoQuery,
  InfoDialogColumnProps,
  convertDjangoSortParamToDataTableProp,
} from '../../../components/DataTableWrapper';
import { usePortalLimsAPI } from '../../../api/lims';
import { Link } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';

type Props = { defaultQueryParam?: Record<string, string | number> };
function LIMSTable({ defaultQueryParam }: Props) {
  const { toastShow } = useToastContext();

  // Search Bar
  const [searchQuery, setSearchQuery] = useState<string>('');
  const handleSearchEnter = (event: { key: string }) => {
    if (event.key === 'Enter') {
      setApiQueryParameter((prev) => ({ ...prev, search: searchQuery }));
    }
  };

  // Pagination Properties
  let paginationProps: PaginationProps = paginationPropsInitValue;
  const [apiQueryParameter, setApiQueryParameter] = useState<{ [key: string]: string | number }>({
    rowsPerPage: paginationProps.currentNumberOfRows,
    ordering: '-subject_id',
    ...defaultQueryParam,
  });
  const handleTablePaginationPropChange = (event: { [key: string]: number }) => {
    const paginationProps = convertPaginationEventToDjangoQueryParams(event);
    setApiQueryParameter((prev) => ({ ...prev, ...paginationProps }));
  };

  // Sorting mechanism
  const sorting = convertDjangoSortParamToDataTableProp(apiQueryParameter);
  const handleTableSortPropChange = (event: DataTablePFSEvent) => {
    const djangoSortingQuery = convertDjangoStateToDjangoQuery({
      sortOrder: event.sortOrder,
      sortField: event.sortField,
    });
    setApiQueryParameter((prev) => ({ ...prev, ...djangoSortingQuery }));
  };

  // Data states
  type ObjKeyType = { [key: string]: string | number };
  let limsDataList: ObjKeyType[] = [];
  const { isFetching, isLoading, isError, data } = usePortalLimsAPI({
    queryStringParameters: {
      ...apiQueryParameter,
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
    limsDataList = data.results;
    paginationProps = djangoToTablePaginationFormat(data.pagination);
  }
  /**
   * TABLE COLUMN PROPERTIES
   */
  const textBodyTemplate = (text: string | number | null): React.ReactNode => {
    return <div>{text}</div>;
  };
  const column_to_display: string[] = [
    'illumina_id',
    'type',
    'timestamp',
    'subject_id',
    'sample_id',
    'library_id',
    'external_subject_id',
    'external_sample_id',
    'phenotype',
    'project_name',
  ];

  const columnList: ColumnProps[] = [];

  // All Information button to show dialog
  columnList.push(InfoDialogColumnProps);

  // Creating column properties based on field to display
  for (const column of column_to_display) {
    // Column template
    let newColToShow: ColumnProps = {
      field: column,
      alignHeader: 'left' as const,
      header: (
        <p className='w-2 capitalize text-left font-bold text-color white-space-nowrap'>
          {showDisplayText(column)}
        </p>
      ),
      body: (rowData: any): React.ReactNode => {
        return textBodyTemplate(rowData[column]);
      },
      className: 'text-left white-space-nowrap',
      sortable: true,
    };

    if (column == 'subject_id') {
      newColToShow = {
        ...newColToShow,
        body: (rowData: any): React.ReactNode => {
          return (
            <Link to={`/subjects/${rowData.subject_id}/overview`}>
              {textBodyTemplate(rowData[column])}
            </Link>
          );
        },
      };
    } else if (column == 'illumina_id') {
      newColToShow = {
        ...newColToShow,
        body: (rowData: any): React.ReactNode => {
          return (
            <Link to={`/runs/${rowData.illumina_id}/overview`}>
              {textBodyTemplate(rowData[column])}
            </Link>
          );
        },
      };
    }

    columnList.push(newColToShow);
  }

  return (
    <div>
      <div className='w-full pb-4'>
        <span className='w-full p-input-icon-left'>
          <i className='pi pi-search' />
          <InputText
            className='w-full p-inputtext-sm'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='Search'
            onKeyDown={handleSearchEnter}
          />
        </span>
      </div>
      <DataTableWrapper
        overrideDataTableProps={{
          style: { display: isLoading ? 'none' : '' },
        }}
        sortField={sorting.sortField}
        sortOrder={sorting.sortOrder}
        onSort={handleTableSortPropChange}
        isLoading={isFetching}
        columns={columnList}
        dataTableValue={limsDataList}
        paginationProps={paginationProps}
        handlePaginationPropsChange={handleTablePaginationPropChange}
      />
    </div>
  );
}

export default LIMSTable;
