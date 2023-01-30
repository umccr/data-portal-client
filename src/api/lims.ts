import { API } from '@aws-amplify/api';
import { useQuery } from 'react-query';
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
} & Record<string, string>;

export type LimsApiRes = DjangoRestApiResponse & { results: LimsRow[] };

export function usePortalLimsAPI(apiConfig: Record<string, any>) {
  return useQuery(
    ['portal-lims', apiConfig],
    async () => await API.get('portal', `/lims/`, apiConfig),
    {
      staleTime: Infinity,
    }
  );
}
