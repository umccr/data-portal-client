import React, { useEffect, useState } from 'react';
import { ColumnProps } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
// Custom component
import DataTableWrapper from '../../../components/DataTableWrapper';
import { useToastContext } from '../../../providers/ToastProvider';
import { showDisplayText } from '../../../utils/util';
import JSONToTable from '../../../components/JSONToTable';
import { usePortalSubjectDataAPI } from '../../../api/subject';
import { TableSkeleton } from '../../../components/skel/TableSkeleton';

const COLUMN_TO_DISPLAY = [
  'library_id',
  'sample_id',
  'external_sample_id',
  'phenotype',
  'type',
  'assay',
  'source',
  'override_cycles',
];

type ObjectStringValType = Record<string, string | number | boolean | null>;
type Props = { subjectId: string };

function SampleInformationTable(props: Props) {
  const { subjectId } = props;
  let subjectLimsList: ObjectStringValType[] = [];
  const { toastShow } = useToastContext();

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

  const { isLoading, isError, data } = usePortalSubjectDataAPI(subjectId);

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

  if (data?.lims && !isLoading) {
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
      <p className='uppercase text-center font-bold text-color white-space-nowrap'>
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
        <p className='uppercase text-center font-bold text-color white-space-nowrap'>
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
        <TableSkeleton />
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
