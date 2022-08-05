import API from '@aws-amplify/api';

export async function getS3PreSignedUrl(id: number) {
  const { error, signed_url } = await API.get('portal', `/s3/${id}/presign`, {});
  if (error) {
    throw Error('Unable to fetch get presigned url.');
  }
  return signed_url;
}

export async function getGDSPreSignedUrl(id: number) {
  const { error, signed_url } = await API.get('portal', `/gds/${id}/presign`, {});
  if (error) {
    throw Error('Unable to fetch get presigned url.');
  }
  return signed_url;
}
