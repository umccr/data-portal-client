import API from '@aws-amplify/api';
import { useQuery } from 'react-query';
import { DjangoRestApiResponse } from './utils';

/**
 * Portal `/s3/` api
 */
export type S3Row = {
  id: number;
  bucket: string;
  key: string;
  size: number;
  last_modified_date: string;
  e_tag: string;
  unique_hash: string;
};

export type S3ApiData = DjangoRestApiResponse & { results: S3Row[] };

export function usePortalS3API(apiConfig: Record<string, any>) {
  return useQuery(
    ['portal-s3', apiConfig],
    async () => await API.get('portal', `/s3/`, apiConfig),
    {
      staleTime: Infinity,
    }
  );
}

export type PresignApiData = {
  signed_url: string;
  error?: string;
} & Record<string, any>;
export function usePortalS3PresignAPI(s3Id?: string | number) {
  return useQuery(
    ['portal-s3-presign', s3Id],
    async () => await API.get('portal', `/s3/${s3Id}/presign`, {}),
    {
      staleTime: 60 * 60 * 1000, // 1hour,
      enabled: !!s3Id,
    }
  );
}

export async function getS3PreSignedUrl(id: number) {
  const { error, signed_url } = await API.get('portal', `/s3/${id}/presign`, {});
  if (error) {
    throw Error('Unable to fetch get presigned url.');
  }
  return signed_url;
}
