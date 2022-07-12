import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import CircularLoaderWithText from '../CircularLoaderWithText';
import ViewPresignedUrl, { DATA_TYPE_SUPPORTED } from '../ViewPresignedUrl';
import { getGDSPreSignedUrl, getS3PreSignedUrl } from '../../utils/api';

type FilePreviewButtonProps = {
  filename: string;
  type: 's3' | 'gds';
  id: number;
  presignedUrl?: string;
  handleUpdateData?: (presignedUrl: string) => void;
};

export default function FilePreviewButton(props: FilePreviewButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const filetype = props.filename.split('.').pop();

  return (
    <>
      {isDialogOpen ? (
        <FilePreviewDialog {...props} handleDialogClose={() => setIsDialogOpen(false)} />
      ) : (
        <></>
      )}

      {filetype && DATA_TYPE_SUPPORTED.includes(filetype) ? (
        <div className='cursor-pointer pi pi-eye' onClick={() => setIsDialogOpen(true)} />
      ) : (
        <div className='pi pi-eye-slash text-400' />
      )}
    </>
  );
}

type FilePreviewDialogProps = FilePreviewButtonProps & {
  handleDialogClose: () => void;
};
function FilePreviewDialog(props: FilePreviewDialogProps) {
  const { filename, id, type, presignedUrl, handleUpdateData, handleDialogClose } = props;

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [localPresignedUrl, setLocalPresignedUrl] = useState<string | undefined>(presignedUrl);
  useEffect(() => {
    let componentUnmount = false;
    const fetchPresignedUrl = async () => {
      setIsLoading(true);
      let presignedUrl;
      try {
        if (type == 'gds') {
          presignedUrl = await getGDSPreSignedUrl(id);
        } else {
          presignedUrl = await getS3PreSignedUrl(id);
        }
      } catch (error) {
        setIsError(true);
      }

      if (componentUnmount) return;
      if (handleUpdateData) handleUpdateData(presignedUrl);
      setLocalPresignedUrl(presignedUrl);
      setIsLoading(false);
    };

    if (!presignedUrl) fetchPresignedUrl();
    return () => {
      componentUnmount = true;
    };
  }, []);

  return (
    <Dialog
      resizable={false}
      draggable={false}
      header={filename}
      style={{ width: '75vw' }}
      visible={true}
      onHide={handleDialogClose}
      contentStyle={{ minHeight: '5rem', maxHeight: '75vh' }}
      contentClassName='relative p-0 surface-400 flex align-items-center justify-content-center'>
      {localPresignedUrl ? (
        <div style={{ height: '75vh' }}>
          <ViewPresignedUrl presingedUrl={localPresignedUrl} />
        </div>
      ) : isLoading ? (
        <CircularLoaderWithText />
      ) : isError ? (
        <div className='pi pi-exclamation-triangle text-xl' />
      ) : (
        <div className='pi pi-exclamation-triangle text-xl' />
      )}
    </Dialog>
  );
}
