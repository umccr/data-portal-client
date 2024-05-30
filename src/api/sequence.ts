import { get } from '@aws-amplify/api';
import { useQuery } from 'react-query';
import { objectToSearchString } from 'serialize-query-params';

/**
 * Portal `/sequence/` api
 */

export function usePortalSequenceAPI(apiConfig: Record<string, any>) {
  return useQuery(
    ['portal-sequence', apiConfig],
    async (): Promise<any> => {
      let serializeQueryPath = '';
      if (apiConfig?.queryParams) {
        serializeQueryPath = objectToSearchString(apiConfig.queryParams);
        delete apiConfig.queryParams;
      }
      const response = await get({
        apiName: 'portal',
        path: `/sequence/?${serializeQueryPath}`,
        options: apiConfig,
      }).response;
      return (await response.body.json()) as any;
    },
    {
      staleTime: Infinity,
    }
  );
}
