import { API } from '@aws-amplify/api';
import { useQuery } from 'react-query';
import { DjangoRestApiResponse } from './utils';

/**
 * Portal `/metadata/` api
 */

export type MetadataRow = {
  id: number;
  library_id: string;
  sample_name: string;
  sample_id: string;
  external_sample_id: string;
  subject_id: string;
  external_subject_id: string;
  phenotype: string;
  type: string;
  project_owner: string;
  project_name: string;
  assay: string;
  override_cycles: string;
} & Record<string, string>;

export type MetadataApiRes = DjangoRestApiResponse & { results: MetadataRow[] };

type usePortalMetadataAPIProps = {
  additionalPath?: string;
  apiConfig: Record<string, any>;
};
export function usePortalMetadataAPI({
  additionalPath = '',
  apiConfig,
}: usePortalMetadataAPIProps) {
  return useQuery(
    ['portal-metadata', apiConfig],
    async (): Promise<MetadataApiRes> =>
      await API.get('portal', `/metadata/${additionalPath}`, apiConfig),
    {
      staleTime: Infinity,
    }
  );
}
