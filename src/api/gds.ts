import API from '@aws-amplify/api';
import { useQuery } from 'react-query';

/**
 * Portal `/gds/` api
 */

export function usePortalGDSAPI(apiConfig: Record<string, any>) {
  return useQuery(
    ['portal-gds', apiConfig],
    async () => await API.get('portal', `/gds/`, apiConfig),
    {
      staleTime: Infinity,
    }
  );
}
