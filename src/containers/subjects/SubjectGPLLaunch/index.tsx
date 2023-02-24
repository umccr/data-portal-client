import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { API } from '@aws-amplify/api';
import { Button } from 'primereact/button';
import { ConfirmDialog } from 'primereact/confirmdialog';

import CircularLoaderWithText from '../../../components/CircularLoaderWithText';
import JSONToTable from '../../../components/JSONToTable';
import { usePortalSubjectDataAPI } from '../../../api/subject';
import { GDSRow } from '../../../api/gds';

type Props = { subjectId: string };
function SubjectGPLLaunch({ subjectId }: Props) {
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState<boolean>(false);
  const [isLaunch, setIsLaunch] = useState<boolean>(false);

  // Eligibility of GPL trigger check
  const subjectApiQuery = usePortalSubjectDataAPI(subjectId);
  const subjectApiData = subjectApiQuery.data;

  const gplLaunchCheckQuery = useQuery(
    ['checkGPLTriggerAllow', subjectId],
    async () => {
      if (subjectApiData) return await checkGPLTriggerAllow(subjectApiData.results_gds);
    },
    {
      enabled: !!subjectApiData,
    }
  );
  const gplLaunchCheckData: GplLaunchCheckType | undefined = gplLaunchCheckQuery.data;

  const gplLaunch = useQuery(
    ['gpl-invoke', subjectId],
    async (): Promise<Record<string, string | number>> => await invokeGPLWorkflow(subjectId),
    {
      enabled: isLaunch,
    }
  );

  // LOADING COMPONENT RETURN
  if (subjectApiQuery.isLoading) {
    return (
      <CircularLoaderWithText text='Please wait. We are checking if GPL trigger is available for this subject.' />
    );
  }
  if (gplLaunch.isLoading) {
    return <CircularLoaderWithText text='Launching GPL report.' />;
  }

  // ERROR components return
  if (gplLaunch.isError) {
    return (
      <div className='mt-3 text-center'>
        <Button
          icon='pi pi-times'
          className='p-button-rounded p-button-danger bg-red-500 cursor-auto'
          aria-label='Cancel'
        />
        <div className='mt-3'>{`Something went wrong on launching RNAsum!`}</div>
        <pre className='mt-3 p-3 text-left overflow-auto surface-200 '>
          {JSON.stringify(gplLaunch.error, null, 2)}
        </pre>
      </div>
    );
  }

  // SUCCESS COMPONENT RETURN
  if (gplLaunch.isSuccess) {
    return (
      <div className='mt-3 text-center'>
        <Button
          icon='pi pi-check'
          className='p-button-rounded p-button-success bg-green-700 cursor-auto'
          aria-label='Cancel'
        />
        <div className='mt-3'>{`Successfully launch GPL! Check Slack for updates.`}</div>
        <pre className='mt-3'>{`You could navigate away from this page.`}</pre>
        {gplLaunch.data && (
          <>
            <h5>Trigger Response:</h5>
            <pre className='mt-3'>{JSON.stringify(gplLaunch.data, null, 2)}</pre>
          </>
        )}
      </div>
    );
  }

  // Ineligible GPL
  if (gplLaunchCheckData && !gplLaunchCheckData.isGplLaunchAllowed) {
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

  return (
    <div>
      <div className='text-2xl font-medium mb-4'>{subjectId} - GPL Report Trigger</div>
      <div>This is a trigger for GRIDSS/PURPLE/LINX (GPL) report</div>
      <Button
        onClick={() => setIsConfirmDialogOpen(true)}
        label='Next'
        className='p-button-info bg-blue-800 w-full mt-5'
      />

      {/* CONFIRMATION DIALOG */}
      <ConfirmDialog
        draggable={false}
        visible={isConfirmDialogOpen}
        header='RNAsum Launch Confirmation'
        message={
          <div className=''>
            <div>Please Confirm the following payload before you launch.</div>
            <pre className='mt-3 p-3 text-left overflow-auto surface-200 '>
              {JSON.stringify({ subject_id: subjectId }, null, 2)}
            </pre>
          </div>
        }
        acceptLabel='Launch'
        rejectLabel='Cancel'
        acceptClassName='p-button-raised p-button-danger'
        rejectClassName='p-button-secondary p-button-text text-blue-800'
        accept={() => {
          setIsLaunch(true);
          setIsConfirmDialogOpen(false);
        }}
        reject={() => setIsConfirmDialogOpen(false)}
      />
    </div>
  );
}

export default SubjectGPLLaunch;

/**
 * Helper function
 */

const invokeGPLWorkflow = async (subjectId: string) => {
  const init = {
    headers: { 'Content-Type': 'application/json' },
    body: {
      subject_id: subjectId,
    },
  };
  return await API.post('gpl', '', init);
};

type GplLaunchCheckType = {
  isGplLaunchAllowed: boolean;
  message?: string;
  additionalJSXComponent?: JSX.Element;
};

async function checkGPLTriggerAllow(gdsResults: GDSRow[]): Promise<GplLaunchCheckType> {
  const gplCheck: GplLaunchCheckType = { isGplLaunchAllowed: true };

  // Check if GPL report had exist in bucket
  const gplReport = gdsResults.filter(
    (r) => r.path.includes('gridss_purple_linx') && r.path.endsWith('linx.html')
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
