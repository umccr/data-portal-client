import { get } from 'aws-amplify/api';
import { useQuery } from 'react-query';
import { objectToSearchString } from 'serialize-query-params';
import { DjangoRestApiResponse } from './utils';

/**
 * Portal `/fastq/` api
 */

export type FastqRow = {
  id: number;
  rgid: string;
  rgsm: string;
  rglb: string;
  lane: number;
  read_1: string;
  read_2: string;
  sequence_run: number;
};

export type FastqApiRes = DjangoRestApiResponse & { results: FastqRow[] };
type UsePortalFastqAPIProps = {
  additionalPath?: string;
  apiConfig: Record<string, any>;
  useQueryOption?: Record<string, any>;
};
export function usePortalFastqAPI({
  additionalPath = '',
  apiConfig,
  useQueryOption,
}: UsePortalFastqAPIProps) {
  return useQuery(
    ['portal-fastq', additionalPath, apiConfig],
    async (): Promise<FastqApiRes> => {
      let serializeQueryPath = '';
      if (apiConfig?.queryParams) {
        serializeQueryPath = objectToSearchString(apiConfig.queryParams);
        delete apiConfig.queryParams;
      }

      const response = await get({
        apiName: 'portal',
        path: `/fastq/${additionalPath}?${serializeQueryPath}`,
        options: apiConfig,
      }).response;
      return (await response.body.json()) as FastqApiRes;
    },
    {
      staleTime: Infinity,
      ...useQueryOption,
    }
  );
}
