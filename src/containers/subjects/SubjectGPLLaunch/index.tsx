import React, { useState } from 'react';
import { useQuery } from 'react-query';
import API from '@aws-amplify/api';
import { Button } from 'primereact/button';
import CircularLoaderWithText from '../../../components/CircularLoaderWithText';
import JSONToTable from '../../../components/JSONToTable';
import { SubjectApiRes, usePortalSubjectDataAPI } from '../../../api/subject';
import { getS3Status, S3Row, S3StatusData } from '../../../api/s3';

type Props = { subjectId: string };
function SubjectGPLLaunch({ subjectId }: Props) {
  const [gplTriggerStatus, setGplTriggerStatus] = useState<Record<string, boolean>>({
    isLoading: false,
    isTrigger: false,
  });
  const [triggerResponse, setTriggerResponse] = useState<Record<string, string | number>>({});
  async function triggerGPL() {
    setGplTriggerStatus({ isTrigger: true, isLoading: true });
    try {
      const init = {
        headers: { 'Content-Type': 'application/json' },
        body: {
          subject_id: subjectId,
        },
      };
      const data = await API.post('gpl', '', init);
      setTriggerResponse({ ...data });
    } catch (e: any) {
      setTriggerResponse({
        error: e.message,
      });
    }
    setGplTriggerStatus((prev) => ({ ...prev, isLoading: false }));
  }

  // Eligibility of GPL trigger check
  const subjectApiQuery = usePortalSubjectDataAPI(subjectId);
  const subjectApiData: SubjectApiRes = subjectApiQuery.data;

  const gplLaunchCheckQuery = useQuery(
    ['checkGPLTriggerAllow', subjectId],
    async () => await checkGPLTriggerAllow(subjectApiData.results),
    {
      enabled: !!subjectApiData,
    }
  );
  const gplLaunchCheckData: GplLaunchCheckType | undefined = gplLaunchCheckQuery.data;

  // Loader
  if (gplLaunchCheckQuery.isLoading || subjectApiQuery.isLoading || !gplLaunchCheckData) {
    return (
      <CircularLoaderWithText text='Please wait. We are checking if GPL trigger is available for this subject.' />
    );
  }

  // Responses if gpl has triggered
  if (gplTriggerStatus.isTrigger) {
    if (gplTriggerStatus.isLoading) {
      return <CircularLoaderWithText text='Triggering GPL report.' />;
    }

    const triggerResponseKeys = Object.keys(triggerResponse);
    if (triggerResponseKeys.includes('error')) {
      return (
        <div>
          <div className='font-semibold text-2xl'>{subjectId} - Error triggering GPL</div>
          <div className='mt-5'>Message: {triggerResponse.error}</div>
        </div>
      );
    }
    if (triggerResponseKeys.length > 0) {
      return (
        <div>
          <div>{subjectId} - Successfully GPL trigger </div>
          <div className='mt-5'>
            <JSONToTable objData={triggerResponse} />
          </div>
        </div>
      );
    }
  } else {
    // Response of GPL trigger check
    if (gplLaunchCheckData.isGplLaunchAllowed) {
      return (
        <div>
          <div className='text-2xl font-medium mb-4'>{subjectId} - GPL Report Trigger</div>
          <div>Confirm launching GPL Report batch job?</div>
          <Button
            onClick={() => triggerGPL()}
            label='Confirm'
            className='p-button-info bg-blue-800 w-full mt-5'
          />
        </div>
      );
    } else {
      return (
        <div>
          <div className='text-2xl font-medium mb-4'>
            {subjectId} - Unable to trigger GPL for this subject
          </div>
          {gplLaunchCheckData.message ? <div>{gplLaunchCheckData.message}</div> : <></>}
          {gplLaunchCheckData.additionalJSXComponent ? (
            <div className='mt-5'>{gplLaunchCheckData.additionalJSXComponent}</div>
          ) : (
            <></>
          )}
        </div>
      );
    }
  }

  return <div>Something went wrong</div>;
}

export default SubjectGPLLaunch;

/**
 * Helper function
 */

type GplLaunchCheckType = {
  isGplLaunchAllowed: boolean;
  message?: string;
  additionalJSXComponent?: JSX.Element;
};

async function checkGPLTriggerAllow(s3Results: S3Row[]): Promise<GplLaunchCheckType> {
  const gplCheck: GplLaunchCheckType = { isGplLaunchAllowed: true };

  // Check if GPL report had exist in bucket
  const gplReport = s3Results.filter(
    (r) => r.key.includes('gridss_purple_linx') && r.key.endsWith('linx.html')
  );
  if (Array.isArray(gplReport) && gplReport.length) {
    gplCheck.isGplLaunchAllowed = false;
    gplCheck.message = 'GPL report had exist please check the following file';
    gplCheck.additionalJSXComponent = <JSONToTable objData={gplReport[0]} />;
    return gplCheck;
  }

  // NOTE: a bit of quick & dirty crude logic implementation here
  // don't expect this to be stay longer after GPL ported into ICA
  // as this should better be part of ICA Pipeline Workflow Automation like everyone else
  // The need of on-demand "LaunchPad" feature is different thing -- i.e. to be considered
  // better in Portal v2 revamp from ground up! Or, elsewhere dashboard. We shall see...
  const wgsBams = s3Results
    .filter((r) => r.key.includes('WGS') && r.key.endsWith('.bam'))
    .map((r) => r.id);

  // Unable to find WGS files
  if (!(Array.isArray(wgsBams) && wgsBams.length)) {
    gplCheck.isGplLaunchAllowed = false;
    gplCheck.message = 'No WGS (bcbio) BAMs are available for the Subject';
    return gplCheck;
  }

  const id = wgsBams.sort((a, b) => b - a)[0]; // detect at least one wgs bam has already frozen

  const s3IdStatus = await getS3Status(id);
  if (s3IdStatus == S3StatusData.ERROR) {
    gplCheck.isGplLaunchAllowed = false;
    gplCheck.message = 'An error has occurred on checking S3 Data.';
    return gplCheck;
  }

  if (s3IdStatus == S3StatusData.ARCHIVED) {
    gplCheck.isGplLaunchAllowed = false;
    gplCheck.message = 'Subject WGS BAMs are archived. Please restore both tumor and normal BAMs.';
    return gplCheck;
  }

  if (s3IdStatus == S3StatusData.RESTORING) {
    gplCheck.isGplLaunchAllowed = false;
    gplCheck.message = 'Subject WGS BAMs are restoring in progress.';
    return gplCheck;
  }

  if (s3IdStatus == S3StatusData.EXPIRED) {
    gplCheck.isGplLaunchAllowed = false;
    gplCheck.message = 'Restoration have expired. Please restore both tumor and normal BAMs.';
    return gplCheck;
  }

  if (s3IdStatus == S3StatusData.AVAILABLE) {
    return gplCheck;
  }

  return gplCheck;
}