import React, { useEffect, useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';

import { useToastContext } from '../../../providers/ToastProvider';
import { usePortalFastqAPI, FastqRow as APIFastqRow } from '../../../api/fastq';
import CircularLoaderWithText from '../../../components/CircularLoaderWithText';
import StyledJsonPretty from '../../../components/StyledJsonPretty';

import './index.css';
import { usePortalMetadataAPI } from '../../../api/metadata';

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
const fastqHeaderToDisplay: string[] = [
  'id',
  'rgid',
  'rgsm',
  'rglb',
  'lane',
  'read_1',
  'read_2',
  'sequence_run',
];
/**
 * T/N Lambda Input
 */
type ReadFiles = {
  class: 'File';
  location: string;
};

type FastqRow = {
  rgid: string;
  rgsm: string;
  rglb: string;
  lane: number;
  read_1: ReadFiles;
  read_2: ReadFiles;
};

type Payload = {
  subject_id: string;
  sample_name: string;
  output_file_prefix: string;
  output_directory: string;
  normalFastqRow: FastqRow[];
  tumorFastqRow: FastqRow[];
};

type Input = {
  subjectId: string;
  sampleName: string;
  outputFilePrefix: string;
  outputDirectory: string;
  normalFastqRow: APIFastqRow | null;
  tumorFastqRow: APIFastqRow[];
};

type Props = { subjectId: string };
export default function SubjectWGSTNLaunch({ subjectId }: Props) {
  const { toastShow } = useToastContext();

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState<boolean>(false);

  const [input, setInput] = useState<Input>({
    subjectId: subjectId,
    sampleName: '',
    outputFilePrefix: '',
    outputDirectory: '',
    normalFastqRow: null,
    tumorFastqRow: [],
  });

  const normalFastqUseQueryRes = usePortalFastqAPI({
    additionalPath: '?workflow=clinical&workflow=research',
    apiConfig: {
      queryStringParameters: {
        subject_id: subjectId,
        type: 'wgs',
        phenotype: 'normal',
      },
    },
  });

  const tumorFastqUseQueryRes = usePortalFastqAPI({
    additionalPath: '?workflow=clinical&workflow=research',
    apiConfig: {
      queryStringParameters: {
        subject_id: subjectId,
        type: 'wgs',
        phenotype: 'tumor',
      },
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

  // Setting up defaults for straight forward data (results only 1)
  useEffect(() => {
    if (input.normalFastqRow && input.tumorFastqRow.length != 0) {
      const normalFastq = input.normalFastqRow;
      const tumorFastq = input.tumorFastqRow[0];
      setInput((prev) => ({
        ...prev,
        sampleName: tumorFastq.rglb,
        outputFilePrefix: tumorFastq.rgsm,
        outputDirectory: `${tumorFastq.rglb}_${normalFastq.rglb}`,
      }));
    }
  }, [input.normalFastqRow, input.tumorFastqRow]);

  // Setting up defaults for straight forward data (results only 1)
  useEffect(() => {
    const normalFastqRowList = normalFastqUseQueryRes.data?.results;
    if (normalFastqRowList?.length == 1)
      setInput((prev) => ({ ...prev, normalFastqRow: normalFastqRowList[0] }));

    const tumorFastqRowList = tumorFastqUseQueryRes.data?.results;
    if (tumorFastqRowList?.length == 1)
      setInput((prev) => ({ ...prev, tumorFastqRow: tumorFastqRowList }));
  }, [normalFastqUseQueryRes.data, tumorFastqUseQueryRes.data]);

  const isError =
    normalFastqUseQueryRes.isError || tumorFastqUseQueryRes.isError || metadataUseQueryRes.isError;
  useEffect(() => {
    if (isError) {
      toastShow({
        severity: 'error',
        summary: 'Something went wrong!',
        detail: 'Unable to load presignedUrl content.',
        sticky: true,
      });
    }
  }, [isError]);

  const isLoading =
    normalFastqUseQueryRes.isLoading ||
    tumorFastqUseQueryRes.isLoading ||
    metadataUseQueryRes.isLoading;
  if (isLoading) {
    return <CircularLoaderWithText text={`Fetching available FASTQ for "${subjectId}"`} />;
  }

  return (
    <div>
      <div className='text-2xl font-medium mb-4'>
        {subjectId} - Whole-Genome Sequencing Tumor-Normal (WGS T/N) Launch
      </div>

      <div className='surface-200 border-1 border-round-md p-3'>
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
      </div>

      <h5>Subject Id</h5>
      <div className='w-full' style={{ cursor: 'not-allowed' }}>
        <InputText className='w-full' type='text' disabled value={input.subjectId} />
      </div>

      <h5>Select Normal Fastq List Row</h5>
      <div className='w-full'>
        <DataTable
          autoLayout
          responsiveLayout='scroll'
          value={normalFastqUseQueryRes.data?.results}
          selection={input.normalFastqRow}
          onSelectionChange={(e) => setInput((prev) => ({ ...prev, normalFastqRow: e.value }))}
          dataKey='id'>
          <Column selectionMode='single' headerClassName='capitalize surface-100' />
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

      <h5>Select Tumor Fastq List Rows</h5>
      <div className='fastqTable w-full'>
        <DataTable
          autoLayout
          responsiveLayout='scroll'
          value={tumorFastqUseQueryRes.data?.results}
          selection={input.tumorFastqRow}
          onSelectionChange={(e) => setInput((prev) => ({ ...prev, tumorFastqRow: e.value }))}
          dataKey='id'>
          <Column
            selectionMode='multiple'
            headerClassName='capitalize surface-100'
            bodyClassName='shadow-none'
          />
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

      {input.normalFastqRow && input.tumorFastqRow.length ? (
        <>
          <h5>Sample Name (Tumor Library Id)</h5>
          <Dropdown
            className='w-full'
            options={input.tumorFastqRow.map((tf) => tf.rglb)}
            onChange={(e) => setInput((prev) => ({ ...prev, sampleName: e.value }))}
            value={input.sampleName}
          />

          <h5>Output File Prefix (Tumor Sample Id)</h5>
          <Dropdown
            className='w-full'
            options={input.tumorFastqRow.map((tf) => tf.rgsm)}
            onChange={(e) => setInput((prev) => ({ ...prev, outputFilePrefix: e.value }))}
            value={input.outputFilePrefix}
          />

          <h5>Output Directory (tumorLibraryId_normalLibraryId)</h5>
          <Dropdown
            className='w-full'
            options={input.tumorFastqRow.map((tf) => `${tf.rglb}_${input.normalFastqRow?.rglb}`)}
            onChange={(e) => setInput((prev) => ({ ...prev, outputDirectory: e.value }))}
            value={input.outputDirectory}
          />

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
                  <Button label='Launch' className='p-button-raised p-button-danger' />
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
                  data={convertInputToPayload(input)}
                />
              </div>
            </Dialog>
            <Button
              className='p-button-info p-button-rounded p-button-outlined'
              disabled={!isInputValid(input)}
              onClick={() => setIsConfirmDialogOpen(true)}
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
 * Helper functions
 */
const convertInputToPayload = (input: Input): Payload => ({
  subject_id: input.subjectId,
  sample_name: input.sampleName,
  output_file_prefix: input.outputFilePrefix,
  output_directory: input.outputDirectory,
  normalFastqRow: input.normalFastqRow
    ? [
        {
          rgid: input.normalFastqRow.rgid,
          rgsm: input.normalFastqRow.rgsm,
          rglb: input.normalFastqRow.rglb,
          lane: input.normalFastqRow.lane,
          read_1: {
            class: 'File',
            location: input.normalFastqRow.read_1,
          },
          read_2: {
            class: 'File',
            location: input.normalFastqRow.read_2,
          },
        },
      ]
    : [],
  tumorFastqRow: input.tumorFastqRow.map((tumor) => ({
    rgid: tumor.rgid,
    rgsm: tumor.rgsm,
    rglb: tumor.rglb,
    lane: tumor.lane,
    read_1: {
      class: 'File',
      location: tumor.read_1,
    },
    read_2: {
      class: 'File',
      location: tumor.read_2,
    },
  })),
});

const isInputValid = (input: Input): boolean => {
  if (!input.subjectId) {
    return false;
  }
  if (!input.sampleName) {
    return false;
  }
  if (!input.outputFilePrefix) {
    return false;
  }
  if (!input.outputDirectory) {
    return false;
  }
  if (!input.normalFastqRow) {
    return false;
  }
  if (input.tumorFastqRow.length == 0) {
    return false;
  }
  return true;
};
