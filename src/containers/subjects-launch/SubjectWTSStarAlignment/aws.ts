import { Auth } from '@aws-amplify/auth';
import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';
import { REGION } from '../../../config';

const STAR_ALIGNMENT_LAMBDA_NAME = 'star-align-nf-batch-job-submission';

export type StarAlignmentPayload = {
  portal_run_id?: string;
  subject_id: string;
  sample_id: string;
  library_id: string;
  fastq_fwd: string;
  fastq_rev: string;
};

export const invokeWTSSAWorkflow = async (payload: StarAlignmentPayload) => {
  const currentCredentials = await Auth.currentCredentials();
  const lambdaClient = new LambdaClient({
    region: REGION,
    credentials: currentCredentials,
  });

  const command = new InvokeCommand({
    InvocationType: 'Event',
    FunctionName: `${STAR_ALIGNMENT_LAMBDA_NAME}`,
    Payload: Buffer.from(JSON.stringify(payload)),
  });

  return await lambdaClient.send(command);
};
