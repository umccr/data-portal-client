import React, { useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';

type Props = { handleFilterChange: (newFilter: string) => void; currentFilter: string };

function DataSearchFilterButton({ currentFilter, handleFilterChange }: Props) {
  const [dropdownState, setDropdownState] = useState<string>(currentFilter);

  const handleInputChange = (e: { value: string }) => {
    const newVal = e.value;
    setDropdownState(newVal);

    // The line belows allow user to skip the search button when selecting default regex suggested
    if (isDefaultRegex(newVal)) handleFilterChange(newVal ? newVal : '');
  };

  const groupedItemTemplate = (option: { label: string }) => {
    return (
      <div id='dropdown-group-heading' className=''>
        {option.label}
      </div>
    );
  };

  return (
    <div className='mb-1'>
      <div className='flex w-full'>
        <Dropdown
          id='dropdown-data-filter-group'
          className='w-full '
          placeholder='Search'
          value={dropdownState}
          options={SUGGESTED_REGEX_FILTER}
          onChange={handleInputChange}
          optionLabel='label'
          optionGroupLabel='label'
          optionGroupChildren='items'
          editable
          showClear
          optionGroupTemplate={groupedItemTemplate}
        />
        <Button
          onClick={() => handleFilterChange(dropdownState)}
          icon='pi pi-search'
          className='ml-2 p-button-outlined p-button-secondary'
        />
      </div>

      <div className='text-sm py-2'>
        The above dropdown list shows the suggested filter for stored objects. Alternatively, you
        could type your own regex and click on the search button.
      </div>
    </div>
  );
}

export default DataSearchFilterButton;

// The following constants is using template for group Dropdown component in 'primereact/dropdown'
// Ref: https://www.primefaces.org/primereact/dropdown/
const SUGGESTED_REGEX_FILTER = [
  {
    label: 'UMCCRISED',
    items: [
      {
        label: 'Cancer Report Tables',
        value: 'umccrised cancer_report_tables .tsv.gz$',
      },
      {
        label: 'Cancer Report',
        value: 'umccrised cancer_report.html$',
      },
      {
        label: 'VCF',
        value: 'umccrised/[^(work)*] small_variants/[^\\/]*(.vcf.gz$|.maf$)',
      },
      {
        label: 'WGS QC',
        value: 'umccrised multiqc_report.html$',
      },
      {
        label: 'PCGR CPSR',
        value: 'umccrised/[^\\/]*/[^\\/]*(pcgr|cpsr).html$',
      },
      {
        label: 'Coverage',
        value: 'umccrised/[^\\/]*/[^\\/]*(normal|tumor).cacao.html$',
      },
    ],
  },
  {
    label: 'Whole Transcriptome Sequencing (WTS)',
    items: [
      { label: 'WTS bam', value: 'wts ready .bam$' },
      {
        label: 'WTS qc',
        value: 'wts multiqc/ multiqc_report.html$',
      },
    ],
  },
  {
    label: 'Whole Genome Sequencing (WGS)',
    items: [{ label: 'WGS bam', value: 'wgs ready .bam$' }],
  },
  {
    label: 'RNAsum',
    items: [
      {
        label: 'RNAsum Report',
        value: 'RNAseq_report.html$',
      },
    ],
  },
  {
    label: 'GRIDSS/PURPLE/LINX (GPL)',
    items: [{ label: 'GPL Report', value: 'gridss_purple_linx linx.html$' }],
  },
  {
    label: 'File Types',
    items: [
      { label: 'HTML', value: '.html$' },
      { label: 'FASTQ', value: '.fastq.gz$' },
    ],
  },
];

// The isDefaultRegex will check if string passed is part of the current regex const.
const isDefaultRegex = (currentVal: string | undefined): boolean => {
  if (!currentVal) return true;

  for (const groupFilter of SUGGESTED_REGEX_FILTER) {
    if (groupFilter.items && groupFilter.items.length) {
      for (const dropdownObj of groupFilter.items) {
        if (dropdownObj.value == currentVal) {
          return true;
        }
      }
    }
  }
  return false;
};
