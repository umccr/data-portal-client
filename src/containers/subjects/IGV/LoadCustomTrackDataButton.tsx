import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { RequiredS3RowType } from './utils';

type Props = {
  handleAddCustomLoadTrack(newTrackData: RequiredS3RowType): void;
};

function LoadCustomTrackDataButton({ handleAddCustomLoadTrack }: Props) {
  const [isAddCustomTrackDialogOpen, setIsAddCustomTrackDialogOpen] = useState<boolean>(false);

  const [inputState, setInputState] = useState<RequiredS3RowType>({
    bucket: 'production',
    key: '',
  });

  const addNewTrackData = () => {
    handleAddCustomLoadTrack(inputState);
    setIsAddCustomTrackDialogOpen((prev) => !prev);
  };

  const renderFooter = () => {
    return (
      <div className='pt-4'>
        <Button
          label='Cancel'
          icon='pi pi-times'
          onClick={() => setIsAddCustomTrackDialogOpen((prev) => !prev)}
          className='p-button-text text-blue-800'
        />
        <Button
          className='bg-blue-800'
          label='ADD'
          icon='pi pi-plus'
          onClick={() => addNewTrackData()}
          autoFocus
        />
      </div>
    );
  };
  return (
    <>
      <Dialog
        header={`Add Custom Track`}
        visible={isAddCustomTrackDialogOpen}
        className='w-11'
        draggable={false}
        footer={renderFooter()}
        onHide={() => setIsAddCustomTrackDialogOpen((prev) => !prev)}>
        <>
          <div className='mb-4 text-500 '>
            To add a custom track, please enter S3 Key. Typically you get it by Copy S3 Path button
            when browsing through Subject data.
          </div>
          <div className='my-3'>
            <label htmlFor='username1' className='block mb-1'>
              S3 Bucket Name
            </label>
            <Dropdown
              disabled={true}
              value={inputState.bucket}
              options={[{ label: 'production', value: 'production' }]}
              onChange={(e) => setInputState((prev) => ({ ...prev, bucket: e.value }))}
              placeholder='Bucket Name'
            />
          </div>
          <div className='my-3'>
            <label htmlFor='username1' className='block mb-1'>
              S3 Path
            </label>
            <InputText
              className='w-full block focus:border-blue-800'
              style={{ boxShadow: 'var(--blue-800)' }}
              value={inputState.key}
              onChange={(e) => setInputState((prev) => ({ ...prev, key: e.target.value }))}
            />
          </div>
        </>
      </Dialog>

      <Button
        onClick={() => setIsAddCustomTrackDialogOpen((prev) => !prev)}
        className='m-1 bg-blue-800 border-blue-800'
        label='CUSTOM'
        icon='pi pi-plus'
      />
    </>
  );
}

export default LoadCustomTrackDataButton;
