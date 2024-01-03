import { get } from '@aws-amplify/api';
import { useQuery } from 'react-query';

/**
 * Portal `/sequence/` api
 */

export function usePortalSequenceAPI(apiConfig: Record<string, any>) {
  return useQuery(
    ['portal-sequence', apiConfig],
    async (): Promise<any> => {
      const response = await get({ apiName: 'portal', path: `/sequence/`, options: apiConfig })
        .response;
      return (await response.body.json()) as any;
    },
    {
      staleTime: Infinity,
    }
  );
}
