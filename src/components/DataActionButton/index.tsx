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
import { isIgvReadableFile } from '../../containers/subjects/IGV/LoadSubjectDataButton';
import { constructGDSUrl, getGDSPreSignedUrl } from '../../api/gds';
import { parseUrlParams } from '../../utils/util';
import { useToastContext } from '../../providers/ToastProvider';
import CircularLoaderWithText from '../../components/CircularLoaderWithText';
import { API } from '@aws-amplify/api';
import { useUserContext } from '../../providers/UserProvider';

enum DataAction {
  NONE,
  COPY_URI,
  GENERATE_PRESIGN,
  RESTORE_OBJECT,
  OPEN_IGV_DESKTOP,
}

type DataActionButtonProps = {
  id: number;
  type: 's3' | 'gds';
  pathOrKey: string;
  bucketOrVolume: string;
};

function DataActionButton(props: DataActionButtonProps) {
  const { toastShow } = useToastContext();
  const { bucketOrVolume, pathOrKey, type } = props;

  const [actionSelected, setActionSelected] = useState<DataAction>(DataAction.NONE);
  const handleCloseActionSelected = useCallback(
    (newSelection?: DataAction) => setActionSelected(newSelection ?? DataAction.NONE),
    []
  );

  const menu = useRef<Menu>(null);
  const items: MenuItem[] = [
    {
      label: 'Copy URI',
      icon: 'pi pi-copy',
      command: () => {
        let uri = '';
        if (type == 's3') {
          uri = `s3://${bucketOrVolume}/${pathOrKey}`;
        } else if (type == 'gds') {
          uri = constructGDSUrl({ volume_name: bucketOrVolume, path: pathOrKey });
        }
        navigator.clipboard.writeText(uri);
        toastShow({
          severity: 'success',
          summary: 'Key/Path Copied',
          life: 3000,
        });
      },
    },
  ];

  if (!pathOrKey.endsWith('.bam')) {
    items.push({
      label: 'Generate Download Link',
      icon: 'pi pi-link',
      command: () => {
        setActionSelected(DataAction.GENERATE_PRESIGN);
      },
    });
  }

  if (pathOrKey.endsWith('.bam') && type == 's3') {
    items.push({
      label: 'Check and Restore Object',
      icon: 'pi pi-history',
      command: () => {
        setActionSelected(DataAction.RESTORE_OBJECT);
      },
    });
  }

  if (isIgvReadableFile(pathOrKey)) {
    items.push({
      label: 'Open IGV Desktop',
      icon: <img src={'/igv.png'} alt='igv.png' width='14px' height='14px' className='mr-2' />,
      command: () => {
        setActionSelected(DataAction.OPEN_IGV_DESKTOP);
      },
    });
  }

  return (
    <div>
      <Menu style={{ minWidth: '225px' }} model={items} popup ref={menu} id='popup_menu' />
      <div className='cursor-pointer pi pi-bars' onClick={(event) => menu.current?.toggle(event)} />
      {actionSelected == DataAction.GENERATE_PRESIGN ? (
        <PresignedUrlDialog {...props} handleClose={handleCloseActionSelected} />
      ) : actionSelected == DataAction.OPEN_IGV_DESKTOP ? (
        <OpenIGVDesktop {...props} handleClose={handleCloseActionSelected} />
      ) : actionSelected == DataAction.RESTORE_OBJECT ? (
        <RestoreArchiveObjectDialog {...props} handleClose={handleCloseActionSelected} />
      ) : (
        <></>
      )}
    </div>
  );
}

export default DataActionButton;

/**
 * Check and Restore Object dialog
 */
