import React, { useState } from 'react';
import API from '@aws-amplify/api';
import { useQuery } from 'react-query';
import { Button } from 'primereact/button';
import CircularLoaderWithText from '../../../components/CircularLoaderWithText';
import { Dropdown } from 'primereact/dropdown';
import DataTableWrapper from '../../../components/DataTableWrapper';
import { InputSwitch } from 'primereact/inputswitch';
import './index.css';
import {
  PRIMARY_DATASETS_OPTION,
  EXTENDED_DATASETS_OPTION,
  PAN_CANCER_DATASETS_OPTION,
} from './utils';
import { useToastContext } from '../../../providers/ToastProvider';
import { GDSRow } from '../../../api/gds';
import { SubjectApiRes, usePortalSubjectDataAPI } from '../../../api/subject';

const ALL_DATASETS_OPTION = [
  ...PRIMARY_DATASETS_OPTION,
  ...EXTENDED_DATASETS_OPTION,
  ...PAN_CANCER_DATASETS_OPTION,
];

type Props = {
  subjectId: string;
};

function SubjectRNASumLaunch({ subjectId }: Props) {
  const toast = useToastContext();

  const [projectSelected, setProjectSelected] = useState<string>('');
  const [isRnasumTableShow, setIsRnasumTableShow] = useState<boolean>(false);

  const [rnasumTriggerStatus, setRnasumTriggerStatus] = useState<Record<string, boolean>>({
    isLoading: false,
    isTrigger: false,
  });

  async function triggerRNASum(projectSelected: string) {
    setRnasumTriggerStatus({ isTrigger: true, isLoading: true });
    try {
      const init = {
        headers: { 'Content-Type': 'application/json' },
        body: {
          subject_id: subjectId,
          dataset: projectSelected,
        },
      };
      await API.post('portal', '/manops/rnasum', init);
      toast?.show({
        severity: 'success',
        summary: 'RNASum report has been triggered.',
        detail: `Generating '${projectSelected}' dataset RNAsum report for ${subjectId}. Check Slack for updates!`,
        sticky: true,
        life: 3000,
      });
    } catch (e: any) {
      toast?.show({
        severity: 'error',
        summary: 'Something went wrong triggering RNASum report',
        detail: e.message,
        sticky: true,
        life: 3000,
      });
    }
    setRnasumTriggerStatus((prev) => ({ ...prev, isLoading: false }));
  }

  const columnList = [
    { header: 'Project', field: 'project' },
    { header: 'Name', field: 'name' },
    { header: 'Tissue Code', field: 'tissue_code' },
    { header: 'Sample no.', field: 'samples_no' },
  ];

  // Eligibility of RNASum trigger check
  const subjectData = usePortalSubjectDataAPI(subjectId);
  const resultsGds: SubjectApiRes = subjectData.data;
  const rnaSumCheckQuery = useQuery(
    ['rnasumCheck', subjectId],
    () => checkRnasumTriggerAllow(resultsGds.results_gds),
    { enabled: !!resultsGds }
  );
  const rnaSumCheckData: RNASumLaunchCheckType | undefined = rnaSumCheckQuery.data;

  // Loader components
  if (subjectData.isLoading || subjectData.isLoading || !rnaSumCheckData) {
    return (
      <CircularLoaderWithText text='Please wait. We are checking if RNASum trigger is available for this subject.' />
    );
  }
  if (rnasumTriggerStatus.isLoading) {
    return <CircularLoaderWithText text='Please wait. Triggering RNASum report.' />;
  }

  // Main page
  if (rnaSumCheckData.isRNASumLaunchAllowed) {
    return (
      <div>
        <div className='text-2xl font-medium mb-4'>{subjectId} - RNASum Report Trigger</div>

        <div className='flex align-items-center justify-content-between my-3'>
          <div>Dataset Project</div>
          <Dropdown
            className='m-0'
            value={projectSelected}
            options={ALL_DATASETS_OPTION}
            optionValue='project'
            optionLabel='project'
            onChange={(e) => setProjectSelected(e.value)}
            placeholder='Select a Project'
          />
        </div>

        <div className='my-3'>
          <div className='flex align-items-center justify-content-between'>
            <div>Show RNASum Table</div>
            <InputSwitch
              id='rnasum-toggle'
              checked={isRnasumTableShow}
              onChange={() => setIsRnasumTableShow((prev) => !prev)}
            />
          </div>
          {isRnasumTableShow ? (
            <div className='mt-3'>
              <DataTableWrapper
                dataTableValue={ALL_DATASETS_OPTION}
                columns={columnList}
                isLoading={false}
              />
            </div>
          ) : (
            <></>
          )}
        </div>

        <Button
          disabled={!projectSelected}
          onClick={() => triggerRNASum(projectSelected)}
          label='Launch RNASum Report'
          className='p-button-info bg-blue-800 w-full mt-5'
        />
      </div>
    );
  } else {
    return (
      <div>
        <div className='text-2xl font-medium mb-4'>
          {subjectId} - Unable to trigger RNASum for this subject
        </div>
        {rnaSumCheckData.message ? <div>{rnaSumCheckData.message}</div> : <></>}
        {rnaSumCheckData.additionalJSXComponent ? (
          <div className='mt-5'>{rnaSumCheckData.additionalJSXComponent}</div>
        ) : (
          <></>
        )}
      </div>
    );
  }
}

export default SubjectRNASumLaunch;

/**
 * Helper functions
 */

type RNASumLaunchCheckType = {
  isRNASumLaunchAllowed: boolean;
  message?: string;
  additionalJSXComponent?: JSX.Element;
};
function groupSubjectGdsResult(results_gds: GDSRow[]) {
  // This is only what is needed for RNAsum report
  return {
    wtsBamsIca: results_gds.filter(
      (r) => r.path.includes('wts_tumor_only') && r.path.endsWith('bam')
    ),
    wgsCancer: results_gds.filter(
      (r) => r.path.includes('umccrise') && r.path.endsWith('cancer_report.html')
    ),
  };
}
async function checkRnasumTriggerAllow(gdsResult: GDSRow[]): Promise<RNASumLaunchCheckType> {
  const rnasumCheck: RNASumLaunchCheckType = { isRNASumLaunchAllowed: true };

  const rnasumInputData = groupSubjectGdsResult(gdsResult);

  if (rnasumInputData.wtsBamsIca.length < 1) {
    rnasumCheck.isRNASumLaunchAllowed = false;
    rnasumCheck.message = `No transcriptome workflow output found for the Subject.`;
    return rnasumCheck;
  }

  if (rnasumInputData.wtsBamsIca.length > 1) {
    rnasumCheck.isRNASumLaunchAllowed = false;
    rnasumCheck.message = `Multiple transcriptome workflow output found for the Subject.`;
    return rnasumCheck;
  }

  if (rnasumInputData.wgsCancer.length < 1) {
    rnasumCheck.isRNASumLaunchAllowed = false;
    rnasumCheck.message = `No umccrise workflow output found for the Subject.`;
    return rnasumCheck;
  }

  return rnasumCheck;
}
