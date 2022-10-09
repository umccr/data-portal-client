import API from '@aws-amplify/api';
import { useQuery } from 'react-query';

/**
 * Portal `/sequence/` api
 */

export function usePortalSequenceAPI(apiConfig: Record<string, any>) {
  return useQuery(
    ['portal-sequence', apiConfig],
    async () => await API.get('portal', `/sequence/`, apiConfig),
    {
      staleTime: Infinity,
    }
  );
}
