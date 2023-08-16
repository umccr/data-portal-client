import React from 'react';
import { usePortalMetadataAPI } from '../../../api/metadata';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Button } from 'primereact/button';
import CircularLoaderWithText from '../../../components/CircularLoaderWithText';

const metadataHeaderToDisplay: string[] = [
  'subject_id',
  'sample_id',
  'library_id',
  'external_subject_id',
  'external_sample_id',
  'phenotype',
  'type',
  'assay',
  'source',
  'project_name',
  'project_owner',
];

type Props = { subjectId: string };

function SubjectMetadataTable({ subjectId }: Props) {
  // The function to trigger the workflow
  const { isLoading, isError, data } = usePortalMetadataAPI({
    apiConfig: {
      queryStringParameters: {
        rowsPerPage: 1000,
        subject_id: subjectId,
      },
    },
  });

  return (
    <div>
      <h5>Lab Metadata Table</h5>
      <div className='mb-3'>{`This is an additional metadata table to help you select relevant options.`}</div>
      <div className='w-full'>
        {isLoading ? (
          <CircularLoaderWithText text={`Loading metadata for: ${subjectId}`} />
        ) : isError ? (
          <div className='mt-3 text-center'>
            <Button
              icon='pi pi-times'
              className='p-button-rounded p-button-danger bg-red-500 cursor-auto'
              aria-label='Cancel'
            />
            <div className='mt-3'>{'Unable to load Metadata Table'}</div>
          </div>
        ) : (
          <>
            <DataTable
              className='border-1 border-200'
              size='small'
              showGridlines
              autoLayout
              responsiveLayout='scroll'
              value={data?.results ?? []}
              dataKey='id'>
              {metadataHeaderToDisplay.map((header, idx) => (
                <Column
                  key={idx}
                  field={header}
                  header={header.replaceAll('_', ' ')}
                  headerClassName='uppercase surface-100'
                />
              ))}
            </DataTable>
            <i>* This will only show a maximum of 1000 records</i>
          </>
        )}
      </div>
    </div>
  );
}

export default SubjectMetadataTable;
