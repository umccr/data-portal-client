import React, { useState } from 'react';
import API from '@aws-amplify/api';
import { useQuery } from 'react-query';
import { Card } from 'primereact/card';
import { ColumnProps, ColumnSortParams } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { DataTablePFSEvent } from 'primereact/datatable';

// Custom component
import { useToastContext } from '../../../providers/ToastProvider';
import { showDisplayText } from '../../../utils/util';
import JSONToTable from '../../../components/JSONToTable';
import DataTableWrapper, {
  djangoSortingFormat,
  PaginationProps,
  paginationPropsInitValue,
  djangoToTablePaginationFormat,
  convertPaginationEventToDjangoQueryParams,
  convertDjangoStateToDjangoQuery,
} from '../../../components/DataTableWrapper';

import './index.css';

const fetchMetadataList = async (params: { [key: string]: string | number }) => {
  const APIConfig = {
    queryStringParameters: {
      ...params,
    },
  };
  return await API.get('portal', `/metadata/`, APIConfig);
};

type ObjectStringValType = { [key: string]: string | number | null };
function MetadataTable() {
  const toast = useToastContext();
  // Dialog properties
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [moreInformationDialog, setMoreInformationDialog] = useState<ObjectStringValType>({});
  const handleDialogOpen = (rowData: ObjectStringValType) => {
    setMoreInformationDialog(rowData);
    setIsDialogOpen(true);
  };
  const handleDialogClose = () => {
    setMoreInformationDialog({});
    setIsDialogOpen(false);
  };

  // Pagination Properties
  let paginationProps: PaginationProps = paginationPropsInitValue;
  const [apiQueryParameter, setApiQueryParameter] = useState<{ [key: string]: string | number }>({
    rowsPerPage: paginationProps.currentNumberOfRows,
  });
  const handleTablePaginationPropChange = (event: { [key: string]: number }) => {
    const paginationProps = convertPaginationEventToDjangoQueryParams(event);
    setApiQueryParameter((prev) => ({ ...prev, ...paginationProps }));
  };

  // Soriting mechanism
  const [sorting, setSorting] = useState<djangoSortingFormat>({
    sortOrder: -1,
    sortField: 'id',
  });
  const handleTableSortPropChange = (event: DataTablePFSEvent) => {
    setSorting({ sortOrder: event.sortOrder, sortField: event.sortField });
    const paginationProps = convertDjangoStateToDjangoQuery(sorting);
    setApiQueryParameter((prev) => ({ ...prev, ...paginationProps }));
  };

  // Data states
  type ObjKeyType = { [key: string]: string | number };
  let metadataDataList: ObjKeyType[] = [];
  const { isFetching, isLoading, isError, data } = useQuery(
    ['getMetadataList', apiQueryParameter],
    () => fetchMetadataList(apiQueryParameter)
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
    metadataDataList = data.results;
    paginationProps = djangoToTablePaginationFormat(data.pagination);
  }
  /**
   * TABLE COLUMN PROPERTIES
   */
  const textBodyTemplate = (text: string | number | null): React.ReactNode => {
    return <div>{text}</div>;
  };
  const column_to_display: string[] = [
    'subject_id',
    'sample_id',
    'library_id',
    'external_subject_id',
    'external_sample_id',
    'type',
    'phenotype',
    'project_name',
  ];

  const columnList: ColumnProps[] = [];

  // All Information button to show dialog
  columnList.push({
    alignHeader: 'center' as const,
    header: (
      <p className='capitalize text-center font-bold text-color white-space-nowrap'>
        {showDisplayText('info')}
      </p>
    ),
    className: 'text-center justify-content-center',
    body: (rowData: ObjectStringValType) => {
      return (
        <div>
          <Button
            icon='pi pi-info-circle'
            className='p-0 p-button-rounded p-button-secondary p-button-outlined text-center'
            aria-label='info'
            onClick={() => handleDialogOpen(rowData)}
          />
        </div>
      );
    },
  });

  // Creating column properties based on field to display
  for (const column of column_to_display) {
    // Column template
    const newColToShow: ColumnProps = {
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

    columnList.push(newColToShow);
  }

  return (
    <Card className='p-0'>
      <div className='font-bold text-2xl pb-3'>Metadata Table</div>
      <Dialog
        className='max-w-full'
        header={moreInformationDialog.library_id}
        visible={isDialogOpen}
        draggable={false}
        resizable={false}
        onHide={handleDialogClose}>
        <JSONToTable objData={moreInformationDialog} />
      </Dialog>
      <DataTableWrapper
        overrideDataTableProps={{
          style: { display: isLoading ? 'none' : '' },
        }}
        sortField={sorting.sortField}
        sortOrder={sorting.sortOrder}
        onSort={handleTableSortPropChange}
        isLoading={isFetching}
        columns={columnList}
        dataTableValue={metadataDataList}
        paginationProps={paginationProps}
        handlePaginationPropsChange={handleTablePaginationPropChange}
      />
    </Card>
  );
}

export default MetadataTable;
