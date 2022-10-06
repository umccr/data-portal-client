import React, { memo, useState } from 'react';
import { useQuery } from 'react-query';
import API from '@aws-amplify/api';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { getStringReadableBytes } from '../../../utils/util';
import { S3Row, GDSRow } from '../../../API/subject';
import moment from 'moment';
import CircularLoaderWithText from '../../../components/CircularLoaderWithText';
import { LoadSubjectDataType } from '.';

const fetchSubjectInformation = async (subjectId: string) => {
  return await API.get('portal', `/subjects/${subjectId}/`, {});
};

type Props = {
  subjectId: string;
  currentIgvTrackData: LoadSubjectDataType;
  handleIgvTrackDataChange(newTrackData: LoadSubjectDataType): void;
};
function LoadSubjectDataButton({
  subjectId,
  currentIgvTrackData,
  handleIgvTrackDataChange,
}: Props) {
  const [isLoadDialogOpen, setIsLoadDialogOpen] = useState<boolean>(false);

  // Current checkbox state and handleChange functions
  const [currentDataSelection, setCurrentDataSelection] =
    useState<LoadSubjectDataType>(currentIgvTrackData);
  const handleS3SelectionChange = (newS3Selection: S3Row[]) => {
    setCurrentDataSelection((prev) => ({ ...prev, s3RowList: newS3Selection }));
  };
  const handleGdsSelectionChange = (newGdsSelection: GDSRow[]) => {
    setCurrentDataSelection((prev) => ({ ...prev, gdsRowList: newGdsSelection }));
  };

  // Fetch existing subject data (will be move out and cache elsewhere)
  const { isLoading, isError, data } = useQuery(['fetchSubjectInformation', subjectId], () =>
    fetchSubjectInformation(subjectId)
  );

  if (isError) {
    // Activate alert
    console.log('temp alert');
  }

  const saveIgvDataSelection = () => {
    handleIgvTrackDataChange(currentDataSelection);
    setIsLoadDialogOpen((prev) => !prev);
  };

  const openDialog = () => {
    setCurrentDataSelection(currentIgvTrackData);
    setIsLoadDialogOpen((prev) => !prev);
  };

  const renderFooter = () => {
    return (
      <div className='pt-4'>
        <Button
          label='Cancel'
          icon='pi pi-times'
          onClick={() => setIsLoadDialogOpen((prev) => !prev)}
          className='p-button-text text-blue-800'
        />
        <Button
          className='bg-blue-800'
          label='Save'
          icon='pi pi-save'
          onClick={() => saveIgvDataSelection()}
          autoFocus
        />
      </div>
    );
  };

  const RenderDialogContent = ({ data }: any) => {
    const tableToDisplay = [
      { title: 'GDS', source: 'gds', data: data.results_gds },
      { title: 'S3', source: 's3', data: data.results },
    ];
    return (
      <>
        {tableToDisplay.map((tableProps) => (
          <div key={tableProps.title}>
            {tableProps.source == 's3' ? (
              <S3SelectTable
                title={tableProps.title}
                currentS3RowData={tableProps.data}
                currentS3Selection={currentDataSelection.s3RowList}
                handleSelectionChange={handleS3SelectionChange}
              />
            ) : (
              <GDSSelectTable
                title={tableProps.title}
                currentGDSRowData={tableProps.data}
                currentGDSSelection={currentDataSelection.gdsRowList}
                handleSelectionChange={handleGdsSelectionChange}
              />
            )}
          </div>
        ))}
      </>
    );
  };

  return (
    <>
      <Dialog
        header={`${subjectId} - Select BAM and/or VCF`}
        visible={isLoadDialogOpen}
        className='w-11'
        draggable={false}
        footer={renderFooter()}
        onHide={() => setIsLoadDialogOpen((prev) => !prev)}>
        {isLoading || !data ? <CircularLoaderWithText /> : <RenderDialogContent data={data} />}
      </Dialog>

      <Button
        onClick={openDialog}
        className='m-1 bg-blue-800 border-blue-800'
        label='OPEN'
        icon='pi pi-folder-open'
      />
    </>
  );
}

export default memo(LoadSubjectDataButton);

/**
 * Helper function
 */

// S3 select table
type S3SelectTableProps = {
  title: string;
  currentS3RowData: S3Row[];
  currentS3Selection: S3Row[];
  handleSelectionChange(slected: S3Row[]): void;
};
const S3SelectTable = ({
  title,
  currentS3RowData,
  currentS3Selection,
  handleSelectionChange,
}: S3SelectTableProps) => {
  const sizeBody = (rowData: S3Row) => {
    return getStringReadableBytes(rowData.size);
  };
  const dateBody = (rowData: S3Row) => {
    return moment(rowData.last_modified_date).local().format();
  };

  return (
    <DataTable
      resizableColumns
      value={currentS3RowData}
      selection={currentS3Selection}
      onSelectionChange={(e) => handleSelectionChange(e.value)}
      header={<div>{title}</div>}>
      <Column selectionMode='multiple' headerStyle={{ width: '3em' }} />
      <Column field='key' header='Key'></Column>
      <Column field='bucket' header='Bucket'></Column>
      <Column field='size' header='Size' body={sizeBody}></Column>
      <Column field='last_modified_date' header='Date Modified' body={dateBody} />
    </DataTable>
  );
};

// GDS select table
type GDSSelectTableProps = {
  title: string;
  currentGDSRowData: GDSRow[];
  currentGDSSelection: GDSRow[];
  handleSelectionChange(slected: GDSRow[]): void;
};
const GDSSelectTable = ({
  title,
  currentGDSRowData,
  currentGDSSelection,
  handleSelectionChange,
}: GDSSelectTableProps) => {
  const sizeBody = (rowData: GDSRow) => {
    return getStringReadableBytes(rowData.size_in_bytes);
  };
  const dateBody = (rowData: GDSRow) => {
    return moment(rowData.time_modified).local().format();
  };

  return (
    <DataTable
      resizableColumns
      value={currentGDSRowData}
      selection={currentGDSSelection}
      onSelectionChange={(e) => handleSelectionChange(e.value)}
      header={<div>{title}</div>}>
      <Column selectionMode='multiple' headerStyle={{ width: '3em' }} />
      <Column field='path' header='Path'></Column>
      <Column field='size_in_bytes' header='Size' body={sizeBody}></Column>
      <Column field='time_modified' header='Date Modified' body={dateBody} />
    </DataTable>
  );
};
