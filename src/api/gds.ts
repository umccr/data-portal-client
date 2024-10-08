import { get } from 'aws-amplify/api';
import { useQuery } from 'react-query';
import { DjangoRestApiResponse } from './utils';
import { objectToSearchString } from 'serialize-query-params';

/**
 * Portal `/gds/` api
 */

export type GDSRow = {
  id: number;
  path: string;
  time_modified: string;
  size_in_bytes: number;
  volume_name: string;
  file_id: string;
  name: string;
  volume_id: string;
  type: string | null;
  tenant_id: string;
  sub_tenant_id: string;
  time_created: string;
  created_by: string;
  modified_by: string;
  inherited_acl: string | null;
  urn: string;
  is_uploaded: true | null;
  archive_status: string;
  time_archived: string | null;
  storage_tier: string;
  presigned_url: string | null;
  unique_hash: string;
};

export type GDSApiData = DjangoRestApiResponse & { results: GDSRow[] };

export function usePortalGDSAPI(
  apiConfig: Record<string, any>,
  useQueryOption?: Record<string, any>
) {
  return useQuery(
    ['portal-gds', apiConfig],
    async (): Promise<any> => {
      const serializeQueryPath = objectToSearchString(apiConfig.queryParams);
      delete apiConfig.queryParams;

      const response = await get({
        apiName: 'portal',
        path: `/gds?${serializeQueryPath}`,
        options: apiConfig,
      }).response;
      return (await response.body.json()) as any;
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
export function usePortalGDSPresignAPI(gdsId?: string | number, apiConfig?: Record<string, any>) {
  return useQuery(
    ['portal-gds-presign', gdsId, apiConfig],
    async (): Promise<PresignApiData> => {
      let serializeQueryPath = '';
      if (apiConfig?.queryParams) {
        serializeQueryPath = objectToSearchString(apiConfig.queryParams);
        delete apiConfig.queryParams;
      }

      const response = await get({
        apiName: 'portal',
        path: `/gds/${gdsId}/presign?${serializeQueryPath}`,
        options: apiConfig,
      }).response;
      return (await response.body.json()) as PresignApiData;
    },
    {
      staleTime: 60 * 60 * 1000, // 1hour,
      enabled: !!gdsId,
    }
  );
}

/**
 * Generate a brand new presigned url for the particular object Id.
 *
 * By default, the API it will have 'Attachment' Content-Disposition. For 'inline' set the 'Content-Disposition' and 'Content-Type'.
 * Example on specifying inline in the apiConfig as follows. 
    {
      "headers": {
        "Content-Disposition": "inline",
        "Content-Type": "text/html"
      }
    }
 * @param id
 * @param apiConfig
 * @returns
 */
export async function getGDSPreSignedUrl(id: number, apiConfig?: Record<string, any>) {
  let serializeQueryPath = '';
  if (apiConfig?.queryParams) {
    serializeQueryPath = objectToSearchString(apiConfig.queryParams);
    delete apiConfig.queryParams;
  }

  const response = await get({
    apiName: 'portal',
    path: `/gds/${id}/presign?${serializeQueryPath}`,
    options: apiConfig,
  }).response;
  const { error, signed_url } = (await response.body.json()) as any;
  if (error) {
    throw Error('Unable to get PreSigned URL');
  }
  return signed_url;
}
/**
 * Helper function
 */
export const constructGDSUrl = ({
  volume_name,
  path,
}: {
  volume_name: string;
  path: string;
}): string => {
  return 'gds://' + volume_name + path;
};
