import React, { useCallback, useEffect, useState } from 'react';
import { ColumnProps } from 'primereact/column';
import { DataTableStateEvent } from 'primereact/datatable';

// Custom component
import { useToastContext } from '../../../providers/ToastProvider';
import { showDisplayText } from '../../../utils/util';
import DataTableWrapper, {
  convertDjangoSortParamToDataTableProp,
  convertDjangoStateToDjangoQuery,
  convertPaginationEventToDjangoQueryParams,
  djangoToTablePaginationFormat,
  InfoDialogColumnProps,
  PaginationProps,
  paginationPropsInitValue,
} from '../../../components/DataTableWrapper';
import { usePortalLimsAPI } from '../../../api/lims';
import { Link } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import SideBar from '../../../layouts/SideBar';
import LimsSideBar from '../LimsSideBar';
import { Card } from 'primereact/card';

type Props = {
  defaultQueryParam?: Record<string, string[] | number[]>;
  sideBar?: boolean;
};

function LIMSTable({ defaultQueryParam, sideBar = false }: Props) {
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
  const [apiQueryParameter, setApiQueryParameter] = useState<Record<string, any>>({
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
  const handleTableSortPropChange = (event: DataTableStateEvent) => {
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
    limsDataList = data.results;
    paginationProps = djangoToTablePaginationFormat(data.pagination);
  }
  /**
   * TABLE COLUMN PROPERTIES
   */
  const textBodyTemplate = (text: string | number | null): React.ReactNode => {
    return <>{text}</>;
  };
  const column_to_display: string[] = [
    'illumina_id',
    'timestamp',
    'subject_id',
    'library_id',
    'sample_id',
    'external_sample_id',
    'external_subject_id',
    'phenotype',
    'type',
    'assay',
    'source',
    'workflow',
    'project_owner',
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
        <p className='w-2 uppercase text-left font-bold text-color white-space-nowrap'>
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
            <Link to={`/subjects/${rowData.subject_id}`}>{textBodyTemplate(rowData[column])}</Link>
          );
        },
      };
    } else if (column == 'illumina_id') {
      newColToShow = {
        ...newColToShow,
        body: (rowData: any): React.ReactNode => {
          return (
            <Link to={`/runs/${rowData.illumina_id}`}>{textBodyTemplate(rowData[column])}</Link>
          );
        },
      };
    }

    columnList.push(newColToShow);
  }

  const handleFilterApplied = useCallback(
    (filteredQueryParam: Record<string, string[] | number[]>) => {
      setApiQueryParameter((prev) => ({
        ...prev,
        ...filteredQueryParam,
      }));
    },
    []
  );

  const renderWithSideBarLayout = () => {
    return (
      <SideBar
        sideBarElement={<LimsSideBar handleApply={handleFilterApplied} />}
        mainPageElement={renderTableOnly()}
      />
    );
  };

  const renderTableOnly = () => {
    return (
      <Card>
        <div className='w-full pb-4'>
          <span className='w-full p-input-icon-left'>
            <i className='pi pi-search' />
            <InputText
              className='w-full p-inputtext'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Search'
              onKeyDown={handleSearchEnter}
            />
          </span>
        </div>
        <DataTableWrapper
          sortField={sorting.sortField}
          sortOrder={sorting.sortOrder}
          onSort={handleTableSortPropChange}
          isLoading={isFetching}
          columns={columnList}
          dataTableValue={limsDataList}
          paginationProps={paginationProps}
          handlePaginationPropsChange={handleTablePaginationPropChange}
        />
      </Card>
    );
  };

  return <>{sideBar ? renderWithSideBarLayout() : renderTableOnly()}</>;
}

export default LIMSTable;
