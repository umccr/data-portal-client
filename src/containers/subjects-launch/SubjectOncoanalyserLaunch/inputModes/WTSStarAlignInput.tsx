import React, { useEffect, useState } from 'react';
import { SubjectApiRes } from '../../../../api/subject';
import { Dropdown } from 'primereact/dropdown';
import { isEqual } from 'lodash';
import { RadioButton } from 'primereact/radiobutton';
import { InputText } from 'primereact/inputtext';

export type WTSInput = {
  tumor_wts_sample_id: string;
  tumor_wts_library_id: string;
  tumor_wts_bam: string;
};

type Props = { subjectData: SubjectApiRes; onWTSPayloadChange: (p: WTSInput) => void };

export default function WTSStarAlignInput({ subjectData, onWTSPayloadChange }: Props) {
  const limsData = subjectData.lims.filter((v) => v.type == 'WTS');

  const wtsStarAlignData = subjectData.results.filter(
    (r) => r.key.includes('star-align-nf') && r.key.endsWith('.bam')
  );

  const [wtsInput, setWgsInput] = useState({
    tumor_wts_sample_id: limsData.length == 1 ? limsData[0].sample_id : '',
    tumor_wts_library_id: limsData.length == 1 ? limsData[0].library_id : '',
    tumor_wts_bam: wtsStarAlignData.length == 1 ? wtsStarAlignData[0].key : '',
  });
  useEffect(() => {
    onWTSPayloadChange(wtsInput);
  }, [wtsInput]);

  return (
    <div>
      <h5>Tumor WTS</h5>
      <div className='flex flex-wrap gap-3'>
        {limsData.map((d, idx) => {
          const isSelected = isEqual(
            {
              tumor_wts_sample_id: wtsInput.tumor_wts_sample_id,
              tumor_wts_library_id: wtsInput.tumor_wts_library_id,
            },
            {
              tumor_wts_sample_id: d.sample_id,
              tumor_wts_library_id: d.library_id,
            }
          );
          let divClassName =
            'flex align-items-center mb-4 p-3 cursor-pointer border-round-xl border-solid border-1 border-300';

          if (isSelected) {
            divClassName += ` surface-400`;
          }

          return (
            <div
              key={`t/n-fastq-options-${idx}`}
              className={divClassName}
              onClick={() =>
                setWgsInput((p) => ({
                  ...p,
                  tumor_wts_sample_id: d.sample_id,
                  tumor_wts_library_id: d.library_id,
                }))
              }>
              <RadioButton className='mr-3 ' checked={isSelected} />
              <div className='flex overflow-hidden gap-4'>
                <div>
                  <label className='block'>Sample Id</label>
                  <InputText value={d.sample_id} className='block' />
                </div>
                <div>
                  <label className='block'>Library Id</label>
                  <InputText value={d.library_id} className='block' />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div>
        <label className='block'>BAM Path</label>
        <Dropdown
          value={wtsInput.tumor_wts_bam}
          onChange={(e) => setWgsInput((p) => ({ ...p, tumor_wts_bam: e.value }))}
          options={wtsStarAlignData.map((v) => v.key)}
          className='w-full'
        />
      </div>
    </div>
  );
}
