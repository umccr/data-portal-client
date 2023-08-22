import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { Button } from 'primereact/button';
import CircularLoaderWithText from '../../../components/CircularLoaderWithText';
import { Dropdown } from 'primereact/dropdown';
import DataTableWrapper from '../../../components/DataTableWrapper';
import { InputSwitch } from 'primereact/inputswitch';
import ConfirmationDialog from '../utils/ConfirmationDialog';
import {
  PRIMARY_DATASETS_OPTION,
  EXTENDED_DATASETS_OPTION,
  PAN_CANCER_DATASETS_OPTION,
} from './utils';
import { GDSRow } from '../../../api/gds';
import { usePortalSubjectDataAPI } from '../../../api/subject';
import { invokeRNAsumWorkflow, RNAsumPayload } from './aws';

import './index.css';
import { DataTableSelectionSingleChangeEvent } from 'primereact/datatable';

const ALL_DATASETS_OPTION = [
  ...PRIMARY_DATASETS_OPTION,
  ...EXTENDED_DATASETS_OPTION,
  ...PAN_CANCER_DATASETS_OPTION,
];

type Props = {
  subjectId: string;
};

export default function SubjectRNAsumLaunch({ subjectId }: Props) {
  const [input, setInput] = useState<RNAsumPayload | null>(null);
  const [isRNAsumTableShow, setIsRNAsumTableShow] = useState<boolean>(false);

  const columnList = [
    { header: 'Project', field: 'project' },
    { header: 'Name', field: 'name' },
    { header: 'Tissue Code', field: 'tissue_code' },
    { header: 'Sample no.', field: 'samples_no' },
  ];

  // Eligibility of RNAsum trigger check
  const subjectData = usePortalSubjectDataAPI(subjectId);
  const rnasumCheckData: RNAsumTriggerCheckType | undefined = checkRNAsumTriggerAllow(
    subjectData.data?.results_gds ?? []
  );

  const rnasumTrigger = useMutation(
    ['rnasum-invoke', input],
    async (payload: RNAsumPayload) => await invokeRNAsumWorkflow(payload)
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
  if (rnasumTrigger.isError) {
    return (
      <div className='mt-3 text-center'>
        <Button
          icon='pi pi-times'
          className='p-button-rounded p-button-danger bg-red-500 cursor-auto'
          aria-label='Cancel'
        />
        <div className='mt-3'>{`Something went wrong on launching RNAsum!`}</div>
        <pre className='mt-3 p-3 text-left overflow-auto surface-200 '>
          {JSON.stringify(rnasumTrigger.error, Object.getOwnPropertyNames(rnasumTrigger.error), 2)}
        </pre>
      </div>
    );
  }

  // LOADER COMPONENT RETURN
  if (subjectData.isLoading || subjectData.isLoading || !rnasumCheckData) {
    return (
      <CircularLoaderWithText text='Please wait. We are checking if RNAsum trigger is available for this subject.' />
    );
  }
  if (rnasumTrigger.isLoading) {
    return <CircularLoaderWithText text='Launching RNAsum report.' />;
  }

  // SUCCESS COMPONENT RETURN
  if (rnasumTrigger.isSuccess) {
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
  if (!rnasumCheckData.isRNAsumTriggerAllowed) {
    return (
      <div>
        <div className='text-2xl font-medium mb-4'>
          {subjectId} - Unable to trigger RNAsum for this subject
        </div>
        {rnasumCheckData.message ? <div>{rnasumCheckData.message}</div> : <></>}
        {rnasumCheckData.additionalJSXComponent ? (
          <div className='mt-5'>{rnasumCheckData.additionalJSXComponent}</div>
        ) : (
          <></>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className='text-2xl font-medium mb-4'>{subjectId} - RNAsum Report Trigger</div>

      <h5 className='mt-0'>Description</h5>
      <div>
        Report trigger for the{' '}
        <a
          target={`_blank`}
          href='https://github.com/umccr/data-portal-apis/blob/dev/docs/pipeline/automation/rnasum.md'>
          RNAsum workflow
        </a>
      </div>

      <h5>Select Dataset</h5>
      <div className={'grid'}>
        <div className={'col-2 align-items-center'}>Project ID</div>
        <div className={'col-2'}>
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
      </div>

      <div className={'grid'}>
        <div className={'col-2 align-items-center'}>
          <div>
            Show{' '}
            <a
              target={'_blank'}
              href={'https://github.com/umccr/RNAsum/blob/master/TCGA_projects_summary.md'}
              rel='noreferrer'>
              TCGA
            </a>{' '}
            Datasets Table
          </div>
        </div>
        <div className={'col-2'}>
          <InputSwitch
            id='rnasum-toggle'
            checked={isRNAsumTableShow}
            onChange={() => setIsRNAsumTableShow((prev) => !prev)}
          />
        </div>
      </div>

      <div className={'grid'}>
        {isRNAsumTableShow && (
          <>
            <div className={'col-2'} />
            <div className='mt-3'>
              <DataTableWrapper
                dataTableValue={ALL_DATASETS_OPTION}
                columns={columnList}
                isLoading={false}
                overrideDataTableProps={{
                  selectionMode: 'single',
                  onSelectionChange: (
                    e: DataTableSelectionSingleChangeEvent<typeof ALL_DATASETS_OPTION>
                  ) => {
                    setInput({ subject_id: subjectId, dataset: e.value.project });
                  },
                  scrollable: true,
                  scrollHeight: '450px',
                }}
              />
              <div>
                <p className='text-sm'>*Click on row to select the dataset</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* CONFIRMATION DIALOG */}
      <ConfirmationDialog
        header='RNAsum Launch Confirmation'
        payload={input}
        onConfirm={rnasumTrigger.mutate}
        descriptionElement={
          <div className='w-full'>
            <div>Please confirm the following JSON before launching the workflow.</div>
            <br />
            <div>
              You can check the details on{' '}
              <a
                target={`_blank`}
                href='https://github.com/umccr/data-portal-apis/blob/dev/docs/pipeline/automation/rnasum.md'>
                umccr/data-portal-apis
              </a>
              .
            </div>
          </div>
        }
      />
    </div>
  );
}

/**
 * Helper functions
 */

type RNAsumTriggerCheckType = {
  isRNAsumTriggerAllowed: boolean;
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
function checkRNAsumTriggerAllow(gdsResult: GDSRow[]): RNAsumTriggerCheckType {
  const rnasumCheck: RNAsumTriggerCheckType = { isRNAsumTriggerAllowed: true };

  const rnasumInputData = groupSubjectGdsResult(gdsResult);

  if (rnasumInputData.wtsBamsIca.length < 1) {
    rnasumCheck.isRNAsumTriggerAllowed = false;
    rnasumCheck.message = `No transcriptome workflow output found for the Subject.`;
    return rnasumCheck;
  }

  if (rnasumInputData.wgsCancer.length < 1) {
    rnasumCheck.isRNAsumTriggerAllowed = false;
    rnasumCheck.message = `No umccrise workflow output found for the Subject.`;
    return rnasumCheck;
  }

  return rnasumCheck;
}
