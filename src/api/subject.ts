import { get } from '@aws-amplify/api';
import { useQuery } from 'react-query';
import { objectToSearchString } from 'serialize-query-params';
import { S3Row } from './s3';
import { GDSRow } from './gds';
import { LimsRow } from './lims';
import { DjangoRestApiResponse } from './utils';
/**
 * Portal `/subject/{subjectId}` api
 */

export type SubjectApiRes = {
  id: string;
  lims: LimsRow[];
  features: string[];
  results: S3Row[];
  results_gds: GDSRow[];
  results_sash: S3Row[];
  results_icav1_cttsov1: S3Row[];
  results_icav1_wgts: S3Row[];
  results_icav2_cttsov2: S3Row[];
  results_icav2_wgts: S3Row[];
  results_icav2_sash: S3Row[];
};

export type SubjectListApiRes = DjangoRestApiResponse & { results: string[] };

export function usePortalSubjectDataAPI(subjectId: string) {
  return useQuery(
    ['portal-subject', subjectId],
    async (): Promise<SubjectApiRes> => {
      const response = await get({ apiName: 'portal', path: `/subjects/${subjectId}` }).response;
      return (await response.body.json()) as SubjectApiRes;
    },
    {
      staleTime: Infinity,
    }
  );
}

export function usePortalSubjectAPI(apiConfig: Record<string, any>) {
  return useQuery(
    ['portal-subject', apiConfig],
    async (): Promise<SubjectListApiRes> => {
      let serializeQueryPath = '';
      if (apiConfig?.queryParams) {
        serializeQueryPath = objectToSearchString(apiConfig.queryParams);
        delete apiConfig.queryParams;
      }

      const response = await get({
        apiName: 'portal',
        path: `/subjects/?${serializeQueryPath}`,
        options: apiConfig,
      }).response;
      return (await response.body.json()) as SubjectListApiRes;
    },
    {
      staleTime: Infinity,
    }
  );
}
