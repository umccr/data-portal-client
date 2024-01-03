import { fetchAuthSession } from '@aws-amplify/auth';
import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';
import { REGION } from '../../../config';

const GPL_LAMBDA_NAME = 'gpl_submit_job';
/**
 * GPL Input
 */
export type GPLSubjectPayload = {
  subject_id: string;
};
export type GPLSamplePayload = {
  tumor_sample_id: string;
  normal_sample_id: string;
};

export const invokeGPL = async (payload: GPLSubjectPayload | GPLSamplePayload) => {
  const currentCredentials = (await fetchAuthSession()).credentials;

  const lambdaClient = new LambdaClient({
    region: REGION,
    credentials: currentCredentials,
  });

  const command = new InvokeCommand({
    InvocationType: 'Event',
    FunctionName: `${GPL_LAMBDA_NAME}`,
    Payload: Buffer.from(JSON.stringify(payload)),
  });

  return await lambdaClient.send(command);
};
