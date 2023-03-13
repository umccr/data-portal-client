import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Button } from 'primereact/button';
import { ConfirmDialog } from 'primereact/confirmdialog';
import CircularLoaderWithText from '../../../components/CircularLoaderWithText';
import { Dropdown } from 'primereact/dropdown';
import DataTableWrapper from '../../../components/DataTableWrapper';
import { InputSwitch } from 'primereact/inputswitch';
import {
  PRIMARY_DATASETS_OPTION,
  EXTENDED_DATASETS_OPTION,
  PAN_CANCER_DATASETS_OPTION,
} from './utils';
import { GDSRow } from '../../../api/gds';
import { usePortalSubjectDataAPI } from '../../../api/subject';
import { invokeRNAsumWorkflow, RNAsumPayload } from './aws';

import './index.css';

const ALL_DATASETS_OPTION = [
  ...PRIMARY_DATASETS_OPTION,
  ...EXTENDED_DATASETS_OPTION,
  ...PAN_CANCER_DATASETS_OPTION,
];

type Props = {
  subjectId: string;
};

function SubjectRNASumLaunch({ subjectId }: Props) {
  const [input, setInput] = useState<RNAsumPayload | null>(null);
  const [isRnasumTableShow, setIsRnasumTableShow] = useState<boolean>(false);

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState<boolean>(false);
  const [isLaunch, setIsLaunch] = useState<boolean>(false);

  const columnList = [
    { header: 'Project', field: 'project' },
    { header: 'Name', field: 'name' },
    { header: 'Tissue Code', field: 'tissue_code' },
    { header: 'Sample no.', field: 'samples_no' },
  ];

  // Eligibility of RNASum trigger check
  const subjectData = usePortalSubjectDataAPI(subjectId);
  const rnaSumCheckData: RNASumLaunchCheckType | undefined = checkRnasumTriggerAllow(
    subjectData.data?.results_gds ?? []
  );

  const rnaSumLaunch = useQuery(
    ['rnasum-invoke', input],
    async () => {
      if (input) await invokeRNAsumWorkflow(input);
    },
    {
      enabled: isLaunch && !!input,
    }
  );

  // ERROR components return
  if (subjectData.isError) {
    return (
      <div className='mt-3 text-center'>
        <Button
          icon='pi pi-times'
          className='p-button-rounded p-button-danger bg-red-500 cursor-auto'
          aria-label='Cancel'
        />
        <div className='mt-3'>{'Unable to check RNAsum eligibility.'}</div>
      </div>
    );
  }
  if (rnaSumLaunch.isError) {
    return (
      <div className='mt-3 text-center'>
        <Button
          icon='pi pi-times'
          className='p-button-rounded p-button-danger bg-red-500 cursor-auto'
          aria-label='Cancel'
        />
        <div className='mt-3'>{`Something went wrong on launching RNAsum!`}</div>
        <pre className='mt-3 p-3 text-left overflow-auto surface-200 '>
          {JSON.stringify(rnaSumLaunch.error, null, 2)}
        </pre>
      </div>
    );
  }

  // LOADER COMPONENT RETURN
  if (subjectData.isLoading || subjectData.isLoading || !rnaSumCheckData) {
    return (
      <CircularLoaderWithText text='Please wait. We are checking if RNASum trigger is available for this subject.' />
    );
  }
  if (rnaSumLaunch.isLoading) {
    return <CircularLoaderWithText text='Launching RNAsum report.' />;
  }

  // SUCCESS COMPONENT RETURN
  if (rnaSumLaunch.isSuccess) {
    return (
      <div className='mt-3 text-center'>
        <Button
          icon='pi pi-check'
          className='p-button-rounded p-button-success bg-green-700 cursor-auto'
          aria-label='Cancel'
        />
        <div className='mt-3'>{`Successfully launch RNAsum! Check Slack for updates.`}</div>
        <pre className='mt-3'>{`You could navigate away from this page.`}</pre>
      </div>
    );
  }

  // RNAsum not allowed
  if (!rnaSumCheckData.isRNASumLaunchAllowed) {
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

  return (
    <div>
      <div className='text-2xl font-medium mb-4'>{subjectId} - RNASum Report Trigger</div>

      <h5 className='mt-0'>Description</h5>
      <div>
        This is a trigger for the{' '}
        <a
          target={`_blank`}
          href='https://github.com/umccr/data-portal-apis/blob/dev/docs/pipeline/automation/rnasum.md'>
          RNAsum-ICA-Pipeline-Lambda
        </a>
        .
      </div>

      <h5>Select Dataset Project</h5>
      <div className='flex align-items-center justify-content-between mb-3'>
        <div>Dataset Project</div>
        <Dropdown
          className='m-0'
          value={input?.dataset}
          options={ALL_DATASETS_OPTION}
          optionValue='project'
          optionLabel='project'
          onChange={(e) => setInput({ subject_id: subjectId, dataset: e.value })}
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
              overrideDataTableProps={{
                selectionMode: 'single',
                onSelectionChange: (e) => {
                  setInput({ subject_id: subjectId, dataset: e.value.project });
                },
                scrollable: true,
                scrollHeight: '450px',
              }}
            />
          </div>
        ) : (
          <></>
        )}
      </div>

      <div className='w-full mt-5 text-center'>
        <Button
          disabled={!input}
          onClick={() => setIsConfirmDialogOpen(true)}
          label='Next'
          iconPos='right'
          icon='pi pi-chevron-right'
          className='p-button-info p-button-raised bg-blue-800'
        />
      </div>

      {/* CONFIRMATION DIALOG */}
      <ConfirmDialog
        draggable={false}
        visible={isConfirmDialogOpen}
        header='RNAsum Launch Confirmation'
        message={
          <div className=''>
            <div>Please Confirm the following payload before you launch.</div>
            <pre className='mt-3 p-3 text-left overflow-auto surface-200 '>
              {JSON.stringify(input, null, 2)}
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
        onHide={() => setIsConfirmDialogOpen(false)}
      />
    </div>
  );
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
function checkRnasumTriggerAllow(gdsResult: GDSRow[]): RNASumLaunchCheckType {
  const rnasumCheck: RNASumLaunchCheckType = { isRNASumLaunchAllowed: true };

  const rnasumInputData = groupSubjectGdsResult(gdsResult);

  if (rnasumInputData.wtsBamsIca.length < 1) {
    rnasumCheck.isRNASumLaunchAllowed = false;
    rnasumCheck.message = `No transcriptome workflow output found for the Subject.`;
    return rnasumCheck;
  }

  if (rnasumInputData.wgsCancer.length < 1) {
    rnasumCheck.isRNASumLaunchAllowed = false;
    rnasumCheck.message = `No umccrise workflow output found for the Subject.`;
    return rnasumCheck;
  }

  return rnasumCheck;
}
