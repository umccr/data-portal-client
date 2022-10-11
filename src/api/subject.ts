import API from '@aws-amplify/api';
import { useQuery } from 'react-query';
import { S3Row } from './s3';
import { GDSRow } from './gds';
/**
 * Portal `/subject/{subjectId}` api
 */

export type SubjectApiRes = {
  id: string;
  lims: Record<string, string | number | boolean | null>;
  features: string;
  results: S3Row[];
  results_gds: GDSRow[];
};
export function usePortalSubjectDataAPI(subjectId: string) {
  return useQuery(
    ['portal-subject', subjectId],
    async () => await API.get('portal', `/subjects/${subjectId}`, {}),
    {
      staleTime: Infinity,
    }
  );
}

export function usePortalSubjectAPI(apiConfig: Record<string, any>) {
  return useQuery(
    ['portal-subject', apiConfig],
    async () => await API.get('portal', `/subjects/`, apiConfig),
    {
      staleTime: Infinity,
    }
  );
}
