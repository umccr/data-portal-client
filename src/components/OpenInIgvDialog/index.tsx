import React, { useEffect } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';

import { useQuery } from 'react-query';

import { getS3Status, S3StatusData } from '../../api/s3';
import { useToastContext } from '../../providers/ToastProvider';
import CircularLoaderWithText from '../../components/CircularLoaderWithText';
import { useParams } from 'react-router-dom';
import { usePortalSubjectDataAPI } from '../../api/subject';
import { constructIgvNameParameter } from './utils';
import { constructGDSLocalIgvUrl } from './gds';
import { constructS3LocalIgvUrl, constructS3LocalIgvUrlWithPresignedUrl } from './s3';

type OpenIGVDesktopDialogType = {
  handleClose: () => void;
  handleNeedRestore: () => void;
  id: number;
  bucketOrVolume: string;
  pathOrKey: string;
  type: 's3' | 'gds';
  enforceIgvPresignedMode?: boolean;
};
export default function OpenIGVDesktopDialog(props: OpenIGVDesktopDialogType) {
  const { subjectId } = useParams();
  const { toastShow } = useToastContext();
  const {
    id,
    bucketOrVolume,
    pathOrKey,
    type,
    enforceIgvPresignedMode,
    handleClose,
    handleNeedRestore,
  } = props;

  if (!subjectId) return <div>No subject Id found!</div>;

  // Pulling data from usePortalSubjectDataAPI (this hook should cache if it was previously called)
  const {
    isError: subjectIsError,
    error: subjectError,
    data: subjectData,
  } = usePortalSubjectDataAPI(subjectId);

  // Query data
  const gdsLocalIgvUrl = useQuery(
    ['gds-local-igv', bucketOrVolume, pathOrKey],
    async () => {
      const igvName = constructIgvNameParameter({ pathOrKey, subjectData: subjectData! });

      return await constructGDSLocalIgvUrl({
        bucketOrVolume: bucketOrVolume,
        pathOrKey: pathOrKey,
        igvName: igvName,
      });
    },
    { enabled: type == 'gds' && !!subjectData, retry: false }
  );

  const s3LocalIgvUrl = useQuery(
    ['s3-local-igv', bucketOrVolume, pathOrKey],
    async () => {
      const igvName = constructIgvNameParameter({ pathOrKey, subjectData: subjectData! });

      if (enforceIgvPresignedMode) {
        //  We are not doing any status check here, as data is in the Data account and archiving/restoring mechanism is
        //  not in place.

        return await constructS3LocalIgvUrlWithPresignedUrl({
          igvName: igvName,
          bucketOrVolume: bucketOrVolume,
          pathOrKey: pathOrKey,
          baseFileS3ObjectId: id,
        });
      } else {
        const objStatus = await getS3Status(id);

        // When unavailable redirect to Restore objects
        if (objStatus != S3StatusData.AVAILABLE) {
          handleNeedRestore();
        }

        return constructS3LocalIgvUrl({
          igvName: igvName,
          bucketOrVolume: bucketOrVolume,
          pathOrKey: pathOrKey,
        });
      }
    },
    { enabled: type == 's3' && !!subjectData, retry: false }
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
    if (subjectError && subjectIsError) {
      toastShow({
        severity: 'error',
        summary: 'Error on retrieving subject data.',
        detail: `${subjectError}`,
        sticky: true,
      });
      handleClose();
    }
  }, [
    s3LocalIgvUrl.isError,
    s3LocalIgvUrl.error,
    gdsLocalIgvUrl.isError,
    gdsLocalIgvUrl.error,
    subjectError,
    subjectIsError,
  ]);

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
