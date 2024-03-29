import React, { useEffect, useState } from 'react';
import { SubjectApiRes } from '../../../../api/subject';
import { Dropdown } from 'primereact/dropdown';
import { isEqual } from 'lodash';
import { RadioButton } from 'primereact/radiobutton';
import { InputText } from 'primereact/inputtext';

export type WGSInput = {
  tumor_wgs_sample_id: string;
  tumor_wgs_library_id: string;
  tumor_wgs_bam: string;
  normal_wgs_sample_id: string;
  normal_wgs_library_id: string;
  normal_wgs_bam: string;
};

type Props = { subjectData: SubjectApiRes; onWGSPayloadChange: (p: WGSInput) => void };

export default function WGSDragenInput({ subjectData, onWGSPayloadChange }: Props) {
  const limsData = subjectData.lims.filter((v) => v.type == 'WGS');
  const tumorLims = limsData.filter((d) => d.phenotype == 'tumor');
  const normalLims = limsData.filter((d) => d.phenotype == 'normal');

  const gdsData = subjectData.results_gds.filter(
    (r) => r.path.includes('wgs_tumor_normal') && r.path.endsWith('.bam')
  );

  // Finding default value for bamPath
  const gdsTumor = gdsData.filter((d) => d.path.endsWith('tumor.bam'));
  const gdsNormal = gdsData.filter((d) => d.path.endsWith('normal.bam'));

  const [wgsInput, setWgsInput] = useState({
    tumor_wgs_sample_id: tumorLims.length == 1 ? tumorLims[0].sample_id : '',
    tumor_wgs_library_id: tumorLims.length == 1 ? tumorLims[0].library_id : '',
    tumor_wgs_bam: gdsTumor.length == 1 ? gdsTumor[0].path : '',
    normal_wgs_sample_id: normalLims.length == 1 ? normalLims[0].sample_id : '',
    normal_wgs_library_id: normalLims.length == 1 ? normalLims[0].library_id : '',
    normal_wgs_bam: gdsNormal.length == 1 ? gdsNormal[0].path : '',
  });
  useEffect(() => {
    onWGSPayloadChange(wgsInput);
  }, [wgsInput]);

  return (
    <div>
      <h5>Tumor WGS</h5>
      <div className='flex flex-wrap gap-3'>
        {tumorLims.map((d, idx) => {
          const isSelected = isEqual(
            {
              tumor_wgs_sample_id: wgsInput.tumor_wgs_sample_id,
              tumor_wgs_library_id: wgsInput.tumor_wgs_library_id,
            },
            {
              tumor_wgs_sample_id: d.sample_id,
              tumor_wgs_library_id: d.library_id,
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
                  tumor_wgs_sample_id: d.sample_id,
                  tumor_wgs_library_id: d.library_id,
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
          value={wgsInput.tumor_wgs_bam}
          onChange={(e) => setWgsInput((p) => ({ ...p, tumor_wgs_bam: e.value }))}
          options={gdsData.map((v) => v.path)}
          className='w-full'
        />
      </div>

      <h5>Normal WGS</h5>
      <div className='flex flex-wrap gap-3'>
        {normalLims.map((d, idx) => {
          const isSelected = isEqual(
            {
              normal_wgs_sample_id: wgsInput.normal_wgs_sample_id,
              normal_wgs_library_id: wgsInput.normal_wgs_library_id,
            },
            {
              normal_wgs_sample_id: d.sample_id,
              normal_wgs_library_id: d.library_id,
            }
          );
          let divClassName =
            'flex flex-row align-items-center mb-4 p-3 cursor-pointer border-round-xl border-solid border-1 border-300';

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
                  normal_wgs_sample_id: d.sample_id,
                  normal_wgs_library_id: d.library_id,
                }))
              }>
              <RadioButton className='mr-3 ' checked={isSelected} />
              <div className='flex flex-column overflow-hidden gap-4'>
                <div className='flex flex-row overflow-hidden gap-4'>
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
            </div>
          );
        })}
      </div>
      <div>
        <label className='block'>BAM Path</label>
        <Dropdown
          value={wgsInput.normal_wgs_bam}
          onChange={(e) => setWgsInput((p) => ({ ...p, normal_wgs_bam: e.value }))}
          options={gdsData.map((v) => v.path)}
          className='w-full'
        />
      </div>
    </div>
  );
}
