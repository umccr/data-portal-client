import React, { useEffect, useState } from 'react';
import { MultiSelect } from 'primereact/multiselect';
import { Fieldset } from 'primereact/fieldset';
import { Button } from 'primereact/button';
import { usePortalLimsByAggregateCount } from '../../../api/lims';
import { useToastContext } from '../../../providers/ToastProvider';

type Props = {
  handleApply: (filteredQueryParam: Record<string, string[] | number[]>) => void;
};

function LimsSideBar({ handleApply }: Props) {
  const { toastShow } = useToastContext();

  const initMetaWorkflows: Record<string, string | number>[] = [];
  const initMetaProjectOwners: Record<string, string | number>[] = [];
  const initMetaProjectNames: Record<string, string | number>[] = [];
  const initMetaPhenotypes: Record<string, string | number>[] = [];
  const initMetaTypes: Record<string, string | number>[] = [];
  const initMetaAssays: Record<string, string | number>[] = [];
  const initMetaSources: Record<string, string | number>[] = [];

  const [selectedMetaWorkflows, setSelectedMetaWorkflows] = useState(initMetaWorkflows);
  const [selectedMetaProjectOwners, setSelectedMetaProjectOwners] = useState(initMetaProjectOwners);
  const [selectedMetaProjectNames, setSelectedMetaProjectNames] = useState(initMetaProjectNames);
  const [selectedMetaPhenotypes, setSelectedMetaPhenotypes] = useState(initMetaPhenotypes);
  const [selectedMetaTypes, setSelectedMetaTypes] = useState(initMetaTypes);
  const [selectedMetaAssays, setSelectedMetaAssays] = useState(initMetaAssays);
  const [selectedMetaSources, setSelectedMetaSources] = useState(initMetaSources);

  const metaWorkflows: Record<string, string | number>[] = [];
  const metaProjectOwners: Record<string, string | number>[] = [];
  const metaProjectNames: Record<string, string | number>[] = [];
  const metaPhenotypes: Record<string, string | number>[] = [];
  const metaTypes: Record<string, string | number>[] = [];
  const metaAssays: Record<string, string | number>[] = [];
  const metaSources: Record<string, string | number>[] = [];

  const { isFetching, isLoading, isError, data } = usePortalLimsByAggregateCount({
    queryParams: {
      fields: 'all',
    },
  });

  useEffect(() => {
    if (isError) {
      toastShow({
        severity: 'error',
        summary: 'Something went wrong!',
        detail: 'Unable to fetch data from Portal API',
        life: 3000,
      });
    }
  }, [isError]);

  if (data && !isFetching && !isLoading) {
    const { assay, phenotype, project_name, project_owner, source, type, workflow } = data;
    for (const w of workflow) {
      if (w.workflow == null) {
        continue;
      }
      metaWorkflows.push({
        name: w.workflow,
        code: w.workflow,
      });
    }

    for (const po of project_owner) {
      if (po.project_owner == null) {
        continue;
      }
      metaProjectOwners.push({
        name: po.project_owner,
        code: po.project_owner,
      });
    }

    for (const pn of project_name) {
      if (pn.project_name == null) {
        continue;
      }
      metaProjectNames.push({
        name: pn.project_name,
        code: pn.project_name,
      });
    }

    for (const pt of phenotype) {
      if (pt.phenotype == null) {
        continue;
      }
      metaPhenotypes.push({
        name: pt.phenotype,
        code: pt.phenotype,
      });
    }

    for (const t of type) {
      if (t.type == null) {
        continue;
      }
      metaTypes.push({
        name: t.type,
        code: t.type,
      });
    }

    for (const a of assay) {
      if (a.assay == null) {
        continue;
      }
      metaAssays.push({
        name: a.assay,
        code: a.assay,
      });
    }

    for (const src of source) {
      if (src.source == null) {
        continue;
      }
      metaSources.push({
        name: src.source,
        code: src.source,
      });
    }
  }

  // TODO: this does not work yet -- how do we set initial selected/filtered state
  // useEffect(() => {
  //   const initWorkflow = [
  //     { name: 'clinical', code: 'clinical' },
  //     { name: 'research', code: 'research' },
  //     { name: 'control', code: 'control' },
  //   ];
  //
  //   setSelectedMetaWorkflows({ ...initWorkflow });
  // }, [data]);

  const apply = () => {
    const filteredQueryParam: Record<string, string[] | number[]> = {};

    if (selectedMetaWorkflows.length) {
      const workflows = selectedMetaWorkflows.map((w) => w.code);
      filteredQueryParam['workflow'] = workflows as string[];
    }

    if (selectedMetaProjectNames.length) {
      const projects = selectedMetaProjectNames.map((pn) => pn.code);
      filteredQueryParam['project_name'] = projects as string[];
    }

    if (selectedMetaProjectOwners.length) {
      const owners = selectedMetaProjectOwners.map((po) => po.code);
      filteredQueryParam['project_owner'] = owners as string[];
    }

    if (selectedMetaPhenotypes.length) {
      const phenotypes = selectedMetaPhenotypes.map((pt) => pt.code);
      filteredQueryParam['phenotype'] = phenotypes as string[];
    }

    if (selectedMetaTypes.length) {
      const types = selectedMetaTypes.map((t) => t.code);
      filteredQueryParam['type'] = types as string[];
    }

    if (selectedMetaAssays.length) {
      const assays = selectedMetaAssays.map((a) => a.code);
      filteredQueryParam['assay'] = assays as string[];
    }

    if (selectedMetaSources.length) {
      const sources = selectedMetaSources.map((src) => src.code);
      filteredQueryParam['source'] = sources as string[];
    }
    console.log(filteredQueryParam);

    handleApply(filteredQueryParam);
  };

  return (
    <div className='flex flex-column'>
      {/* Sidebar Title */}
      <div
        id='subject-sidebar-title'
        className='cursor-pointer font-bold text-3xl border-bottom-1 border-gray-300'
        style={{ padding: '1.5rem 1.5rem 1.5rem' }}>
        Filters
      </div>

      <div className='flex justify-content-center py-2'>
        <Fieldset legend='Meta Workflow'>
          <MultiSelect
            value={selectedMetaWorkflows}
            onChange={(e) => setSelectedMetaWorkflows(e.value)}
            options={metaWorkflows}
            optionLabel='name'
            display='chip'
            filter
            // showClear
            placeholder='Select Workflow'
            maxSelectedLabels={2}
            className='w-full md:w-15rem'
          />
        </Fieldset>
      </div>
      <div className='flex justify-content-center py-2'>
        <Fieldset legend='Project'>
          <MultiSelect
            value={selectedMetaProjectNames}
            onChange={(e) => setSelectedMetaProjectNames(e.value)}
            options={metaProjectNames}
            optionLabel='name'
            display='chip'
            filter
            placeholder='Select Project Name'
            maxSelectedLabels={2}
            className='w-full md:w-15rem'
          />
        </Fieldset>
      </div>
      <div className='flex justify-content-center py-2'>
        <Fieldset legend='PI'>
          <MultiSelect
            value={selectedMetaProjectOwners}
            onChange={(e) => setSelectedMetaProjectOwners(e.value)}
            options={metaProjectOwners}
            optionLabel='name'
            display='chip'
            filter
            placeholder='Select Project Owner'
            maxSelectedLabels={2}
            className='w-full md:w-15rem'
          />
        </Fieldset>
      </div>
      <div className='flex justify-content-center py-2'>
        <Fieldset legend='Phenotype'>
          <MultiSelect
            value={selectedMetaPhenotypes}
            onChange={(e) => setSelectedMetaPhenotypes(e.value)}
            options={metaPhenotypes}
            optionLabel='name'
            display='chip'
            filter
            placeholder='Select Phenotype'
            maxSelectedLabels={2}
            className='w-full md:w-15rem'
          />
        </Fieldset>
      </div>
      <div className='flex justify-content-center py-2'>
        <Fieldset legend='Type'>
          <MultiSelect
            value={selectedMetaTypes}
            onChange={(e) => setSelectedMetaTypes(e.value)}
            options={metaTypes}
            optionLabel='name'
            display='chip'
            filter
            placeholder='Select Type'
            maxSelectedLabels={2}
            className='w-full md:w-15rem'
          />
        </Fieldset>
      </div>
      <div className='flex justify-content-center py-2'>
        <Fieldset legend='Assay'>
          <MultiSelect
            value={selectedMetaAssays}
            onChange={(e) => setSelectedMetaAssays(e.value)}
            options={metaAssays}
            optionLabel='name'
            display='chip'
            filter
            placeholder='Select Assay'
            maxSelectedLabels={2}
            className='w-full md:w-15rem'
          />
        </Fieldset>
      </div>
      <div className='flex justify-content-center py-2'>
        <Fieldset legend='Source'>
          <MultiSelect
            value={selectedMetaSources}
            onChange={(e) => setSelectedMetaSources(e.value)}
            options={metaSources}
            optionLabel='name'
            display='chip'
            filter
            placeholder='Select Source'
            maxSelectedLabels={2}
            className='w-full md:w-15rem'
          />
        </Fieldset>
      </div>
      <div className='flex justify-content-center py-3'>
        <Button className='p-button-raised bg-primary w-18rem' label={'Apply'} onClick={apply} />
      </div>
    </div>
  );
}

export default LimsSideBar;
