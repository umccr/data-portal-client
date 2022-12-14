import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Menu } from 'primereact/menu';
import { MenuItem } from 'primereact/menuitem';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

import { useQuery } from 'react-query';
import moment from 'moment';

import { getS3PreSignedUrl, getS3Status, S3StatusData } from '../../api/s3';
import { constructGDSUrl, getGDSPreSignedUrl } from '../../api/gds';
import { parseUrlParams } from '../../utils/util';
import { useToastContext } from '../../providers/ToastProvider';
import CircularLoaderWithText from '../../components/CircularLoaderWithText';
import API from '@aws-amplify/api';

type DataActionButtonProps = {
  id: number;
  type: 's3' | 'gds';
  pathOrKey: string;
  bucketOrVolume: string;
};

function DataActionButton(props: DataActionButtonProps) {
  const { pathOrKey } = props;

  const [isPresignedUrlDialog, setIsPresignedUrlDialog] = useState<boolean>(false);
  const handleIsPresignedUrlDialogChange = useCallback(
    (b: boolean) => setIsPresignedUrlDialog(b),
    []
  );

  const [isIGVDesktopOpen, setIsIGVDesktopOpen] = useState<boolean>(false);
  const handleIsIGVDesktopOpen = useCallback((b: boolean) => setIsIGVDesktopOpen(b), []);

  const menu = useRef<Menu>(null);
  const { toastShow } = useToastContext();
  const items: MenuItem[] = [
    {
      label: 'Copy Key/Path',
      icon: 'pi pi-copy',
      command: () => {
        navigator.clipboard.writeText(pathOrKey);
        toastShow({
          severity: 'success',
          summary: 'Key/Path Copied',
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

  if (pathOrKey.endsWith('bam') || pathOrKey.endsWith('vcf') || pathOrKey.endsWith('vcf.gz')) {
    items.push({
      label: 'Open IGV Desktop',
      icon: <img src={'/igv.png'} alt='igv.png' width='14px' height='14px' className='mr-2' />,
      command: () => {
        handleIsIGVDesktopOpen(true);
      },
    });
  }

  return (
    <div>
      <Menu style={{ minWidth: '225px' }} model={items} popup ref={menu} id='popup_menu' />
      <div className='cursor-pointer pi pi-bars' onClick={(event) => menu.current?.toggle(event)} />
      {isPresignedUrlDialog ? (
        <PresignedUrlDialog {...props} handleIsOpen={handleIsPresignedUrlDialogChange} />
      ) : isIGVDesktopOpen ? (
        <OpenIGVDesktop
          {...props}
          isOpen={isIGVDesktopOpen}
          handleIsOpen={handleIsIGVDesktopOpen}
        />
      ) : (
        <></>
      )}
    </div>
  );
}

export default DataActionButton;

/**
 * Open in IGV Desktop
 */
const constructGDSLocalIgvUrl = async (props: { bucketOrVolume: string; pathOrKey: string }) => {
  const { bucketOrVolume, pathOrKey } = props;

  let idxFilePath: string;
  if (pathOrKey.endsWith('bam')) {
    idxFilePath = pathOrKey + '.bai';
  } else if (pathOrKey.endsWith('vcf') || pathOrKey.endsWith('vcf.gz')) {
    idxFilePath = pathOrKey + '.tbi';
  } else if (pathOrKey.endsWith('cram')) {
    idxFilePath = pathOrKey + '.crai';
  } else {
    console.log('No index file for this file');
    return;
  }

  let filePresignUrl = '';
  let idxFilePresignUrl = '';

  // GDS
  const fileGdsUrl = constructGDSUrl({ volume_name: bucketOrVolume, path: pathOrKey });
  const idxFileGdsUrl = constructGDSUrl({ volume_name: bucketOrVolume, path: idxFilePath });
  const { signed_urls } = await API.post('portal', `/presign`, {
    body: [fileGdsUrl, idxFileGdsUrl],
  });

  // Find which presign is which
  for (const signed_url of signed_urls) {
    const { volume, path, presigned_url } = signed_url;
    const gdsUrl = constructGDSUrl({ volume_name: volume, path: path });
    if (gdsUrl === fileGdsUrl) {
      filePresignUrl = presigned_url;
    } else if (gdsUrl === idxFileGdsUrl) {
      idxFilePresignUrl = presigned_url;
    }
  }

  const idx = encodeURIComponent(idxFilePresignUrl);
  const enf = encodeURIComponent(filePresignUrl);
  const name = pathOrKey.split('/').pop() ?? pathOrKey;
  return `http://localhost:60151/load?index=${idx}&file=${enf}&name=${name}`;
};

const constructS3LocalIgvUrl = async (props: {
  id: number;
  bucketOrVolume: string;
  pathOrKey: string;
}) => {
  const { id, bucketOrVolume, pathOrKey } = props;

  const objStatus = await getS3Status(id);
  if (objStatus != S3StatusData.AVAILABLE) {
    throw new Error(`Invalid object storage class! (${S3StatusData[objStatus]})`);
  }

  const name = pathOrKey.split('/').pop() ?? pathOrKey;
  const file = `s3://${bucketOrVolume + '/' + pathOrKey}`;

  return `http://localhost:60151/load?file=${encodeURIComponent(file)}&name=${name}`;
};

type OpenIGVDesktopType = DataActionButtonProps & {
  isOpen: boolean;
  handleIsOpen: (val: boolean) => void;
};
function OpenIGVDesktop(props: OpenIGVDesktopType) {
  const { toastShow } = useToastContext();

  const { id, bucketOrVolume, pathOrKey, type, isOpen, handleIsOpen } = props;

  const gdsLocalIgvUrl = useQuery(
    ['gds-local-igv', bucketOrVolume, pathOrKey],
    async () =>
      await constructGDSLocalIgvUrl({ bucketOrVolume: bucketOrVolume, pathOrKey: pathOrKey }),
    { enabled: type == 'gds' && isOpen, retry: false }
  );

  const s3LocalIgvUrl = useQuery(
    ['s3-local-igv', bucketOrVolume, pathOrKey],
    async () =>
      await constructS3LocalIgvUrl({
        id: id,
        bucketOrVolume: bucketOrVolume,
        pathOrKey: pathOrKey,
      }),
    { enabled: type == 's3' && isOpen, retry: false }
  );

  useEffect(() => {
    if (s3LocalIgvUrl.isError && s3LocalIgvUrl.error) {
      toastShow({
        severity: 'error',
        summary: 'Error on locating object URL.',
        detail: `${s3LocalIgvUrl.error}`,
        sticky: true,
      });
      handleIsOpen(false);
    }
    if (gdsLocalIgvUrl.isError && gdsLocalIgvUrl.error) {
      toastShow({
        severity: 'error',
        summary: 'Error on locating object URL.',
        detail: `${gdsLocalIgvUrl.error}`,
        life: 10000,
      });

      handleIsOpen(false);
    }
  }, [s3LocalIgvUrl.isError, s3LocalIgvUrl.error, gdsLocalIgvUrl.isError, gdsLocalIgvUrl.error]);

  useEffect(() => {
    let localIgvUrl: string;
    if (type == 'gds' && gdsLocalIgvUrl.data) {
      localIgvUrl = gdsLocalIgvUrl.data;
    } else if (type == 's3' && s3LocalIgvUrl.data) {
      localIgvUrl = s3LocalIgvUrl.data;
    } else {
      localIgvUrl = '';
    }
    if (localIgvUrl && localIgvUrl != '') {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', localIgvUrl, true);
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && xhr.status === 0) {
          const CopyLocalIGVLink = (
            <div className='flex flex-column'>
              <div>
                {`Please make sure you have opened IGV app and try again. Otherwise, click "Copy" button
            and open the URL in browser new tab.`}
              </div>
              <div className='mt-2'>
                <Button
                  label='Copy'
                  icon='pi pi-copy'
                  className='p-button-raised p-button-secondary bg-orange-600 border-orange-700'
                  style={{ width: '100%' }}
                  onClick={() => {
                    navigator.clipboard.writeText(localIgvUrl);
                    toastShow({
                      severity: 'success',
                      summary: 'URL has been copied',
                      life: 3000,
                    });
                  }}
                />
              </div>
            </div>
          );
          toastShow({
            severity: 'warn',
            summary: 'Unable to open IGV automatically',
            detail: CopyLocalIGVLink,
            sticky: true,
          });
          handleIsOpen(false);
        }
      };
      xhr.send();
    }
  }, [gdsLocalIgvUrl.data, s3LocalIgvUrl.data]);

  return (
    <Dialog
      header='Opening in IGV Desktop'
      visible={isOpen}
      style={{ width: '50vw' }}
      draggable={false}
      resizable={false}
      onHide={() => handleIsOpen(false)}>
      <CircularLoaderWithText />
    </Dialog>
  );
}

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
  const { toastShow } = useToastContext();

  const { id, type, handleIsOpen } = props;
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
