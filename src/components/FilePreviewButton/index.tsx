import React, { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import CircularLoaderWithText from '../CircularLoaderWithText';
import ViewPresignedUrl, {
  DATA_TYPE_SUPPORTED,
  HTML_FILETYPE_LIST,
  IMAGE_FILETYPE_LIST,
} from '../ViewPresignedUrl';
import { usePortalGDSPresignAPI } from '../../api/gds';
import { usePortalS3PresignAPI } from '../../api/s3';

type FilePreviewButtonProps = {
  filename: string;
  type: 's3' | 'gds';
  id: number;
  fileSizeInBytes: number;
};

export default function FilePreviewButton(props: FilePreviewButtonProps) {
  const { type, fileSizeInBytes } = props;

  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const filetype = props.filename.split('.').pop();

  if (!filetype) {
    return <div className='pi pi-eye-slash text-400' />;
  }

  // Unable to fetch from s3 due to cors-origin policy
  const isCorsOriginBlock =
    type == 's3' &&
    !IMAGE_FILETYPE_LIST.includes(filetype) &&
    !HTML_FILETYPE_LIST.includes(filetype);

  const isFileSizeAcceptable = fileSizeInBytes > 60000000;
  const isDataTypeSupported = !DATA_TYPE_SUPPORTED.includes(filetype);

  if (isCorsOriginBlock) {
    return (
      <div>
        <div className='pi pi-eye-slash text-400' />
      </div>
    );
  }
  if (isFileSizeAcceptable) {
    return (
      <div>
        <div className='pi pi-eye-slash text-400' />
      </div>
    );
  }

  if (isDataTypeSupported) {
    return (
      <div>
        <div className='pi pi-eye-slash text-400' />
      </div>
    );
  }

  return (
    <>
      {isDialogOpen ? (
        <FilePreviewDialog {...props} handleDialogClose={() => setIsDialogOpen(false)} />
      ) : (
        <></>
      )}

      <div className='cursor-pointer pi pi-eye' onClick={() => setIsDialogOpen(true)} />
    </>
  );
}

type FilePreviewDialogProps = FilePreviewButtonProps & {
  handleDialogClose: () => void;
};
function FilePreviewDialog(props: FilePreviewDialogProps) {
  const { filename, id, type, handleDialogClose } = props;

  let portalPresignedUrlRes;
  if (type == 'gds') {
    portalPresignedUrlRes = usePortalGDSPresignAPI(id, {
      headers: { 'Content-Disposition': 'inline' },
    });
  } else {
    portalPresignedUrlRes = usePortalS3PresignAPI(id);
  }

  return (
    <Dialog
      resizable={false}
      draggable={false}
      header={filename}
      style={{ width: '75vw', boxSizing: 'border-box', border: 'solid var(--surface-600) 1px' }}
      visible={true}
      onHide={handleDialogClose}
      contentStyle={{ minHeight: '5rem', maxHeight: '75vh' }}
      contentClassName='relative p-0 surface-400 flex align-items-center justify-content-center'>
      {portalPresignedUrlRes.data ? (
        <div className='w-full p-3' style={{ height: '75vh' }}>
          <ViewPresignedUrl presingedUrl={portalPresignedUrlRes.data.signed_url} />
        </div>
      ) : portalPresignedUrlRes.isLoading ? (
        <CircularLoaderWithText text='Generating presigned URL.' />
      ) : portalPresignedUrlRes.isError ? (
        <div className='pi pi-exclamation-triangle text-xl' />
      ) : (
        <div className='pi pi-exclamation-triangle text-xl' />
      )}
    </Dialog>
  );
}
