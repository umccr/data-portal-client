import React from 'react';
import { useMutation, useQuery } from 'react-query';
import { Button } from 'primereact/button';

import CircularLoaderWithText from '../../../components/CircularLoaderWithText';
import JSONToTable from '../../../components/JSONToTable';
import { SubjectApiRes, usePortalSubjectDataAPI } from '../../../api/subject';
import { invokeGPL } from './aws';
import { Message } from 'primereact/message';
import ConfirmationDialog from '../utils/ConfirmationDialog';

type Props = { subjectId: string };
function SubjectGPLLaunch({ subjectId }: Props) {
  // Eligibility of GPL trigger check
  const subjectApiQuery = usePortalSubjectDataAPI(subjectId);
  const subjectApiData = subjectApiQuery.data;

  const gplLaunchCheckQuery = useQuery(
    ['checkGPLTriggerAllow', subjectId],
    async () => {
      if (subjectApiData) return await checkGPLTriggerAllow(subjectApiData);
    },
    {
      enabled: !!subjectApiData,
    }
  );
  const gplLaunchCheckData: GplLaunchCheckType | undefined = gplLaunchCheckQuery.data;
  const gplTrigger = useMutation(
    ['gpl-invoke', subjectId],
    async (payload: { subject_id: string }) => await invokeGPL(payload)
  );

  // LOADING COMPONENT RETURN
  if (subjectApiQuery.isLoading) {
    return <CircularLoaderWithText text='Checking GPL report trigger. Please wait...' />;
  }
  if (gplTrigger.isLoading) {
    return <CircularLoaderWithText text='Launching GPL report' />;
  }

  // ERROR components return
  if (gplTrigger.isError) {
    return (
      <div className='mt-3 text-center'>
        <Button
          icon='pi pi-times'
          className='p-button-rounded p-button-danger bg-red-500 cursor-auto'
          aria-label='Cancel'
        />
        <div className='mt-3'>{`Something went wrong on launching RNAsum!`}</div>
        <pre className='mt-3 p-3 text-left overflow-auto surface-200 '>
          {JSON.stringify(gplTrigger.error, null, 2)}
        </pre>
      </div>
    );
  }

  // SUCCESS COMPONENT RETURN
  if (gplTrigger.isSuccess) {
    return (
      <div className='mt-3 text-center'>
        <Button
          icon='pi pi-check'
          className='p-button-rounded p-button-success bg-green-700 cursor-auto'
          aria-label='Cancel'
        />
        <div className='mt-3'>{`Successfully launch GPL! Check Slack for updates.`}</div>
        <pre className='mt-3'>{`You could navigate away from this page.`}</pre>
      </div>
    );
  }

  // Ineligible GPL
  if (gplLaunchCheckData && !gplLaunchCheckData.isGplLaunchAllowed) {
    return (
      <div>
        <div className='text-2xl font-medium mb-4'>{subjectId} - GPL Report</div>
        {gplLaunchCheckData.message ? (
          <div>
            <Message severity='info' text={gplLaunchCheckData.message} />
          </div>
        ) : (
          <></>
        )}
        {gplLaunchCheckData.additionalJSXComponent ? (
          <div className='mt-5'>{gplLaunchCheckData.additionalJSXComponent}</div>
        ) : (
          <></>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className='text-2xl font-medium mb-4'>{subjectId} - GPL Report Trigger</div>

      <h5 className='mt-0'>Description</h5>
      <div>
        Report trigger for{' '}
        <a
          target={`_blank`}
          href='https://github.com/umccr/gridss-purple-linx-nf/tree/main/deployment'>
          GRIDSS/PURPLE/LINX Pipeline
        </a>
      </div>

      <ConfirmationDialog
        header='GPL Launch Confirmation'
        payload={{ subject_id: subjectId }}
        onConfirm={gplTrigger.mutate}
        descriptionElement={
          <div className='w-full'>
            <div>Please confirm the following JSON before launching the workflow.</div>
            <br />
            <div>
              You can check the details on{' '}
              <a
                target={`_blank`}
                href='https://github.com/umccr/gridss-purple-linx-nf/tree/main/deployment#usage'>
                umccr/gridss-purple-linx-nf
              </a>
              .
            </div>
          </div>
        }
      />
    </div>
  );
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

async function checkGPLTriggerAllow(subjectData: SubjectApiRes): Promise<GplLaunchCheckType> {
  const gdsResults = subjectData.results_gds;
  const limsResults = subjectData.lims;

  const gplCheck: GplLaunchCheckType = { isGplLaunchAllowed: true };

  // Check if GPL report had exist in bucket
  const gplReport = gdsResults.filter(
    (r) => r.path.includes('gridss_purple_linx') && r.path.endsWith('linx.html')
  );
  if (Array.isArray(gplReport) && gplReport.length) {
    gplCheck.isGplLaunchAllowed = false;
    gplCheck.message =
      'Existing LINX report found. Please navigate Subject Overview page for download.';
    gplCheck.additionalJSXComponent = <JSONToTable objData={gplReport[0]} />;
    return gplCheck;
  }

  // Check if Subject has FPPE
  const filterFPPE = limsResults.filter((r) => r.source == 'FFPE');
  if (Array.isArray(filterFPPE) && filterFPPE.length) {
    gplCheck.isGplLaunchAllowed = false;
    gplCheck.message = `Subject has FPPE source found. GPL doesn't with FPPE sample.`;
    return gplCheck;
  }

  // NOTE: a bit of quick & dirty crude logic implementation here
  // don't expect this to be stay longer after GPL ported into ICA
  // as this should better be part of ICA Pipeline Workflow Automation like everyone else
  // The need of on-demand "LaunchPad" feature is different thing -- i.e. to be considered
  // better in Portal v2 revamp from ground up! Or, elsewhere dashboard. We shall see...
  const wgsBams = gdsResults
    .filter((r) => r.path.includes('wgs_tumor_normal') && r.path.endsWith('.bam'))
    .map((r) => r.id);

  // Unable to find WGS files
  if (!(Array.isArray(wgsBams) && wgsBams.length)) {
    gplCheck.isGplLaunchAllowed = false;
    gplCheck.message = 'No WGS BAMs are available for this Subject';
    return gplCheck;
  }

  return gplCheck;
}
