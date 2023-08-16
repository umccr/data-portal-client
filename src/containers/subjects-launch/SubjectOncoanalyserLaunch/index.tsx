import React, { useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { useMutation, useQuery } from 'react-query';
import { isEqual } from 'lodash';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { RadioButton } from 'primereact/radiobutton';

import CircularLoaderWithText from '../../../components/CircularLoaderWithText';
import StyledJsonPretty from '../../../components/StyledJsonPretty';

import {
  invokeWTSSAWorkflow,
  OncoanalyserWGSPayload,
  OncoanalyserWTSPayload,
  OncoanalyserWGTSPayload,
  OncoanalyserWGTSExistingWGSPayload,
  OncoanalyserWGTSExistingWTSPayload,
  OncoanalyserWGTSExistingBothPayload,
} from './aws';
import { usePortalSubjectDataAPI } from '../../../api/subject';
import { FastqRow, usePortalFastqAPI } from '../../../api/fastq';
import { usePortalMetadataAPI } from '../../../api/metadata';
import JSONToTable from '../../../components/JSONToTable';
import SubjectMetadataTable from '../SubjectMetadata';
import { GDSRow } from '../../../api/gds';
import { isWGSOncoanalyserOutputExist } from './utils';
import OncoanalyserWGS, { WGSInput } from './inputModes/OncoanalyserWGS';

export enum OncoanalyserEnum {
  WGS = 'wgs',
  WTS = 'wts',
  WGTS = 'wgts',
  WGSTS_EXISTING_WGS = 'wgts_existing_wgs',
  WGSTS_EXISTING_WTS = 'wgts_existing_wts',
  WGTS_EXISTING_BOTH = 'wgts_existing_both',
}

type Props = { subjectId: string };
export default function SubjectLaunchOncoanalyser({ subjectId }: Props) {
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState<boolean>(false);

  const [oncoanalyserInputMode, setOncoanalyserInputMode] = useState<OncoanalyserEnum | null>(
    OncoanalyserEnum.WGS
  );

  const { isLoading: isLoadingSubject, data: subjectData } = usePortalSubjectDataAPI(subjectId);

  const [payload, setPayload] = useState<OncoanalyserWGSPayload | null>(null);
  const onPayloadChange = (p: WGSInput) => {
    setPayload({
      subject_id: subjectId,
      mode: 'wgs',
      ...p,
    });
  };

  return (
    <div>
      <div className='text-2xl font-medium mb-4'>{subjectId} - Oncoanalyser</div>
      <OncoanalyserDescription subjectId={subjectId} />
      <SubjectMetadataTable subjectId={subjectId} />
      {isLoadingSubject ? (
        <CircularLoaderWithText text={`Loading subject data`} />
      ) : !subjectData ? (
        <>No data found</>
      ) : (
        <>
          <h5>Oncoanalyser Mode</h5>
          <div className='w-full' style={{ cursor: 'not-allowed' }}>
            <Dropdown
              value={oncoanalyserInputMode}
              onChange={(e) => setOncoanalyserInputMode(e.value)}
              options={Object.values(OncoanalyserEnum)}
              className='w-full'
            />
          </div>

          {oncoanalyserInputMode == OncoanalyserEnum.WGS ? (
            <OncoanalyserWGS subjectData={subjectData} onWGSPayloadChange={onPayloadChange} />
          ) : (
            <></>
          )}

          {payload && (
            <>
              <div className='w-full mt-5 text-center'>
                <Dialog
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
                          // workflowTriggerRes.mutate(input);
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
                      <a target={`_blank`} href='https://github.com/umccr/nextflow-stack/pull/29'>
                        umccr/nextflow-stack (dev)
                      </a>
                      .
                    </div>
                    <StyledJsonPretty
                      wrapperClassName='border-solid border-round-md p-3 mt-3'
                      data={payload}
                    />
                  </div>
                </Dialog>
                <Button
                  className='p-button-info p-button-raised bg-primary w-24rem'
                  disabled={!payload}
                  onClick={() => setIsConfirmDialogOpen(true)}
                  label='Next'
                  iconPos='right'
                  icon='pi pi-chevron-right'
                />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

/**
 * Helper Component
 */
const OncoanalyserDescription = ({ subjectId }: { subjectId: string }) => (
  <>
    <h5 className='mt-0'>Description</h5>
    <div>
      {`This page should be able to launch the Oncoanalyser workflow for SubjectId "${subjectId}". 
        Oncoanalyser can be triggered with 6 modes/payloads depending on whether WTS (Star Alignment) 
        and WGS data are present, or if Oncoanalyser has run on each WTS/WGS individually. 
        The combination are described as follows:`}
      <ul className='list-disc block'>
        <li className='my-1'>
          <b>{'wgs: '}</b>
          {`WGS with no WTS (Star Alignment) output.`}
        </li>
        <li className='my-1'>
          <b>{'wts: '}</b>
          {'WTS (Star Alignment) with no WGS present.'}
        </li>
        <li className='my-1'>
          <b>{'wgts: '}</b>
          {'Both WGS and WTS (Star Alignment) data present.'}
        </li>
        <li className='my-1'>
          <b>{'wgts_existing_wgs: '}</b>
          {'WTS (Star Alignment) with existing WGS Oncoanalyser output.'}
        </li>
        <li className='my-1'>
          <b>{'wgts_existing_wts: '}</b>
          {'WGS with existing WTS Oncoanalyser output.'}
        </li>
        <li className='my-1'>
          <b>{'wgts_existing_both: '}</b>
          {'Both WGS and WTS Oncoanalyser output.'}
        </li>
      </ul>
      {`The following will interface will construct the relevant payload and invoke the Oncoanalyser lambda described at `}
      <a target={`_blank`} href='https://github.com/umccr/nextflow-stack#oncoanalyser'>
        umccr/nextflow-stack
      </a>
      {`.`}
      {`Please check/select relevant payloads for each combination before triggering.`}
    </div>
  </>
);
