import { API } from '@aws-amplify/api';
import { useQuery } from 'react-query';

/**
 * FASTQ PAIRING
 */
type ReadFiles = {
  class: 'File';
  location: string;
};

export type FastqRow = {
  rgid: string;
  rgsm: string;
  rglb: string;
  lane: number;
  read_1: ReadFiles;
  read_2: ReadFiles;
};

export type FASTQPairingPayload = {
  subject_id: string;
  sample_name_germline: string;
  sample_name_somatic: string;
  output_file_prefix_germline: string;
  output_file_prefix_somatic: string;
  output_directory_germline: string;
  output_directory_somatic: string;
  fastq_list_rows: FastqRow[];
  tumor_fastq_list_rows: FastqRow[];
};

type UsePortalSubjectParingAPIProps = {
  apiConfig: Record<string, any>;
};
export function usePortalSubjectParingAPI({ apiConfig }: UsePortalSubjectParingAPIProps) {
  return useQuery(
    ['portal-fastq', apiConfig],
    async (): Promise<FASTQPairingPayload[]> =>
      await API.post('portal', `/pairing/by_subjects/`, apiConfig),
    {
      staleTime: Infinity,
    }
  );
}
