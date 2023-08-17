import { Auth } from '@aws-amplify/auth';
import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';
import { REGION } from '../../../config';

const ONCOANALYSER_LAMBDA_NAME = 'oncoanalyser-batch-job-submission';

export type OncoanalyserWGSPayload = {
  mode: 'wgs';
  portal_id?: string;
  subject_id: string;
  tumor_wgs_sample_id: string;
  tumor_wgs_library_id: string;
  tumor_wgs_bam: string;
  normal_wgs_sample_id: string;
  normal_wgs_library_id: string;
  normal_wgs_bam: string;
};

export type OncoanalyserWTSPayload = {
  mode: 'wts';
  portal_id?: string;
  subject_id: string;
  tumor_wts_sample_id: string;
  tumor_wts_library_id: string;
  tumor_wts_bam: string;
};

export type OncoanalyserWGTSPayload = {
  mode: 'wgts';
  portal_id?: string;
  subject_id: string;
  tumor_wgs_sample_id: string;
  tumor_wgs_library_id: string;
  tumor_wgs_bam: string;
  normal_wgs_sample_id: string;
  normal_wgs_library_id: string;
  normal_wgs_bam: string;
  tumor_wts_sample_id: string;
  tumor_wts_library_id: string;
  tumor_wts_bam: string;
};

export type OncoanalyserWGTSExistingWGSPayload = {
  mode: 'wgts_existing_wgs';
  portal_id?: string;
  subject_id: string;
  tumor_wgs_sample_id: string;
  tumor_wgs_library_id: string;
  tumor_wgs_bam: string;
  normal_wgs_sample_id: string;
  normal_wgs_library_id: string;
  normal_wgs_bam: string;
  tumor_wts_sample_id: string;
  tumor_wts_library_id: string;
  tumor_wts_bam: string;
  existing_wgs_dir: string;
};

export type OncoanalyserWGTSExistingWTSPayload = {
  mode: 'wgts_existing_wts';
  portal_id?: string;
  subject_id: string;
  tumor_wgs_sample_id: string;
  tumor_wgs_library_id: string;
  tumor_wgs_bam: string;
  normal_wgs_sample_id: string;
  normal_wgs_library_id: string;
  normal_wgs_bam: string;
  tumor_wts_sample_id: string;
  tumor_wts_library_id: string;
  tumor_wts_bam: string;
  existing_wts_dir: string;
};

export type OncoanalyserWGTSExistingBothPayload = {
  mode: 'wgts_existing_both';
  portal_id?: string;
  subject_id: string;
  tumor_wgs_sample_id: string;
  tumor_wgs_library_id: string;
  tumor_wgs_bam: string;
  normal_wgs_sample_id: string;
  normal_wgs_library_id: string;
  normal_wgs_bam: string;
  tumor_wts_sample_id: string;
  tumor_wts_library_id: string;
  tumor_wts_bam: string;
  existing_wgs_dir: string;
  existing_wts_dir: string;
};

export type AllOncoanalyserPayload =
  | OncoanalyserWTSPayload
  | OncoanalyserWGSPayload
  | OncoanalyserWGTSPayload
  | OncoanalyserWGTSExistingWGSPayload
  | OncoanalyserWGTSExistingWTSPayload
  | OncoanalyserWGTSExistingBothPayload;

export const invokeOncoanalyserLambda = async (payload: AllOncoanalyserPayload) => {
  const currentCredentials = await Auth.currentCredentials();
  const lambdaClient = new LambdaClient({
    region: REGION,
    credentials: currentCredentials,
  });

  const command = new InvokeCommand({
    InvocationType: 'Event',
    FunctionName: `${ONCOANALYSER_LAMBDA_NAME}`,
    Payload: Buffer.from(JSON.stringify(payload)),
  });

  return await lambdaClient.send(command);
};
