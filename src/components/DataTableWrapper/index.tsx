import React, { useState } from 'react';
import {
  DataTable,
  DataTableProps,
  DataTablePFSEvent,
  DataTableSortOrderType,
} from 'primereact/datatable';
import { Column, ColumnProps } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';

import JSONToTable from '../JSONToTable';
import { showDisplayText } from '../../utils/util';
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
  sortField?: string;
  sortOrder?: DataTableSortOrderType;
  onSort?: (event: DataTablePFSEvent) => void;
};

function DataTableWrapper(props: DataTableWrapperProps) {
  const {
    columns,
    dataTableValue,
    isLoading,
    overrideDataTableProps,
    paginationProps,
    handlePaginationPropsChange,
    sortField,
    sortOrder,
    onSort,
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

  // Table sorting mechanism if defined on the table wrap
  if (sortField && sortOrder && onSort) {
    additionalDataTableProps['sortField'] = sortField;
    additionalDataTableProps['sortOrder'] = sortOrder;
    additionalDataTableProps['onSort'] = onSort;
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
 * Dialog Info Component in a DataTable Column Props Component
 ***********************************/

export const InfoDialogColumnProps: ColumnProps = {
  alignHeader: 'center' as const,
  header: (
    <p className='capitalize text-center font-bold text-color white-space-nowrap'>
      {showDisplayText('info')}
    </p>
  ),
  className: 'text-center justify-content-center',
  body: (rowData: any) => {
    // Dialog properties
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
    const [moreInformationDialog, setMoreInformationDialog] = useState<any>({});
    const handleDialogOpen = (rowData: any) => {
      setMoreInformationDialog(rowData);
      setIsDialogOpen(true);
    };
    const handleDialogClose = () => {
      setMoreInformationDialog({});
      setIsDialogOpen(false);
    };
    return (
      <div>
        <Dialog
          className='max-w-full'
          header={moreInformationDialog.library_id}
          visible={isDialogOpen}
          draggable={false}
          resizable={false}
          onHide={handleDialogClose}>
          <JSONToTable objData={moreInformationDialog} />
        </Dialog>
        <Button
          icon='pi pi-info-circle'
          className='p-0 p-button-rounded p-button-secondary p-button-outlined text-center'
          aria-label='info'
          onClick={() => handleDialogOpen(rowData)}
        />
      </div>
    );
  },
};

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

/**
 * Django to Data Table Sorting Props
 */
export type djangoSortingFormat = {
  sortOrder: DataTableSortOrderType;
  sortField: string;
};
export function convertDjangoStateToDjangoQuery(state: djangoSortingFormat) {
  const ordering = state.sortOrder == -1 ? '-' : '';
  return {
    ordering: `${ordering}${state.sortField}`,
  };
}
type queryParamDjango = { ordering?: string } & Record<string, string | number>;
export function convertDjangoSortParamToDataTableProp(
  queryParam: queryParamDjango
): Record<string, any> {
  const ordering = queryParam.ordering ?? '-id';
  const sortOrder = ordering.startsWith('-') ? -1 : 1;
  const sortField = ordering.split('-').pop();

  return {
    sortOrder: sortOrder,
    sortField: sortField,
  };
}
