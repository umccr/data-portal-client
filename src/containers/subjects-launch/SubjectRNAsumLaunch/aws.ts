import { Auth } from '@aws-amplify/auth';
import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';
import { LAMBDA_PREFIX, REGION } from '../../../config';

const RNASUM_WF_LAMBDA_NAME = 'rnasum_by_subject';

/**
 * RNAsum by subject lambda input
 */
export type RNAsumPayload = {
  subject_id: string;
  dataset: string;
};
export const invokeRNAsumWorkflow = async (payload: RNAsumPayload) => {
  const currentCredentials = await Auth.currentCredentials();

  const lambdaClient = new LambdaClient({
    region: REGION,
    credentials: currentCredentials,
  });

  const command = new InvokeCommand({
    InvocationType: 'Event',
    FunctionName: `${LAMBDA_PREFIX}${RNASUM_WF_LAMBDA_NAME}`,
    Payload: Buffer.from(JSON.stringify(payload)),
  });

  return await lambdaClient.send(command);
};
