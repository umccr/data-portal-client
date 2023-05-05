import React from 'react';
import { Dialog } from 'primereact/dialog';
import { useQuery } from 'react-query';

import { getS3PreSignedUrl } from '../../api/s3';
import { getGDSPreSignedUrl } from '../../api/gds';
import { useToastContext } from '../../providers/ToastProvider';
import CircularLoaderWithText from '../../components/CircularLoaderWithText';

type Props = { id: number; type: 's3' | 'gds'; handleClose: () => void };
export function OpenInNewTab(props: Props) {
  const { toastShow } = useToastContext();
  const { id, type, handleClose } = props;

  const { error } = useQuery({
    queryKey: ['fetchDataPresignedUrl', id, type],
    keepPreviousData: false,
    refetchOnMount: true,
    queryFn: async () => {
      if (type == 's3') {
        return await getS3PreSignedUrl(id);
      } else {
        return await getGDSPreSignedUrl(id);
      }
    },
    onSuccess: (url: string) => {
      window.open(url, '_blank');
      handleClose();
    },
  });

  if (error) {
    toastShow({
      severity: 'error',
      summary: 'Error restoring archived objects.',
      life: 3000,
    });
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
