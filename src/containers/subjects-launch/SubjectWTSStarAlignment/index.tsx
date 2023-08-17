import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { isEqual } from 'lodash';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { RadioButton } from 'primereact/radiobutton';

import CircularLoaderWithText from '../../../components/CircularLoaderWithText';

import { invokeWTSSAWorkflow, StarAlignmentPayload } from './aws';
import { usePortalSubjectDataAPI } from '../../../api/subject';
import { FastqRow, usePortalFastqAPI } from '../../../api/fastq';
import { usePortalMetadataAPI } from '../../../api/metadata';
import JSONToTable from '../../../components/JSONToTable';
import ConfirmationDialog from '../utils/ConfirmationDialog';

const metadataHeaderToDisplay: string[] = [
  'subject_id',
  'sample_id',
  'library_id',
  'external_subject_id',
  'external_sample_id',
  'phenotype',
  'type',
  'assay',
  'source',
  'project_name',
  'project_owner',
];

type Props = { subjectId: string };
export default function SubjectLaunchWTSStarAlignment({ subjectId }: Props) {
  const [input, setInput] = useState<StarAlignmentPayload | null>(null);

  // Find out the associated LibraryId
  const {
    isLoading: isLoadingSubjectData,
    isError: isErrorSubjectData,
    data: subjectData,
  } = usePortalSubjectDataAPI(subjectId);
  const listOfLibrary = subjectData?.lims
    .filter((lims) => lims.type == 'WTS')
    .map((o) => o.library_id);

  // Find the related FASTQs
  const {
    isLoading: isLoadingFastqData,
    isError: isErrorFastqData,
    data: fastqData,
  } = usePortalFastqAPI({
    apiConfig: {
      queryStringParameters: {
        rowsPerPage: 1000,
        rglb: listOfLibrary,
      },
    },
    useQueryOption: {
      enabled: !!listOfLibrary,
    },
  });

  // The function to trigger the workflow
  const {
    isLoading: isLoadingMetadata,
    isError: isErrorMetadata,
    data: metadata,
  } = usePortalMetadataAPI({
    apiConfig: {
      queryStringParameters: {
        rowsPerPage: 1000,
        subject_id: subjectId,
      },
    },
  });

  const workflowTriggerRes = useMutation(
    ['wts-sa-invoke', input],
    async (input: Record<string, string | number>) => {
      await invokeWTSSAWorkflow(input as StarAlignmentPayload);
    },
    {}
  );

  // LOADING components return
  const isLoading = isLoadingMetadata || isLoadingFastqData || isLoadingSubjectData;
  if (isLoading) {
    return <CircularLoaderWithText text={`Fetching FASTQs for ${subjectId}`} />;
  }
  if (workflowTriggerRes.isLoading) {
    return (
      <CircularLoaderWithText
        text={`Launching Whole-Genome Sequencing Tumor-Normal (${subjectId})`}
      />
    );
  }

  // ERROR components return
  const isLoadingInputError = isErrorMetadata || isErrorFastqData || isErrorSubjectData;
  if (isLoadingInputError) {
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
        <div className='mt-3'>{`Error launching WTS Star Alignment workflow`}</div>
        <pre className='mt-3 p-3 text-left overflow-auto surface-200 '>
          {JSON.stringify(workflowTriggerRes.error, null, 2)}
        </pre>
      </div>
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
        <div className='mt-3'>{`Successfully launched WTS Star Alignment workflow! Check Slack for updates.`}</div>
        <pre className='mt-3'>{`You could navigate away from this page.`}</pre>
      </div>
    );
  }

  return (
    <div>
      <div className='text-2xl font-medium mb-4'>
        {subjectId} - Whole Transcriptome Sequencing Star Alignment Launch
      </div>
      <h5 className='mt-0'>Description</h5>
      <div>
        {`This page should be able to launch the WTS Star Alignment workflow for SubjectId "${subjectId}". `}
        {`Please check/select relevant configuration for the inputs. `}
        {`These inputs will construct the payload and invoke the lambda described at `}
        <a target={`_blank`} href='https://github.com/umccr/nextflow-stack#star-align-nf'>
          umccr/nextflow-stack
        </a>
        {`.`}
      </div>

      <h5>Lab Metadata Table</h5>
      <div className='mb-3'>{`This is just an additional metadata table to help you select relevant FASTQs.`}</div>
      <div className='w-full'>
        <DataTable
          className='border-1 border-200'
          size='small'
          showGridlines
          autoLayout
          responsiveLayout='scroll'
          value={metadata?.results ?? []}
          dataKey='id'>
          {metadataHeaderToDisplay.map((header, idx) => (
            <Column
              key={idx}
              field={header}
              header={header.replaceAll('_', ' ')}
              headerClassName='uppercase surface-100'
            />
          ))}
        </DataTable>
      </div>

      <h5>Select the FASTQ for the Star Align input</h5>
      {(fastqData?.pagination.count == 0 || !fastqData) && <div>No FASTQ Pairing Found</div>}
      {fastqData &&
        fastqData.results.map((data: FastqRow, idx) => {
          const convertedFastq = convertFastqToStarAlignPayload({ subjectId, ...data });

          let divClassName =
            'flex flex-row align-items-center mb-4 p-3 cursor-pointer border-round-xl border-solid border-1 border-300';

          if (isEqual(input, convertedFastq)) divClassName += ` surface-400`;

          return (
            <div
              key={`t/n-fastq-options-${idx}`}
              className={divClassName}
              onClick={() => setInput(convertedFastq)}>
              <RadioButton className='mr-3 ' checked={isEqual(input, convertedFastq)} />
              <div className='flex flex-column overflow-hidden gap-4'>
                <JSONToTable objData={convertedFastq} />
              </div>
            </div>
          );
        })}

      {input && (
        <>
          <div className='w-full mt-5 text-center'>
            <ConfirmationDialog
              header='Oncoanalyser Launch Confirmation'
              payload={input}
              onConfirm={workflowTriggerRes.mutate}
              descriptionElement={
                <div className='w-full'>
                  <div>Please confirm the following JSON before launching the workflow.</div>
                  <br />
                  <div>
                    You can check the details on{' '}
                    <a target={`_blank`} href='https://github.com/umccr/nextflow-stack/pull/29'>
                      umccr/nextflow-stack (dev)
                    </a>
                    .
                  </div>
                </div>
              }
            />
          </div>
        </>
      )}
    </div>
  );
}

const convertFastqToStarAlignPayload = (
  fastq: FastqRow & { subjectId: string }
): StarAlignmentPayload => {
  return {
    subject_id: fastq.subjectId,
    sample_id: fastq.rgsm,
    library_id: fastq.rglb,
    fastq_fwd: fastq.read_1,
    fastq_rev: fastq.read_2,
  };
};
