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
import { usePortalMetadataAPI } from '../../../api/metadata';
import { invokeWGSTNWorkflow } from './aws';
import { FastqRow, FASTQPairingPayload, usePortalSubjectParingAPI } from '../../../api/pairing';

const metadataHeaderToDisplay: string[] = [
  'subject_id',
  'sample_id',
  'library_id',
  'external_subject_id',
  'external_sample_id',
  'type',
  'phenotype',
  'project_name',
];

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

  const metadataUseQueryRes = usePortalMetadataAPI({
    additionalPath: '?workflow=clinical&workflow=research&phenotype=tumor&phenotype=normal',
    apiConfig: {
      queryStringParameters: {
        subject_id: subjectId,
        type: 'wgs',
      },
    },
  });

  // Setting default value for obvious options (Only 1 options available)
  useEffect(() => {
    if (pairingOptions.data?.length == 1) {
      setInput(pairingOptions.data[0]);
    }
  }, [pairingOptions.data]);

  // ERROR components return
  if (pairingOptions.isError || metadataUseQueryRes.isError) {
    return (
      <div className='mt-3 text-center'>
        <Button
          icon='pi pi-times'
          className='p-button-rounded p-button-danger bg-red-500 cursor-auto'
          aria-label='Cancel'
        />
        <div className='mt-3'>{'Unable to load FASTQ row from API.'}</div>
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
        <div className='mt-3'>{`Something went wrong on launching WGS T/N workflow!`}</div>
        <pre className='mt-3 p-3 text-left overflow-auto surface-200 '>
          {JSON.stringify(workflowTriggerRes.error, null, 2)}
        </pre>
      </div>
    );
  }

  // LOADING components return
  if (pairingOptions.isLoading || metadataUseQueryRes.isLoading) {
    return <CircularLoaderWithText text={`Fetching available FASTQ (${subjectId})`} />;
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
        <div className='mt-3'>{`Successfully launch WGS T/N workflow! Check Slack for updates.`}</div>
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
        {`This page should launch should able to launch WGS T/N workflow for Subject Id "${subjectId}". `}
        {`Please select relevant libraries for tumor and normal as well as other inputs if available. `}
        {`These inputs will construct payload and invoke lambda describe at `}
        <a
          target={`_blank`}
          href='https://github.com/umccr/data-portal-apis/blob/dev/docs/pipeline/automation/tumor_normal.md'>
          data-portal-pipeline-t/n-docs
        </a>
        {`.`}
      </div>

      <h5>Lab Metadata Table</h5>
      <div className='mb-3'>{`This is just an additional metadata table to help you to select relevant FASTQ.`}</div>
      <div className='w-full'>
        <DataTable
          className='border-1 border-200'
          size='small'
          showGridlines
          autoLayout
          responsiveLayout='scroll'
          value={metadataUseQueryRes.data?.results ?? []}
          dataKey='id'>
          {metadataHeaderToDisplay.map((header, idx) => (
            <Column
              key={idx}
              field={header}
              header={header.replaceAll('_', ' ')}
              headerClassName='capitalize surface-100'
            />
          ))}
        </DataTable>
      </div>

      <h5>Select Appropriate FASTQ Pairing</h5>
      {(pairingOptions.data?.length == 0 || !pairingOptions.data) && (
        <div>No FASTQ Pairing Found</div>
      )}
      {pairingOptions.data &&
        pairingOptions.data.map((fastqRow, idx) => {
          let divClassName =
            'flex flex-row align-items-center mb-4 p-3 cursor-pointer border-round-xl border-solid border-1 border-300';

          if (input == fastqRow) divClassName += ` surface-200`;

          return (
            <div
              key={`t/n-fastq-options-${idx}`}
              className={divClassName}
              onClick={() => setInput(fastqRow)}>
              <RadioButton className='mr-3 ' checked={input == fastqRow} />
              <div className='flex flex-column overflow-hidden gap-4'>
                <DisplayFastqListRow
                  title={`Normal Fastq List Row`}
                  fastqListRow={fastqRow.fastq_list_rows}
                />
                <DisplayFastqListRow
                  title={`Tumor Fastq List Row`}
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

          <h5>Sample Name (Tumor Library Id)</h5>
          <div className='w-full' style={{ cursor: 'not-allowed' }}>
            <InputText className='w-full' type='text' disabled value={input.sample_name} />
          </div>

          <h5>Output File Prefix (Tumor Sample Id)</h5>
          <div className='w-full' style={{ cursor: 'not-allowed' }}>
            <InputText className='w-full' type='text' disabled value={input.output_file_prefix} />
          </div>

          <h5>Output Directory (tumorLibraryId_normalLibraryId)</h5>
          <div className='w-full' style={{ cursor: 'not-allowed' }}>
            <InputText className='w-full' type='text' disabled value={input.output_directory} />
          </div>

          <div className='w-full mt-5 text-center '>
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
                    className='p-button-secondary p-button-text'
                    onClick={() => setIsConfirmDialogOpen(false)}
                  />
                  <Button
                    label='Launch'
                    className='p-button-raised p-button-danger'
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
              className='p-button-info p-button-raised bg-blue-800'
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
