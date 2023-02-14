import React from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

import { useQuery } from 'react-query';
import moment from 'moment';

import { getS3PreSignedUrl } from '../../api/s3';
import { getGDSPreSignedUrl } from '../../api/gds';
import { parseUrlParams } from '../../utils/util';
import { useToastContext } from '../../providers/ToastProvider';
import CircularLoaderWithText from '../../components/CircularLoaderWithText';

type rowDataType = {
  key: string;
  value: string;
};
const keyTemplate = (rowData: rowDataType) => {
  return <div className='font-semibold uppercase white-space-nowrap'>{rowData.key}</div>;
};
type GeneratePresignedDialogProps = { id: number; type: 's3' | 'gds'; handleClose: () => void };
export default function GeneratePresignedDialog(props: GeneratePresignedDialogProps) {
  const { toastShow } = useToastContext();

  const { id, type, handleClose } = props;
  const { isLoading, isError, data } = useQuery({
    queryKey: ['fetchDataPresignedUrl', id, type],
    keepPreviousData: false,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    queryFn: async () => {
      if (type == 's3') {
        return await getS3PreSignedUrl(id);
      } else {
        return await getGDSPreSignedUrl(id);
      }
    },
  });

  let expiresIn = '';
  if (data) {
    const queryParam = parseUrlParams(data);
    if (type == 's3') {
      expiresIn = moment.unix(parseInt(queryParam['Expires'])).toString();
    } else {
      expiresIn = moment().add(parseInt(queryParam['X-Amz-Expires']), 's').toString();
    }
  }

  return (
    <Dialog
      header='Download Link'
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
                key: 'Expires in',
                value: expiresIn,
              },
              { key: 'URL', value: data },
            ]}
            responsiveLayout='scroll'>
            <Column headerStyle={{ display: 'none' }} field='key' body={keyTemplate} />
            <Column headerStyle={{ display: 'none' }} field='value' />
          </DataTable>
          <div style={{ padding: '1rem 0rem' }}>
            <Button
              label='Copy'
              icon='pi pi-copy'
              className='p-button-raised p-button-secondary'
              style={{ width: '100%' }}
              onClick={() => {
                navigator.clipboard.writeText(data);
                toastShow({
                  severity: 'success',
                  summary: 'Path has been copied',
                  life: 3000,
                });
              }}
            />
          </div>
        </>
      )}
    </Dialog>
  );
}
