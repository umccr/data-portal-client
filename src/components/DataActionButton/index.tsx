import React, { useRef, useState } from 'react';
import { Menu } from 'primereact/menu';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

import { useQuery } from 'react-query';
import moment from 'moment';

import { getS3PreSignedUrl, getGDSPreSignedUrl } from '../../utils/api';
import { parseUrlParams } from '../../utils/util';
import { useToastContext } from '../../providers/ToastProvider';
import CircularLoaderWithText from '../../components/CircularLoaderWithText';

type Props = {
  id: number;
  type: 's3' | 'gds';
  pathOrKey: string;
};

function DataActionButton(props: Props) {
  const { pathOrKey } = props;

  const [isPresignedUrlDialog, setIsPresignedUrlDialog] = useState<boolean>(false);

  const menu = useRef<Menu>(null);
  const toast = useToastContext();
  const items = [
    {
      label: 'Copy Path',
      icon: 'pi pi-copy',
      command: () => {
        navigator.clipboard.writeText(pathOrKey);
        toast?.show({
          severity: 'success',
          summary: 'Path Copied',
          life: 3000,
        });
      },
    },
    {
      label: 'Generate Download Link',
      icon: 'pi pi-link',
      command: () => {
        setIsPresignedUrlDialog(true);
      },
    },
  ];

  return (
    <div>
      <Menu style={{ minWidth: '225px' }} model={items} popup ref={menu} id='popup_menu' />
      <div className='cursor-pointer pi pi-bars' onClick={(event) => menu.current?.toggle(event)} />
      {isPresignedUrlDialog ? (
        <PresignedUrlDialog {...props} handleIsOpen={(k: boolean) => setIsPresignedUrlDialog(k)} />
      ) : (
        <></>
      )}
    </div>
  );
}

export default DataActionButton;

/**
 * PresignedUrl Dialog
 */

type rowDataType = {
  key: string;
  value: string;
};
const keyTemplate = (rowData: rowDataType) => {
  return <div className='font-semibold uppercase white-space-nowrap'>{rowData.key}</div>;
};
type PresignedUrlDialogProps = { id: number; type: string; handleIsOpen: (val: boolean) => void };
function PresignedUrlDialog(props: PresignedUrlDialogProps) {
  const { id, type, handleIsOpen } = props;
  const toast = useToastContext();
  const { isLoading, isError, data } = useQuery('fetchDataPresignedUrl', () => {
    if (type == 's3') {
      return getS3PreSignedUrl(id);
    } else {
      return getGDSPreSignedUrl(id);
    }
  });

  let expiresIn = '';
  if (data) {
    const queryParam = parseUrlParams(data);
    expiresIn = queryParam['Expires'];
  }

  return (
    <Dialog
      header='Download Link'
      visible={true}
      style={{ width: '50vw' }}
      draggable={false}
      resizable={false}
      onHide={() => handleIsOpen(false)}>
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
                value: moment.unix(parseInt(expiresIn)).local().format('LLLL'),
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
                toast?.show({
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
