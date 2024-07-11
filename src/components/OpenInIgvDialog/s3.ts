import { getS3ObjectFromProps, getS3PreSignedUrl } from '../../api/s3';
import { createIndexFileFromBase } from './utils';

export const constructS3LocalIgvUrlWithPresignedUrl = async (props: {
  igvName: string;
  bucketOrVolume: string;
  pathOrKey: string;
  baseFileS3ObjectId: number;
}) => {
  const { bucketOrVolume, pathOrKey: baseKey, igvName } = props;

  const idxKey = createIndexFileFromBase(baseKey);

  const indexS3Object = await getS3ObjectFromProps({
    bucketOrVolume: bucketOrVolume,
    pathOrKey: idxKey,
  });

  const baseFilePresignUrl = await getS3PreSignedUrl(props.baseFileS3ObjectId);
  const idxFilePresignUrl = await getS3PreSignedUrl(indexS3Object.id);

  const base = encodeURIComponent(baseFilePresignUrl);
  const idx = encodeURIComponent(idxFilePresignUrl);

  return `http://localhost:60151/load?index=${idx}&file=${base}&name=${igvName}`;
};

export const constructS3LocalIgvUrl = (props: {
  igvName: string;
  bucketOrVolume: string;
  pathOrKey: string;
}) => {
  const { bucketOrVolume, pathOrKey, igvName } = props;

  const file = `s3://${bucketOrVolume + '/' + pathOrKey}`;

  return `http://localhost:60151/load?file=${encodeURIComponent(file)}&name=${igvName}`;
};
