import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { InputText } from 'primereact/inputtext';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { RadioButton } from 'primereact/radiobutton';

import CircularLoaderWithText from '../../../components/CircularLoaderWithText';
import StyledJsonPretty from '../../../components/StyledJsonPretty';

import './index.css';
import { invokeWGSTNWorkflow } from './aws';
import { FastqRow, FASTQPairingPayload, usePortalSubjectParingAPI } from '../../../api/pairing';
import SubjectMetadataTable from '../SubjectMetadata';

type Props = { subjectId: string };
export default function SubjectWGSTNLaunch({ subjectId }: Props) {
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState<boolean>(false);
  const [isLaunch, setIsLaunch] = useState<boolean>(false);

  const [input, setInput] = useState<FASTQPairingPayload | null>(null);

  const workflowTriggerRes = useQuery(
    ['wgs-tn-invoke', input],
    async () => {
      if (input) await invokeWGSTNWorkflow(input);
    },
    {
      enabled: isLaunch && !!input,
    }
  );

  const pairingOptions = usePortalSubjectParingAPI({
    apiConfig: {
      header: { 'Content-Type': 'application/json' },
      body: [subjectId],
    },
  });

  // Setting default value for obvious options (Only 1 options available)
  useEffect(() => {
    if (pairingOptions.data?.length == 1) {
      setInput(pairingOptions.data[0]);
    }
  }, [pairingOptions.data]);

  // ERROR components return
  if (pairingOptions.isError) {
    return (
      <div className='mt-3 text-center'>
        <Button
          icon='pi pi-times'
          className='p-button-rounded p-button-danger bg-red-500 cursor-auto'
          aria-label='Cancel'
        />
        <div className='mt-3'>{'Unable to load FASTQs from API'}</div>
      </div>
    );
  }
  if (workflowTriggerRes.isError) {
    return (
      <div className='mt-3 text-center'>
        <Button
          icon='pi pi-times'
          className='p-button-rounded p-button-danger bg-red-500 cursor-auto'
          aria-label='Cancel'
        />
        <div className='mt-3'>{`Error launching WGS T/N workflow`}</div>
        <pre className='mt-3 p-3 text-left overflow-auto surface-200 '>
          {JSON.stringify(workflowTriggerRes.error, null, 2)}
        </pre>
      </div>
    );
  }

  // LOADING components return
  if (pairingOptions.isLoading) {
    return <CircularLoaderWithText text={`Fetching FASTQs for ${subjectId}`} />;
  }
  if (workflowTriggerRes.isLoading) {
    return (
      <CircularLoaderWithText
        text={`Launching Whole-Genome Sequencing Tumor-Normal (${subjectId})`}
      />
    );
  }

  // SUCCESS component
  if (workflowTriggerRes.isSuccess) {
    return (
      <div className='mt-3 text-center'>
        <Button
          icon='pi pi-check'
          className='p-button-rounded p-button-success bg-green-700 cursor-auto'
          aria-label='Cancel'
        />
        <div className='mt-3'>{`Successfully launched WGS T/N workflow! Check Slack for updates.`}</div>
        <pre className='mt-3'>{`You could navigate away from this page.`}</pre>
      </div>
    );
  }

  return (
    <div>
      <div className='text-2xl font-medium mb-4'>
        {subjectId} - Whole-Genome Sequencing Tumor-Normal (WGS T/N) Launch
      </div>
      <h5 className='mt-0'>Description</h5>
      <div>
        {`This page should be able to launch the WGS T/N workflow for SubjectId "${subjectId}". `}
        {`Please select relevant libraries for tumor and normal as well as other inputs if available. `}
        {`These inputs will construct the payload and invoke the lambda described at `}
        <a
          target={`_blank`}
          href='https://github.com/umccr/data-portal-apis/blob/dev/docs/pipeline/automation/tumor_normal.md'>
          data-portal-pipeline-t/n-docs
        </a>
        {`.`}
      </div>

      <SubjectMetadataTable
        subjectId={subjectId}
        queryStringParameter={{
          workflow: ['clinical', 'research'],
          phenotype: ['tumor', 'normal'],
          type: 'wgs',
        }}
      />

      <h5>Select Appropriate FASTQ Pairing</h5>
      {(pairingOptions.data?.length == 0 || !pairingOptions.data) && (
        <div>No FASTQ Pairing Found</div>
      )}
      {pairingOptions.data &&
        pairingOptions.data.map((fastqRow, idx) => {
          let divClassName =
            'flex flex-row align-items-center mb-4 p-3 cursor-pointer border-round-xl border-solid border-1 border-300';

          if (input == fastqRow) divClassName += ` surface-400`;

          return (
            <div
              key={`t/n-fastq-options-${idx}`}
              className={divClassName}
              onClick={() => setInput(fastqRow)}>
              <RadioButton className='mr-3 ' checked={input == fastqRow} />
              <div className='flex flex-column overflow-hidden gap-4'>
                <DisplayFastqListRow
                  title={`Normal FASTQ List Row`}
                  fastqListRow={fastqRow.fastq_list_rows}
                />
                <DisplayFastqListRow
                  title={`Tumor FASTQ List Row`}
                  fastqListRow={fastqRow.tumor_fastq_list_rows}
                />
              </div>
            </div>
          );
        })}

      {input ? (
        <>
          <h5>Subject Id</h5>
          <div className='w-full' style={{ cursor: 'not-allowed' }}>
            <InputText className='w-full' type='text' disabled value={input.subject_id} />
          </div>

          <h5>Somatic Sample Name (Tumor Library Id)</h5>
          <div className='w-full' style={{ cursor: 'not-allowed' }}>
            <InputText className='w-full' type='text' disabled value={input.sample_name_somatic} />
          </div>

          <h5>Germline Sample Name (Normal Library Id)</h5>
          <div className='w-full' style={{ cursor: 'not-allowed' }}>
            <InputText className='w-full' type='text' disabled value={input.sample_name_germline} />
          </div>

          <h5>Somatic Output File Prefix (Tumor Sample Id)</h5>
          <div className='w-full' style={{ cursor: 'not-allowed' }}>
            <InputText
              className='w-full'
              type='text'
              disabled
              value={input.output_file_prefix_somatic}
            />
          </div>

          <h5>Germline Output File Prefix (Normal Sample Id)</h5>
          <div className='w-full' style={{ cursor: 'not-allowed' }}>
            <InputText
              className='w-full'
              type='text'
              disabled
              value={input.output_file_prefix_germline}
            />
          </div>

          <h5>Somatic Output Directory (tumorLibraryId_normalLibraryId)</h5>
          <div className='w-full' style={{ cursor: 'not-allowed' }}>
            <InputText
              className='w-full'
              type='text'
              disabled
              value={input.output_directory_somatic}
            />
          </div>

          <h5>Germline Output Directory (Normal Library Id)</h5>
          <div className='w-full' style={{ cursor: 'not-allowed' }}>
            <InputText
              className='w-full'
              type='text'
              disabled
              value={input.output_directory_germline}
            />
          </div>

          <div className='w-full mt-5 text-center'>
            <Dialog
              id='wgs-confirmation-dialog'
              style={{ width: '75vw' }}
              visible={isConfirmDialogOpen}
              onHide={() => setIsConfirmDialogOpen(false)}
              draggable={false}
              footer={
                <span>
                  <Button
                    label='Cancel'
                    className='p-button-secondary'
                    onClick={() => setIsConfirmDialogOpen(false)}
                  />
                  <Button
                    label='Launch'
                    className='p-button-raised p-button-primary'
                    onClick={() => {
                      setIsLaunch(true);
                      setIsConfirmDialogOpen(false);
                    }}
                  />
                </span>
              }
              header='Whole-Genome Sequencing Tumor-Normal (WGS T/N) Launch Confirmation'
              headerClassName='border-bottom-1'
              contentClassName='w-full'>
              <div className='w-full'>
                <div>Please confirm the following JSON before launching the workflow.</div>
                <br />
                <div>
                  You can check the details on{' '}
                  <a
                    target={`_blank`}
                    href='https://github.com/umccr/data-portal-apis/blob/dev/docs/pipeline/automation/tumor_normal.md'>
                    https://github.com/umccr/data-portal-apis/blob/dev/docs/pipeline/automation/tumor_normal.md
                  </a>
                  .
                </div>
                <StyledJsonPretty
                  wrapperClassName='border-solid border-round-md p-3 mt-3'
                  data={input}
                />
              </div>
            </Dialog>
            <Button
              className='p-button-info p-button-raised bg-primary w-24rem'
              disabled={!input}
              onClick={() => setIsConfirmDialogOpen(true)}
              label='Next'
              iconPos='right'
              icon='pi pi-chevron-right'
            />
          </div>
        </>
      ) : (
        <></>
      )}
    </div>
  );
}

/**
 * Helper Components
 */

type DisplayFastqListRowProps = { title?: string; fastqListRow?: FastqRow[] };
const DisplayFastqListRow = ({ title, fastqListRow = [] }: DisplayFastqListRowProps) => {
  const fastqHeaderToDisplay: string[] = ['rgid', 'rgsm', 'rglb', 'lane', 'read_1', 'read_2'];

  const flatFastqRow: Record<string, string | number>[] = fastqListRow.map((val) => ({
    ...val,
    read_1: val.read_1.location,
    read_2: val.read_2.location,
  }));

  return (
    <div className='w-full'>
      <div className='font-bold pb-2'>{title}</div>
      <DataTable autoLayout responsiveLayout='scroll' value={flatFastqRow}>
        {fastqHeaderToDisplay.map((header, idx) => (
          <Column
            key={idx}
            field={header}
            header={header.replaceAll('_', ' ')}
            headerClassName='uppercase surface-100'
            bodyClassName='font-normal'
          />
        ))}
      </DataTable>
    </div>
  );
};
