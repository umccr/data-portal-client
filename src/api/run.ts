/* TODO marking this component for deprecation at some point  ~victor */
//  https://github.com/umccr/data-portal-apis/issues/559

import { get } from 'aws-amplify/api';
import { useQuery } from 'react-query';
import { objectToSearchString } from 'serialize-query-params';

/**
 * Portal `/runs/` api
 */

export function usePortalRunsAPI(
  apiConfig: Record<string, any>,
  useQueryOption?: Record<string, unknown>
) {
  return useQuery(
    ['portal-runs', apiConfig],
    async (): Promise<any> => {
      let serializeQueryPath = '';
      if (apiConfig?.queryParams) {
        serializeQueryPath = objectToSearchString(apiConfig.queryParams);
        delete apiConfig.queryParams;
      }

      const response = await get({
        apiName: 'portal',
        path: `/runs/?${serializeQueryPath}`,
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
