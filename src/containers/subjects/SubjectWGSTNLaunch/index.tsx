import React, { useEffect, useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { ConfirmDialog } from 'primereact/confirmdialog';

import { useToastContext } from '../../../providers/ToastProvider';
import { usePortalFastqAPI, FastqRow as APIFastqRow } from '../../../api/fastq';
import CircularLoaderWithText from '../../../components/CircularLoaderWithText';
import StyledJsonPretty from '../../../components/StyledJsonPretty';

import './index.css';
import { usePortalMetadataAPI } from '../../../api/metadata';

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
  normalLibraryId: string;
  tumorLibraryId: string;
  tumorSampleId: string;
  normalFastqRow: APIFastqRow | null;
  tumorFastqRow: APIFastqRow | null;
};

type Props = { subjectId: string };
export default function SubjectWGSTNLaunch({ subjectId }: Props) {
  const { toastShow } = useToastContext();

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState<boolean>(false);

  const [input, setInput] = useState<Input>({
    subjectId: subjectId,
    normalLibraryId: '',
    tumorLibraryId: '',
    tumorSampleId: '',
    normalFastqRow: null,
    tumorFastqRow: null,
  });
  const handleFastqListRowChange = (v: APIFastqRow) =>
    setInput((prev) => ({ ...prev, normalLibraryId: v.rglb, normalFastqRow: v }));
  const handleTumorFastqListRowChange = (v: APIFastqRow) =>
    setInput((prev) => ({
      ...prev,
      tumorLibraryId: v.rglb,
      tumorSampleId: v.rgsm,
      tumorFastqRow: v,
    }));

  const fastqUseQueryRes = usePortalFastqAPI({
    additionalPath: '?workflow=clinical&workflow=research&phenotype=tumor&phenotype=normal',
    apiConfig: {
      queryStringParameters: {
        subject_id: subjectId,
        type: 'wgs',
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

  useEffect(() => {
    if (fastqUseQueryRes.isError || metadataUseQueryRes.isError) {
      toastShow({
        severity: 'error',
        summary: 'Something went wrong!',
        detail: 'Unable to load presignedUrl content.',
        sticky: true,
      });
    }
  }, [fastqUseQueryRes.isError, metadataUseQueryRes.isError]);

  if (fastqUseQueryRes.isLoading || metadataUseQueryRes.isLoading) {
    return <CircularLoaderWithText text={`Fetching available FASTQ for "${subjectId}"`} />;
  }

  const payload = convertInputToPayload(input);

  return (
    <div>
      <div className='text-2xl font-medium mb-4'>
        {subjectId} - Whole-Genome Sequencing Tumor-Normal (WGS T/N) Launch
      </div>

      <h5>Description</h5>
      <div>
        This launch should able to construct payload that would be sufficient to trigger WGS T/N
        workflow. This details of the payload could be found on{' '}
        <a
          target={`_blank`}
          href='https://github.com/umccr/data-portal-apis/blob/dev/docs/pipeline/automation/tumor_normal.md'>
          https://github.com/umccr/data-portal-apis/blob/dev/docs/pipeline/automation/tumor_normal.md
        </a>
        .
        <br /> <br />
        Please select the intended Normal Fastq and Tumor Fastq row to initiate the workflow. Fastq
        displayed are filtered on libraries that has Tumor/Normal phenotype, clinical/research
        workflow, a WGS type and the relevant subjectId.
      </div>

      <h5>Subject Id</h5>
      <div className='w-full' style={{ cursor: 'not-allowed' }}>
        <InputText className='w-full' type='text' disabled value={payload.subject_id} />
      </div>

      <h5>Sample Name</h5>
      <div className='w-full' style={{ cursor: 'not-allowed' }}>
        <InputText className='w-full' type='text' disabled value={payload.sample_name} />
      </div>

      <h5>Output File Prefix</h5>
      <div className='w-full' style={{ cursor: 'not-allowed' }}>
        <InputText className='w-full' type='text' disabled value={payload.output_file_prefix} />
      </div>

      <h5>Output Directory</h5>
      <div className='w-full' style={{ cursor: 'not-allowed' }}>
        <InputText className='w-full' type='text' disabled value={payload.output_directory} />
      </div>

      <h5>Lab Metadata Table</h5>
      <div className='w-full'>
        <DataTable
          autoLayout
          responsiveLayout='scroll'
          value={metadataUseQueryRes.data?.results ?? []}
          dataKey='id'>
          <Column field='id' header='ID' />
          <Column field='sample_name' header='sample_name' />
          <Column field='sample_id' header='sample_id' />
          <Column field='external_sample_id' header='external_sample_id' />
          <Column field='subject_id' header='subject_id' />
          <Column field='external_subject_id' header='external_subject_id' />
          <Column field='phenotype' header='phenotype' />
          <Column field='workflow' header='workflow' />
          <Column field='coverage' header='coverage' />
          <Column field='project_owner' header='project_owner' />
          <Column field='coverage' header='coverage' />
          <Column field='override_cycles' header='override_cycles' />
          <Column field='experiment_id' header='experiment_id' />
          <Column field='truseqindex' header='project_owner' />
        </DataTable>
      </div>

      <h5>Normal Fastq List Rows</h5>
      <div className='w-full' style={{ cursor: 'not-allowed' }}>
        <SelectableFastqTable
          options={fastqUseQueryRes.data?.results || []}
          selected={input.normalFastqRow}
          handleChange={(v: APIFastqRow) => handleFastqListRowChange(v)}
        />
      </div>

      <h5>Tumor Fastq List Rows</h5>
      <div className='w-full'>
        <SelectableFastqTable
          options={fastqUseQueryRes.data?.results || []}
          selected={input.tumorFastqRow}
          handleChange={(v: APIFastqRow) => handleTumorFastqListRowChange(v)}
        />
      </div>

      <div className='w-full mt-5 text-right '>
        <ConfirmDialog
          id='wgs-confirmation-dialog'
          style={{ width: '75vw' }}
          visible={isConfirmDialogOpen}
          onHide={() => setIsConfirmDialogOpen(false)}
          draggable={false}
          // Accept or Reject Buttons
          acceptClassName='p-button-danger'
          acceptLabel='Launch'
          rejectLabel='Cancel'
          // Header
          header='Whole-Genome Sequencing Tumor-Normal (WGS T/N) Launch Confirmation'
          headerClassName='border-bottom-1'
          // Content
          contentClassName='w-full'
          message={
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
                data={payload}
              />
            </div>
          }
        />
        <Button
          className='p-button-info'
          disabled={!input.tumorFastqRow || !input.normalFastqRow}
          onClick={() => setIsConfirmDialogOpen(true)}
          icon='pi pi-check'
          label='Confirm'
        />
      </div>
    </div>
  );
}

/**
 * Helper functions
 */
type SelectableFastqTableProp = {
  options: APIFastqRow[];
  selected: APIFastqRow | null;
  handleChange: (fastqList: APIFastqRow) => void;
};
const SelectableFastqTable = ({ options, selected, handleChange }: SelectableFastqTableProp) => {
  return (
    <DataTable
      autoLayout
      responsiveLayout='scroll'
      selectionMode='single'
      value={options}
      selection={selected}
      onSelectionChange={(e) => handleChange(e.value)}
      dataKey='id'>
      <Column field='id' header='ID' />
      <Column field='rgid' header='RGID' />
      <Column field='rgsm' header='RGSM' />
      <Column field='rglb' header='RGLB' />
      <Column field='lane' header='LANE' />
      <Column field='read_1' header='READ_1' />
      <Column field='read_2' header='READ_2' />
      <Column field='sequence_run' header='SEQUENCE_RUN' />
    </DataTable>
  );
};

const convertInputToPayload = (input: Input): Payload => ({
  subject_id: input.subjectId,
  sample_name: input.tumorLibraryId,
  output_file_prefix: input.tumorSampleId,
  output_directory: `${input.tumorLibraryId}_${input.normalLibraryId}`,
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
  tumorFastqRow: input.tumorFastqRow
    ? [
        {
          rgid: input.tumorFastqRow.rgid,
          rgsm: input.tumorFastqRow.rgsm,
          rglb: input.tumorFastqRow.rglb,
          lane: input.tumorFastqRow.lane,
          read_1: {
            class: 'File',
            location: input.tumorFastqRow.read_1,
          },
          read_2: {
            class: 'File',
            location: input.tumorFastqRow.read_2,
          },
        },
      ]
    : [],
});
