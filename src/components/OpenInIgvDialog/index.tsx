import React, { useEffect } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';

import { useQuery } from 'react-query';

import { getS3Status, S3StatusData } from '../../api/s3';
import { constructGDSUrl } from '../../api/gds';
import { useToastContext } from '../../providers/ToastProvider';
import CircularLoaderWithText from '../../components/CircularLoaderWithText';
import { post } from 'aws-amplify/api';
import { useParams } from 'react-router-dom';
import { SubjectApiRes, usePortalSubjectDataAPI } from '../../api/subject';

type OpenIGVDesktopDialogType = {
  handleClose: () => void;
  handleNeedRestore: () => void;
  id: number;
  bucketOrVolume: string;
  pathOrKey: string;
  type: 's3' | 'gds';
};
export default function OpenIGVDesktopDialog(props: OpenIGVDesktopDialogType) {
  const { subjectId } = useParams();
  const { toastShow } = useToastContext();
  const { id, bucketOrVolume, pathOrKey, type, handleClose, handleNeedRestore } = props;

  if (!subjectId) return <div>No subject Id found!</div>;

  // We wanted to show more info when opening in IGV desktop
  // Ref: https://umccr.slack.com/archives/CP356DDCH/p1707116441928299?thread_ts=1706583808.733149&cid=CP356DDCH

  // Pulling data from usePortalSubjectDataAPI as this hook should cache if it was previously used
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

      console.log('hello');

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
      const objStatus = await getS3Status(id);
      // When unavailable redirect to Restore objects
      if (objStatus != S3StatusData.AVAILABLE) {
        handleNeedRestore();
      }

      const igvName = constructIgvNameParameter({ pathOrKey, subjectData: subjectData! });

      return constructS3LocalIgvUrl({
        igvName: igvName,
        bucketOrVolume: bucketOrVolume,
        pathOrKey: pathOrKey,
      });
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

const constructGDSLocalIgvUrl = async (props: {
  igvName: string;
  bucketOrVolume: string;
  pathOrKey: string;
}) => {
  const { bucketOrVolume, pathOrKey, igvName } = props;

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

  const response = await post({
    apiName: 'portal',
    path: `/presign`,
    options: {
      body: [fileGdsUrl, idxFileGdsUrl],
    },
  }).response;
  const { signed_urls } = (await response.body.json()) as any;

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

  return `http://localhost:60151/load?index=${idx}&file=${enf}&name=${igvName}`;
};

const constructS3LocalIgvUrl = (props: {
  igvName: string;
  bucketOrVolume: string;
  pathOrKey: string;
}) => {
  const { bucketOrVolume, pathOrKey, igvName } = props;

  const file = `s3://${bucketOrVolume + '/' + pathOrKey}`;

  return `http://localhost:60151/load?file=${encodeURIComponent(file)}&name=${igvName}`;
};

/**
 * The desired outcome is to include libraryId, sampleId, type, and filetype
 * Desired output: SBJ00000_WGS_L0000000_PRJ00000_tumor.bam
 *
 * To find the match of metadata for the specific key/path will iterate through the lims record
 * @param props
 */
const constructIgvNameParameter = ({
  subjectData,
  pathOrKey,
}: {
  pathOrKey: string;
  subjectData: SubjectApiRes;
}) => {
  // 1. subjectId
  const subjectId = subjectData.id;

  // 2. type
  const type = subjectData.lims.reduce((acc, curr) => {
    const value = curr.type;

    if (acc.includes(value)) {
      return acc;
    }

    if (pathOrKey.toLowerCase().includes(value.toLowerCase())) {
      acc.push(value);
    }
    return acc;
  }, [] as Array<string>);
  const finalType = type.join('_');

  // 3. libraryId
  const libraryId = subjectData.lims.reduce((acc, curr) => {
    const value = curr.library_id;

    if (acc.includes(value)) {
      return acc;
    }

    if (pathOrKey.toLowerCase().includes(value.toLowerCase())) {
      acc.push(value);
    }

    return acc;
  }, [] as Array<string>);
  const finalLibraryId = libraryId.join('_');

  // 4. sampleId + filetype
  const sampleIdAndExt = pathOrKey.split('/').pop() ?? pathOrKey;

  return `${subjectId}_${finalType}_${finalLibraryId}_${sampleIdAndExt}`;
};
