import React, { useState } from 'react';
import API from '@aws-amplify/api';
import { useQuery } from 'react-query';
import { ColumnProps } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
// Custom component
import DataTableWrapper from '../../../components/DataTableWrapper';
import { useToastContext } from '../../../providers/ToastProvider';
import { showDisplayText } from '../../../utils/util';
import JSONToTable from '../../../components/JSONToTable';
import CircularLoaderWithText from '../../../components/CircularLoaderWithText';
import { usePortalSubjectAPI } from '../../../api/subject';

const COLUMN_TO_DISPLAY = [
  'sample_id',
  'external_sample_id',
  'library_id',
  'type',
  'phenotype',
  'assay',
  'override_cycles',
];

type ObjectStringValType = { [key: string]: string | number | null };
type Props = { subjectId: string };

function SampleInformationTable(props: Props) {
  const { subjectId } = props;
  let subjectLimsList: ObjectStringValType[] = [];
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

  const he = usePortalSubjectAPI(subjectId);
  const { isLoading, isError, data } = he;

  if (isError) {
    toast?.show({
      severity: 'error',
      summary: 'Something went wrong!',
      detail: 'Unable to fetch data from Portal API',
      life: 3000,
    });
  }

  if (data && !isLoading) {
    subjectLimsList = data.lims;
  }

  /**
   * TABLE COLUMN PROPERTIES
   */

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
            className='p-0 p-button-rounded p-button-secondary p-button-outlined text-center border-none'
            aria-label='info'
            onClick={() => handleDialogOpen(rowData)}
          />
        </div>
      );
    },
  });
  // Rest of the column
  for (const column of COLUMN_TO_DISPLAY) {
    columnList.push({
      field: column,
      alignHeader: 'center' as const,
      header: (
        <p className='capitalize text-center font-bold text-color white-space-nowrap'>
          {showDisplayText(column)}
        </p>
      ),
      className: 'text-center justify-content-center',
      body: (rowData: ObjectStringValType) => {
        return <div className='text-center text-color'>{rowData[column]}</div>;
      },
    });
  }

  return (
    <>
      <Dialog
        className='max-w-full'
        header={moreInformationDialog.subject_id}
        visible={isDialogOpen}
        draggable={false}
        resizable={false}
        onHide={handleDialogClose}>
        <JSONToTable objData={moreInformationDialog} />
      </Dialog>
      {isLoading ? (
        <CircularLoaderWithText />
      ) : (
        <DataTableWrapper
          isLoading={isLoading}
          columns={columnList}
          dataTableValue={subjectLimsList}
        />
      )}
    </>
  );
}
export default SampleInformationTable;
