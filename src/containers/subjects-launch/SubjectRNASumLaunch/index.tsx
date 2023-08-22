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

function SubjectrnaSumTrigger({ subjectId }: Props) {
  const [input, setInput] = useState<RNAsumPayload | null>(null);
  const [isRnasumTableShow, setIsRnasumTableShow] = useState<boolean>(false);

  const columnList = [
    { header: 'Project', field: 'project' },
    { header: 'Name', field: 'name' },
    { header: 'Tissue Code', field: 'tissue_code' },
    { header: 'Sample no.', field: 'samples_no' },
  ];

  // Eligibility of RNAsum trigger check
  const subjectData = usePortalSubjectDataAPI(subjectId);
  const rnaSumCheckData: rnaSumTriggerCheckType | undefined = checkRnasumTriggerAllow(
    subjectData.data?.results_gds ?? []
  );

  const rnaSumTrigger = useMutation(
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
  if (rnaSumTrigger.isError) {
    return (
      <div className='mt-3 text-center'>
        <Button
          icon='pi pi-times'
          className='p-button-rounded p-button-danger bg-red-500 cursor-auto'
          aria-label='Cancel'
        />
        <div className='mt-3'>{`Something went wrong on launching RNAsum!`}</div>
        <pre className='mt-3 p-3 text-left overflow-auto surface-200 '>
          {JSON.stringify(rnaSumTrigger.error, Object.getOwnPropertyNames(rnaSumTrigger.error), 2)}
        </pre>
      </div>
    );
  }

  // LOADER COMPONENT RETURN
  if (subjectData.isLoading || subjectData.isLoading || !rnaSumCheckData) {
    return (
      <CircularLoaderWithText text='Please wait. We are checking if RNAsum trigger is available for this subject.' />
    );
  }
  if (rnaSumTrigger.isLoading) {
    return <CircularLoaderWithText text='Launching RNAsum report.' />;
  }

  // SUCCESS COMPONENT RETURN
  if (rnaSumTrigger.isSuccess) {
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
  if (!rnaSumCheckData.isrnaSumTriggerAllowed) {
    return (
      <div>
        <div className='text-2xl font-medium mb-4'>
          {subjectId} - Unable to trigger RNAsum for this subject
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
            checked={isRnasumTableShow}
            onChange={() => setIsRnasumTableShow((prev) => !prev)}
          />
        </div>
      </div>

      <div className={'grid'}>
        {isRnasumTableShow && (
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
        onConfirm={rnaSumTrigger.mutate}
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

export default SubjectrnaSumTrigger;

/**
 * Helper functions
 */

type rnaSumTriggerCheckType = {
  isrnaSumTriggerAllowed: boolean;
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
function checkRnasumTriggerAllow(gdsResult: GDSRow[]): rnaSumTriggerCheckType {
  const rnasumCheck: rnaSumTriggerCheckType = { isrnaSumTriggerAllowed: true };

  const rnasumInputData = groupSubjectGdsResult(gdsResult);

  if (rnasumInputData.wtsBamsIca.length < 1) {
    rnasumCheck.isrnaSumTriggerAllowed = false;
    rnasumCheck.message = `No transcriptome workflow output found for the Subject.`;
    return rnasumCheck;
  }

  if (rnasumInputData.wgsCancer.length < 1) {
    rnasumCheck.isrnaSumTriggerAllowed = false;
    rnasumCheck.message = `No umccrise workflow output found for the Subject.`;
    return rnasumCheck;
  }

  return rnasumCheck;
}
