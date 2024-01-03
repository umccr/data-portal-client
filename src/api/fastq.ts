import { get } from 'aws-amplify/api';
import { useQuery } from 'react-query';
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
      const response = await get({
        apiName: 'portal',
        path: `/fastq/${additionalPath}`,
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
