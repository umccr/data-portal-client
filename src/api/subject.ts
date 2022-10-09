import API from '@aws-amplify/api';
import { useQuery } from 'react-query';

/**
 * Portal `/subject/{subjectId}` api
 */

export type S3Row = {
  id: number;
  bucket: string;
  key: string;
  size: number;
  last_modified_date: string;
  e_tag: string;
  unique_hash: string;
};

export type GDSRow = {
  id: number;
  path: string;
  time_modified: string;
  size_in_bytes: number;
  volume_name: string;
} & Record<string, string | number | boolean | null>;

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

/**
 * utils
 */

export const getBaseNameFromKey = (key: string) => {
  return key.split('/')[key.split('/').length - 1];
};

export const constructGDSUrl = ({
  volume_name,
  path,
}: {
  volume_name: string;
  path: string;
}): string => {
  return 'gds://' + volume_name + path;
};
