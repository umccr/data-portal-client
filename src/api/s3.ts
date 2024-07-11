import { get } from '@aws-amplify/api';
import { useQuery } from 'react-query';
import { DjangoRestApiResponse } from './utils';
import { objectToSearchString } from 'serialize-query-params';

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

export function usePortalS3API(
  apiConfig: Record<string, any>,
  useQueryOption?: Record<string, any>
) {
  return useQuery(
    ['portal-s3', apiConfig],
    async (): Promise<S3ApiData> => {
      let serializeQueryPath = '';
      if (apiConfig?.queryParams) {
        serializeQueryPath = objectToSearchString(apiConfig.queryParams);
        delete apiConfig.queryParams;
      }
      const response = await get({
        apiName: 'portal',
        path: `/s3/?${serializeQueryPath}`,
        options: apiConfig,
      }).response;
      return (await response.body.json()) as S3ApiData;
    },
    {
      staleTime: Infinity,
      ...useQueryOption,
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
    async (): Promise<PresignApiData> => {
      const response = await get({
        apiName: 'portal',
        path: `/s3/${s3Id}/presign`,
      }).response;
      return (await response.body.json()) as PresignApiData;
    },
    {
      staleTime: 60 * 60 * 1000, // 1hour,
      enabled: !!s3Id,
    }
  );
}

export enum S3StatusData {
  AVAILABLE = 'available',
  ARCHIVED = 'archived',
  RESTORING = 'restoring',
  EXPIRED = 'expired',
  ERROR = 'error',
}
export async function getS3Status(s3Id: string | number): Promise<S3StatusData> {
  const response = await get({
    apiName: 'portal',
    path: `/s3/${s3Id}/status`,
  }).response;
  const data = (await response.body.json()) as any;

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

    if (isArchived && !restoreStatus) {
      return S3StatusData.ARCHIVED;
    }

    const isRestoring = restoreStatus?.includes('true');
    if (isRestoring) {
      return S3StatusData.RESTORING;
    }

    const expiryChunk = restoreStatus?.slice(25);
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
  const response = await get({
    apiName: 'portal',
    path: `/s3/${id}/presign`,
  }).response;
  const { error, signed_url } = (await response.body.json()) as any;

  if (error) {
    throw Error('Unable to get PreSigned URL');
  }
  return signed_url;
}

export async function getS3ObjectFromProps(props: { bucketOrVolume: string; pathOrKey: string }) {
  const response = await get({
    apiName: 'portal',
    path: `/s3/`,
    options: {
      queryParams: {
        bucket: props.bucketOrVolume,
        key: props.pathOrKey,
      },
    },
  }).response;

  const data = (await response.body.json()) as S3ApiData;

  if (data.results.length !== 1) {
    throw new Error('No or more than one s3 object found!');
  }

  return data.results[0];
}
