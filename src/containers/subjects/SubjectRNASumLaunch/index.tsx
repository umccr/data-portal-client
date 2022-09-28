import React, { useState } from 'react';
import { useQuery } from 'react-query';
import API from '@aws-amplify/api';
import { Button } from 'primereact/button';
import CircularLoaderWithText from '../../../components/CircularLoaderWithText';
import { Dropdown } from 'primereact/dropdown';
import DataTableWrapper from '../../../components/DataTableWrapper';

import { InputSwitch } from 'primereact/inputswitch';
import './index.css';
// Customs
import {
  PRIMARY_DATASETS_OPTION,
  EXTENDED_DATASETS_OPTION,
  PAN_CANCER_DATASETS_OPTION,
} from './utils';
import { useToastContext } from '../../../providers/ToastProvider';

const ALL_DATASETS_OPTION = [
  ...PRIMARY_DATASETS_OPTION,
  ...EXTENDED_DATASETS_OPTION,
  ...PAN_CANCER_DATASETS_OPTION,
];

type Props = {
  subjectId: string;
};

// API Functions
type RNASumLaunchCheckType = {
  isRNASumLaunchAllowed: boolean;
  message?: string;
  additionalJSXComponent?: JSX.Element;
};

type gdsBasicMetadataType = {
  id: number;
  path: string;
  size_in_bytes: number;
};
type gdsResultType = gdsBasicMetadataType & Record<string, string | number>;

function groupSubjectGdsResult(results_gds: gdsResultType[]) {
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

async function checkRnasumTriggerAllow(subjectId: string): Promise<RNASumLaunchCheckType> {
  const rnasumCheck: RNASumLaunchCheckType = { isRNASumLaunchAllowed: true };

  const subjectData = await API.get('portal', `/subjects/${subjectId}`, {});
  const gdsResult: gdsResultType[] = subjectData.results_gds;

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
      await API.post('rnasum', '', init);
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
  const { isFetching, isLoading, data } = useQuery('getSubjectData', () =>
    checkRnasumTriggerAllow(subjectId)
  );
  if (isLoading || isFetching || !data) {
    return (
      <CircularLoaderWithText text='Please wait. We are checking if RNASum trigger is available for this subject.' />
    );
  }

  if (rnasumTriggerStatus.isLoading) {
    return <CircularLoaderWithText text='Please wait. Triggering RNASum report.' />;
  }

  if (data.isRNASumLaunchAllowed) {
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
        {data.message ? <div>{data.message}</div> : <></>}
        {data.additionalJSXComponent ? (
          <div className='mt-5'>{data.additionalJSXComponent}</div>
        ) : (
          <></>
        )}
      </div>
    );
  }
}

export default SubjectRNASumLaunch;
