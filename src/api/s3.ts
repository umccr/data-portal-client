import API from '@aws-amplify/api';
import { useQuery } from 'react-query';

/**
 * Portal `/s3/` api
 */

export function usePortalS3API(apiConfig: Record<string, any>) {
  return useQuery(
    ['portal-s3', apiConfig],
    async () => await API.get('portal', `/s3/`, apiConfig),
    {
      staleTime: Infinity,
    }
  );
}
