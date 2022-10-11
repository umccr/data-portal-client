import API from '@aws-amplify/api';
import { useQuery } from 'react-query';

/**
 * Portal `/gds/` api
 */

export type GDSRow = {
  id: number;
  path: string;
  time_modified: string;
  size_in_bytes: number;
  volume_name: string;
} & Record<string, string | number | boolean | null>;

export function usePortalGDSAPI(apiConfig: Record<string, any>) {
  return useQuery(
    ['portal-gds', apiConfig],
    async () => await API.get('portal', `/gds/`, apiConfig),
    {
      staleTime: Infinity,
    }
  );
}

export type PresignApiData = {
  signed_url: string;
  error?: string;
} & Record<string, any>;
export function usePortalGDSPresignAPI(gdsId?: string | number) {
  return useQuery(
    ['portal-gds-presign', gdsId],
    async () => await API.get('portal', `/gds/${gdsId}/presign`, {}),
    {
      staleTime: 60 * 60 * 1000, // 1hour,
      enabled: !!gdsId,
    }
  );
}

export async function getGDSPreSignedUrl(id: number) {
  const { error, signed_url } = await API.get('portal', `/gds/${id}/presign`, {});
  if (error) {
    throw Error('Unable to fetch get presigned url.');
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
