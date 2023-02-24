import { Auth } from '@aws-amplify/auth';
import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';
import { FASTQPairingPayload } from '../../../api/pairing';
import { LAMBDA_PREFIX, REGION } from '../../../config';

const WGS_TN_WF_LAMBDA_NAME = 'tumor_normal';
/**
 * T/N Lambda Input
 */

export const invokeWGSTNWorkflow = async (payload: FASTQPairingPayload) => {
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
