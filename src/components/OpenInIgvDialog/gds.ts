import { post } from 'aws-amplify/api';
import { constructGDSUrl } from '../../api/gds';
import { createIndexFileFromBase } from './utils';

export const constructGDSLocalIgvUrl = async (props: {
  igvName: string;
  bucketOrVolume: string;
  pathOrKey: string;
}) => {
  const { bucketOrVolume, pathOrKey, igvName } = props;

  const idxFilePath = createIndexFileFromBase(pathOrKey);

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
  const base = encodeURIComponent(filePresignUrl);

  return `http://localhost:60151/load?index=${idx}&file=${base}&name=${igvName}`;
};
