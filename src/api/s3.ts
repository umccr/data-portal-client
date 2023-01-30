import { API } from '@aws-amplify/api';
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

export enum S3StatusData {
  AVAILABLE,
  ARCHIVED,
  RESTORING,
  EXPIRED,
  ERROR,
}
export async function getS3Status(s3Id: string | number): Promise<S3StatusData> {
  const data = await API.get('portal', `/s3/${s3Id}/status`, {});
  const { head_object } = data;
  if (head_object) {
    // NOTE: head_object contains S3 API response as described follows
    // https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3.html#S3.Client.head_object

    // head request has raised some error
    const { error } = head_object;
    if (error) {
      return S3StatusData.ERROR;
    }

    const isArchived = head_object['StorageClass'] === 'DEEP_ARCHIVE';
    const restoreStatus = head_object['Restore'];

    if (isArchived || !restoreStatus) {
      return S3StatusData.ARCHIVED;
    }

    const isRestoring = restoreStatus.includes('true');
    if (isRestoring) {
      return S3StatusData.RESTORING;
    }

    const expiryChunk = restoreStatus.slice(25);
    if (!isRestoring && expiryChunk) {
      const expiryDateStr = expiryChunk.split('=')[1];
      const expiryDate = Date.parse(expiryDateStr);
      const expired = expiryDate < Date.now();
      if (expired) {
        return S3StatusData.EXPIRED;
      }
    }
  }
  return S3StatusData.AVAILABLE;
}

export function usePortalS3StatusAPI(s3Id?: string | number) {
  return useQuery(['portal-s3-status', s3Id], async () => await getS3Status(s3Id ?? ''), {
    staleTime: 60 * 60 * 1000, // 1hour,
    enabled: !!s3Id,
  });
}

export async function getS3PreSignedUrl(id: number) {
  const { error, signed_url } = await API.get('portal', `/s3/${id}/presign`, {});
  if (error) {
    throw Error('Unable to fetch get presigned url.');
  }
  return signed_url;
}