type RestoreArchiveObjectDialogProps = DataActionButtonProps & {
  id: number;
  handleClose: () => void;
};
function RestoreArchiveObjectDialog(props: RestoreArchiveObjectDialogProps) {
  const { id, bucketOrVolume, pathOrKey, handleClose } = props;
  const { toastShow } = useToastContext();
  const userInformation = useUserContext().user;
  const uri = `s3://${bucketOrVolume}/${pathOrKey}`;

  // Handle restore request
  const handleRestoreClicked = async (id: number) => {
    const init = {
      headers: { 'Content-Type': 'application/json' },
      body: {
        email: userInformation.attributes.email,
        days: 7,
        tier: 'Bulk',
      },
    };
    const data = await API.post('files', `/s3/${id}/restore`, init);
    const { error } = data;

    if (error) {
      toastShow({
        severity: 'error',
        summary: 'Error restoring archived objects.',
        detail: error,
        life: 3000,
      });
    }

    toastShow({
      severity: 'success',
      summary: 'Successfully submitted restore request! Restoration may take 48 hours.',
      sticky: true,
    });
  };

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
                onClick={async () => {
                  await handleRestoreClicked(id);
                  handleClose();
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

const constructS3LocalIgvUrl = async (props: { bucketOrVolume: string; pathOrKey: string }) => {
  const { bucketOrVolume, pathOrKey } = props;

  const name = pathOrKey.split('/').pop() ?? pathOrKey;
  const file = `s3://${bucketOrVolume + '/' + pathOrKey}`;

  return `http://localhost:60151/load?file=${encodeURIComponent(file)}&name=${name}`;
};

type OpenIGVDesktopType = DataActionButtonProps & {
  handleClose: (newSelection?: DataAction) => void;
};
function OpenIGVDesktop(props: OpenIGVDesktopType) {
  const { toastShow } = useToastContext();
  const { id, bucketOrVolume, pathOrKey, type, handleClose } = props;

  // Query data
  const gdsLocalIgvUrl = useQuery(
    ['gds-local-igv', bucketOrVolume, pathOrKey],
    async () =>
      await constructGDSLocalIgvUrl({ bucketOrVolume: bucketOrVolume, pathOrKey: pathOrKey }),
    { enabled: type == 'gds', retry: false }
  );

  const s3LocalIgvUrl = useQuery(
    ['s3-local-igv', bucketOrVolume, pathOrKey],
    async () => {
      const objStatus = await getS3Status(id);
      // When unavailable redirect to Restore objects
      if (objStatus != S3StatusData.AVAILABLE) {
        handleClose(DataAction.RESTORE_OBJECT);
      }

      return constructS3LocalIgvUrl({
        bucketOrVolume: bucketOrVolume,
        pathOrKey: pathOrKey,
      });
    },
    { enabled: type == 's3', retry: false }
  );

  // IsError handling
  useEffect(() => {
    if (s3LocalIgvUrl.isError && s3LocalIgvUrl.error) {
      toastShow({
        severity: 'error',
        summary: 'Error on locating S3 URL.',
        detail: `${s3LocalIgvUrl.error}`,
        sticky: true,
      });
      handleClose();
    }
    if (gdsLocalIgvUrl.isError && gdsLocalIgvUrl.error) {
      toastShow({
        severity: 'error',
        summary: 'Error on locating GDS URL.',
        detail: `${gdsLocalIgvUrl.error}`,
        sticky: true,
      });
      handleClose();
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
          handleClose();
        } else if (xhr.readyState === 4 && xhr.status >= 200 && xhr.status < 300) {
          handleClose();
          toastShow({
            severity: 'success',
            summary: 'Successfully open in IGV desktop.',
            life: 3000,
          });
        }
      };
      xhr.send();
    }
  }, [gdsLocalIgvUrl.data, s3LocalIgvUrl.data]);

  return (
    <Dialog
      visible={true}
      style={{ width: '50vw' }}
      draggable={false}
      resizable={false}
      onHide={() => handleClose()}>
      <CircularLoaderWithText text='Opening in IGV desktop' />
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
type PresignedUrlDialogProps = { id: number; type: 's3' | 'gds'; handleClose: () => void };
function PresignedUrlDialog(props: PresignedUrlDialogProps) {
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
