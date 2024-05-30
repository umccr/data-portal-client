import { get } from 'aws-amplify/api';
import { useQuery } from 'react-query';
import { objectToSearchString } from 'serialize-query-params';
import { DjangoRestApiResponse } from './utils';

/**
 * Portal `/lims/` api
 */

export type LimsRow = {
  id: number;
  illumina_id: string;
  run: number;
  timestamp: string;
  subject_id: string;
  sample_id: string;
  library_id: string;
  sample_name: string;
  project_owner: string;
  project_name: string;
  assay: string;
  override_cycles: string;
  phenotype: string;
  type: string;
} & Record<string, string | number | null>;

export type LimsApiRes = DjangoRestApiResponse & { results: LimsRow[] };

export function usePortalLimsAPI(apiConfig: Record<string, any>) {
  return useQuery(
    ['portal-lims', apiConfig],
    async (): Promise<LimsApiRes> => {
      let serializeQueryPath = '';
      if (apiConfig?.queryParams) {
        serializeQueryPath = objectToSearchString(apiConfig.queryParams);
        delete apiConfig.queryParams;
      }

      const response = await get({
        apiName: 'portal',
        path: `/lims/?${serializeQueryPath}`,
        options: apiConfig,
      }).response;
      return (await response.body.json()) as LimsApiRes;
    },
    {
      staleTime: Infinity,
    }
  );
}

export function usePortalLimsByAggregateCount(apiConfig: Record<string, any>) {
  return useQuery(
    ['portal-lims', apiConfig],
    async (): Promise<any> => {
      let serializeQueryPath = '';
      if (apiConfig?.queryParams) {
        serializeQueryPath = objectToSearchString(apiConfig.queryParams);
        delete apiConfig.queryParams;
      }

      const response = await get({
        apiName: 'portal',
        path: `/lims/by_aggregate_count?${serializeQueryPath}`,
        options: apiConfig,
      }).response;
      return (await response.body.json()) as any;
    },
    {
      staleTime: Infinity,
    }
  );
}
