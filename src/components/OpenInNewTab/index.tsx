import React from 'react';
import { Dialog } from 'primereact/dialog';

import { usePortalS3PresignAPI } from '../../api/s3';
import { usePortalGDSPresignAPI } from '../../api/gds';
import CircularLoaderWithText from '../../components/CircularLoaderWithText';
import { isRequestInlineContentDisposition } from '../ViewPresignedUrl';
import mime from 'mime';

type Props = {
  id: number;
  type: 's3' | 'gds';
  pathOrKey: string;
  filetype: string;
  handleClose: () => void;
};
export function OpenInNewTab(props: Props) {
  const { id, type, pathOrKey, filetype, handleClose } = props;
  const filename = pathOrKey.split('/').pop() ?? '';

  let portalPresignedUrlRes;
  if (type == 'gds') {
    portalPresignedUrlRes = usePortalGDSPresignAPI(id, {
      headers: {
        'Content-Disposition': isRequestInlineContentDisposition(filetype)
          ? 'inline'
          : 'attachment',
        'Content-Type': mime.getType(filename),
      },
    });
  } else {
    portalPresignedUrlRes = usePortalS3PresignAPI(id);
  }

  if (portalPresignedUrlRes?.data?.signed_url) {
    window.open(portalPresignedUrlRes.data.signed_url, '_blank');
    handleClose();
  }

  return (
    <Dialog
      header='Opening In New Tab'
      visible={true}
      style={{ width: '50vw' }}
      draggable={false}
      resizable={false}
      onHide={() => handleClose()}>
      <CircularLoaderWithText />
    </Dialog>
  );
}
