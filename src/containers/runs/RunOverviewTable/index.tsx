import React from 'react';
import JSONToTable from '../../../components/JSONToTable';
import { Dropdown } from 'primereact/dropdown';
import { usePortalRunsAPI } from '../../../api/run';
import { useToastContext } from '../../../providers/ToastProvider';
import CircularLoaderWithText from '../../../components/CircularLoaderWithText';
import { useNavigate } from 'react-router-dom';
import { usePortalSequenceAPI } from '../../../api/sequence';

type Props = { runId: string };

function RunOverviewTable({ runId }: Props) {
  const toast = useToastContext();
  const navigate = useNavigate();
  const runsQuery = usePortalRunsAPI({
    queryStringParameters: { rowsPerPage: 1000 }, // TODO: make it dynamic or load more
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
      <div className='mb-5'>
        <Dropdown
          className='w-full'
          value={runId}
          options={runsResults}
          onChange={(e) => navigate(`../../${e.target.value}`)}
          virtualScrollerOptions={{ itemSize: 38 }}
          placeholder='Select Run'
        />
      </div>

      {sequenceQuery.data && <JSONToTable objData={sequenceInfo} />}
    </div>
  );
}

export default RunOverviewTable;
