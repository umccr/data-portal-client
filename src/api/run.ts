/* TODO marking this component for deprecation at some point  ~victor */
//  https://github.com/umccr/data-portal-apis/issues/559

import { API } from '@aws-amplify/api';
import { useQuery } from 'react-query';

/**
 * Portal `/runs/` api
 */

export function usePortalRunsAPI(
  apiConfig: Record<string, any>,
  useQueryOption?: Record<string, unknown>
) {
  return useQuery(
    ['portal-runs', apiConfig],
    async () => await API.get('portal', `/runs/`, apiConfig),
    {
      staleTime: Infinity,
      ...useQueryOption,
    }
  );
}
