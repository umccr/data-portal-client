import { Auth } from '@aws-amplify/auth';
import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';
import { LAMBDA_PREFIX, REGION } from '../../../config';

const WGS_TN_WF_LAMBDA_NAME = 'tumor_normal';
/**
 * T/N Lambda Input
 */
type ReadFiles = {
  class: 'File';
  location: string;
};

type FastqRow = {
  rgid: string;
  rgsm: string;
  rglb: string;
  lane: number;
  read_1: ReadFiles;
  read_2: ReadFiles;
};

export type Payload = {
  subject_id: string;
  sample_name: string;
  output_file_prefix: string;
  output_directory: string;
  fastq_list_rows: FastqRow[];
  tumor_fastq_list_rows: FastqRow[];
};
export const invokeWGSTNWorkflow = async (payload: Payload) => {
  const currentCredentials = await Auth.currentCredentials();
  const lambdaClient = new LambdaClient({
    region: REGION,
    credentials: currentCredentials,
  });

  const command = new InvokeCommand({
    InvocationType: 'Event',
    FunctionName: `${LAMBDA_PREFIX}${WGS_TN_WF_LAMBDA_NAME}`,
    Payload: Buffer.from(JSON.stringify(payload)),
  });

  return await lambdaClient.send(command);
};
