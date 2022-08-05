import React from 'react';
import { DataTable, DataTableProps } from 'primereact/datatable';
import { Column, ColumnProps } from 'primereact/column';
import './index.css';

/**
 * Table Component
 */
export type PaginationProps = {
  firstIndexNumberAppearOnCurrentTable: number;
  currentNumberOfRows: number;
  totalNumberOfItems: number;
};

type DataTableWrapperProps = {
  columns: ColumnProps[];
  isLoading: boolean;
  dataTableValue: unknown[];
  overrideDataTableProps?: DataTableProps;
  paginationProps?: PaginationProps;
  handlePaginationPropsChange?: (event: { [key: string]: number }) => void;
};

function DataTableWrapper(props: DataTableWrapperProps) {
  const {
    columns,
    dataTableValue,
    isLoading,
    overrideDataTableProps,
    paginationProps,
    handlePaginationPropsChange,
  } = props;

  const additionalDataTableProps = { ...overrideDataTableProps };
  // Pagination could be undefined (if not needed or dont't want it)
  // This will guard if pagination props exist and could be mounter to the UI
  if (paginationProps && handlePaginationPropsChange) {
    const { firstIndexNumberAppearOnCurrentTable, currentNumberOfRows, totalNumberOfItems } =
      paginationProps;
    additionalDataTableProps['lazy'] = true;
    additionalDataTableProps['paginator'] = true;
    additionalDataTableProps['first'] = firstIndexNumberAppearOnCurrentTable;
    additionalDataTableProps['rows'] = currentNumberOfRows;
    additionalDataTableProps['totalRecords'] = totalNumberOfItems;
    additionalDataTableProps['rowsPerPageOptions'] = [10, 25, 50, 100];
    additionalDataTableProps['onPage'] = handlePaginationPropsChange;
    additionalDataTableProps['paginatorTemplate'] =
      'CurrentPageReport RowsPerPageDropdown FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink';
    additionalDataTableProps['currentPageReportTemplate'] =
      'Showing {first} to {last} of {totalRecords} entries';
  }
  return (
    <DataTable
      value={dataTableValue}
      loading={isLoading}
      rowHover
      size='small'
      responsiveLayout='scroll'
      className='ui-datatable-hor-scroll'
      emptyMessage='No Data found!'
      resizableColumns
      columnResizeMode='fit'
      {...additionalDataTableProps}>
      {columns.map((columpProperties, i) => {
        return <Column key={i} {...columpProperties} />;
      })}
    </DataTable>
  );
}

export default DataTableWrapper;

/***********************************
 * Helper function / constant
 ***********************************/

/**
 * Export init constant for easy access
 */
export const paginationPropsInitValue: PaginationProps = {
  firstIndexNumberAppearOnCurrentTable: 0,
  currentNumberOfRows: 10,
  totalNumberOfItems: 0, // Must set to 0, or will cause unwanted pagination clicks
};

/****************************************************
 * Django Helper function
 ****************************************************/

/**
 * Django to Data Table Pagination Props Conversion
 */
type djangoPaginationFormat = {
  count: number;
  page: number;
  rowsPerPage: number;
};
export function djangoToTablePaginationFormat(prop: djangoPaginationFormat): PaginationProps {
  const { count, page, rowsPerPage } = prop;

  // Calculate the current first Index at the current table page
  const currentFirstIndex = (page - 1) * rowsPerPage;

  return {
    firstIndexNumberAppearOnCurrentTable: currentFirstIndex,
    currentNumberOfRows: rowsPerPage,
    totalNumberOfItems: count,
  };
}
/**
 * Create Django Query param based on Table pagination Event
 */

export const convertPaginationEventToDjangoQueryParams = (event: { [key: string]: number }) => {
  const newNumberOfRows = event.rows;
  const newNumberOfFirstIndex = event.first;
  const newCurrentPageNumber = Math.ceil(newNumberOfFirstIndex / newNumberOfRows) + 1;

  return {
    rowsPerPage: newNumberOfRows,
    page: newCurrentPageNumber,
  };
};
