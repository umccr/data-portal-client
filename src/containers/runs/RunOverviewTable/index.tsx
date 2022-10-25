import React, { useState } from 'react';
import JSONToTable from '../../../components/JSONToTable';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { usePortalRunsAPI } from '../../../api/run';
import { useToastContext } from '../../../providers/ToastProvider';
import CircularLoaderWithText from '../../../components/CircularLoaderWithText';
import { useNavigate } from 'react-router-dom';
import { usePortalSequenceAPI } from '../../../api/sequence';

type Props = { runId: string };

function RunOverviewTable({ runId }: Props) {
  const toast = useToastContext();
  const navigate = useNavigate();

  const [inputRunId, setInputRunId] = useState<string>(runId);
  const runsQuery = usePortalRunsAPI({
    queryStringParameters: { rowsPerPage: 250 },
  });
  const sequenceQuery = usePortalSequenceAPI({
    queryStringParameters: { instrument_run_id: runId },
  });

  if (runsQuery.isLoading || sequenceQuery.isLoading) {
    return <CircularLoaderWithText />;
  }

  if (runsQuery.isError || sequenceQuery.isError) {
    toast?.show({
      severity: 'error',
      summary: 'Something went wrong!',
      detail: 'Unable to fetch data from Portal API',
      life: 3000,
    });
  }

  const runsResults = runsQuery.data.results;
  if (!runsResults.length) return <div>No data found!</div>;

  const sequenceResults = sequenceQuery.data.results;
  if (!sequenceResults.length) return <div>No RUN ID found!</div>; // In real scenario should not happen
  const sequenceInfo = sequenceResults[0];
  return (
    <div>
      <div className='mb-3'>
        <div className='flex'>
          <Dropdown
            className='flex-1'
            value={inputRunId}
            options={runsResults}
            onChange={(e) => setInputRunId(e.value)}
            virtualScrollerOptions={{ itemSize: 38 }}
            editable
            placeholder='Select Run'
          />
          <Button
            onClick={() => navigate(`../../${inputRunId}`)}
            icon='pi pi-search'
            label='Search'
            className='mx-2 p-button-outlined p-button-secondary'
          />
        </div>

        <div id='helper-text' className='block p-2 text-500'>
          <div className='text-xs inline'>
            run_id dropdown list will only show the last 250 runs. Otherwise, copy and paste run_id
            to the field above.
          </div>
        </div>
      </div>

      {sequenceQuery.data && <JSONToTable objData={sequenceInfo} />}
    </div>
  );
}

export default RunOverviewTable;
