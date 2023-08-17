import React, { useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { useMutation } from 'react-query';

import CircularLoaderWithText from '../../../components/CircularLoaderWithText';

import { AllOncoanalyserPayload, invokeOncoanalyserLambda } from './aws';
import { usePortalSubjectDataAPI } from '../../../api/subject';
import SubjectMetadataTable from '../SubjectMetadata';
import WGSDragenInput, { WGSInput } from './inputModes/WGSDragenInput';
import WTSStarAlignInput, { WTSInput } from './inputModes/WTSStarAlignInput';
import ConfirmationDialog from '../utils/ConfirmationDialog';

export enum OncoanalyserEnum {
  WGS = 'wgs',
  WTS = 'wts',
  WGTS = 'wgts',
  // WGTS_EXISTING_WGS = 'wgts_existing_wgs',
  // WGTS_EXISTING_WTS = 'wgts_existing_wts',
  // WGTS_EXISTING_BOTH = 'wgts_existing_both',
}

type Props = { subjectId: string };
export default function SubjectLaunchOncoanalyser({ subjectId }: Props) {
  const [oncoanalyserInputMode, setOncoanalyserInputMode] = useState<OncoanalyserEnum | null>(
    OncoanalyserEnum.WTS
  );

  const { isLoading: isLoadingSubject, data: subjectData } = usePortalSubjectDataAPI(subjectId);

  const [payload, setPayload] = useState<Record<string, string>>({});
  const onPayloadChange = (i: WGSInput | WTSInput) => {
    setPayload((p) => ({
      ...p,
      ...i,
    }));
  };

  const oncoanalyserTrigger = useMutation(
    ['oncoanalyser-invoke', subjectId, oncoanalyserInputMode, payload],
    async (input: Record<string, string | number>) => {
      await invokeOncoanalyserLambda(input as AllOncoanalyserPayload);
    },
    {}
  );

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
              onChange={(e) => {
                setOncoanalyserInputMode(e.value);
                setPayload({});
              }}
              options={Object.values(OncoanalyserEnum)}
              className='w-full'
            />
          </div>
          {oncoanalyserInputMode && (
            <>
              {[
                OncoanalyserEnum.WGS,
                OncoanalyserEnum.WGTS,
                // OncoanalyserEnum.WGTS_EXISTING_WTS,
              ].includes(oncoanalyserInputMode) && (
                <WGSDragenInput subjectData={subjectData} onWGSPayloadChange={onPayloadChange} />
              )}
              {[
                OncoanalyserEnum.WTS,
                OncoanalyserEnum.WGTS,
                // OncoanalyserEnum.WGTS_EXISTING_WGS,
              ].includes(oncoanalyserInputMode) && (
                <WTSStarAlignInput subjectData={subjectData} onWTSPayloadChange={onPayloadChange} />
              )}
            </>
          )}
          {payload && oncoanalyserInputMode && (
            <>
              <div className='w-full mt-5 text-center'>
                <ConfirmationDialog
                  header='Oncoanalyser Launch Confirmation'
                  payload={{ subject_id: subjectId, mode: oncoanalyserInputMode, ...payload }}
                  onConfirm={oncoanalyserTrigger.mutate}
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
          <b>{'[WIP] wgts_existing_wgs: '}</b>
          {'WTS (Star Alignment) with existing WGS Oncoanalyser output.'}
        </li>
        <li className='my-1'>
          <b>{'[WIP] wgts_existing_wts: '}</b>
          {'WGS with existing WTS Oncoanalyser output.'}
        </li>
        <li className='my-1'>
          <b>{'[WIP] wgts_existing_both: '}</b>
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
