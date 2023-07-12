import React from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useMutation, useQuery } from 'react-query';

import { getS3Status, S3StatusData } from '../../api/s3';
import { useToastContext } from '../../providers/ToastProvider';
import CircularLoaderWithText from '../../components/CircularLoaderWithText';
import { API } from '@aws-amplify/api';
import { useUserContext } from '../../providers/UserProvider';

/**
 * Check and Restore Object dialog
 */
type RestoreArchiveObjectDialogProps = {
  bucketOrVolume: string;
  pathOrKey: string;
  id: number;
  handleClose: () => void;
};
export default function RestoreArchiveObjectDialog(props: RestoreArchiveObjectDialogProps) {
  const { id, bucketOrVolume, pathOrKey, handleClose } = props;
  const { toastShow } = useToastContext();
  const userInformation = useUserContext().user;
  const uri = `s3://${bucketOrVolume}/${pathOrKey}`;

  const restoreS3Mutate = useMutation({
    mutationFn: async (id: number) => {
      const init = {
        headers: { 'Content-Type': 'application/json' },
        body: {
          email: userInformation.attributes.email,
          days: 7,
          tier: 'Bulk',
        },
      };
      return await API.post('portal', `/s3/${id}/restore`, init);
    },
    mutationKey: [id],
    onError: () => {
      toastShow({
        severity: 'error',
        summary: 'Error on triggering the unarchive API',
        life: 5000,
      });
    },
    onSuccess: (data) => {
      const { error } = data;

      if (error) {
        toastShow({
          severity: 'error',
          summary: 'Error restoring archived objects.',
          detail: error,
          life: 5000,
        });
      } else {
        toastShow({
          severity: 'success',
          summary: 'Successfully submitted restore request! Restoration may take 48 hours.',
          life: 5000,
        });
        handleClose();
      }
    },
  });

  const descriptionText: Record<string, string> = {
    archived:
      'The requested file is in archival storage (Glacier Deep Archive). ' +
      'Please restore the file before accessing. Once restored, it will be valid for 7 days. ' +
      'Retrieval may take up to 48 hours and, will incur cost. ' +
      'Generally, bigger file size cost higher for restore request. ' +
      'If in doubt, please reach out or, do due diligence check at https://aws.amazon.com/s3/pricing/. ' +
      'Request will be logged for audit trail purpose.',
    restoring:
      'The requested file is restoring in progress from archival storage (Glacier Deep Archive). ' +
      'Please try again later. Retrieval may take up to 48 hours.',
    expired:
      `The restored file has expired.` +
      'Please restore it again from archival storage (Glacier Deep Archive). ' +
      'Once restored, it will be valid for 7 days. ' +
      'Retrieval may take up to 48 hours and, will incur cost. ' +
      'Generally, bigger file size cost higher for restore request. ' +
      'If in doubt, please reach out or, do due diligence check at https://aws.amazon.com/s3/pricing/. ' +
      'Request will be logged for audit trail purpose.',
    error: 'Something went wrong. Please try again.',
    available: 'The requested file is in hot storage and ready to be use.',
  };

  const { isError, isLoading, data } = useQuery(
    ['s3-obj-status-check', id],
    async () => await getS3Status(id),
    {}
  );

  const isAllowRestore =
    data == S3StatusData.ARCHIVED || data == S3StatusData.EXPIRED ? true : false;

  return (
    <Dialog
      header='Check and Restore Object'
      visible={true}
      style={{ width: '50vw' }}
      draggable={false}
      resizable={false}
      onHide={() => handleClose()}>
      {isLoading ? (
        <CircularLoaderWithText />
      ) : isError ? (
        <></>
      ) : (
        <>
          <DataTable
            value={[
              {
                key: 'STATUS',
                value: data?.toUpperCase(),
              },
              { key: 'URI', value: uri },
              { key: 'Description', value: descriptionText[data ?? S3StatusData.ERROR] },
            ]}
            responsiveLayout='scroll'>
            <Column headerStyle={{ display: 'none' }} field='key' body={keyTemplate} />
            <Column headerStyle={{ display: 'none' }} field='value' />
          </DataTable>
          <div className='grid py-3'>
            <div className='col-6'>
              <Button
                label='Copy URI'
                icon='pi pi-copy'
                className='p-button-raised p-button-secondary w-12'
                onClick={() => {
                  navigator.clipboard.writeText(uri);
                  toastShow({
                    severity: 'success',
                    summary: 'URI has been copied',
                    life: 3000,
                  });
                }}
              />
            </div>
            <div className='col-6'>
              <Button
                label='Restore'
                disabled={!isAllowRestore}
                icon='pi pi-history'
                className='p-button-raised p-button-danger w-12'
                style={{ width: '50%' }}
                onClick={() => {
                  restoreS3Mutate.mutate(id);
                }}
              />
            </div>
          </div>
        </>
      )}
    </Dialog>
  );
}

/**
 * Templates
 */
type rowDataType = {
  key: string;
  value: string;
};
const keyTemplate = (rowData: rowDataType) => {
  return <div className='font-semibold uppercase white-space-nowrap'>{rowData.key}</div>;
};
