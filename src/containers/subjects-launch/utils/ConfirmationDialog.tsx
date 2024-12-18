import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import React, { useState } from 'react';
import StyledJsonPretty from '../../../components/StyledJsonPretty';

type Props = {
  header: string;
  onConfirm: (p: any) => void;
  payload: any;
  descriptionElement: React.ReactNode;
};

function ConfirmationDialog({ header, payload, onConfirm, descriptionElement }: Props) {
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState<boolean>(false);

  return (
    <div className='w-full mt-5 text-center'>
      <Dialog
        style={{ width: '75vw' }}
        visible={isConfirmDialogOpen}
        onHide={() => setIsConfirmDialogOpen(false)}
        draggable={false}
        footer={
          <span>
            <Button
              label='Cancel'
              className='p-button-secondary'
              onClick={() => setIsConfirmDialogOpen(false)}
            />
            <Button
              label='Launch'
              disabled
              className='p-button-raised p-button-primary'
              onClick={() => {
                onConfirm(payload);
                setIsConfirmDialogOpen(false);
              }}
            />
          </span>
        }
        header={header}
        headerClassName='border-bottom-1'
        contentClassName='w-full'>
        <>
          {descriptionElement}
          <StyledJsonPretty
            wrapperClassName='border-solid border-round-md p-3 mt-3'
            data={payload}
          />
        </>
      </Dialog>
      <Button
        className='p-button-info p-button-raised bg-primary w-24rem'
        disabled={!payload || Object.values(payload).includes('')}
        onClick={() => setIsConfirmDialogOpen(true)}
        label='Next'
        iconPos='right'
        icon='pi pi-chevron-right'
      />
    </div>
  );
}

export default ConfirmationDialog;
