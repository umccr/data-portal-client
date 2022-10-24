import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { Panel } from 'primereact/panel';
import RunOverviewTable from '../../../containers/runs/RunOverviewTable';
import { usePortalRunsAPI } from '../../../api/run';
import CircularLoaderWithText from '../../../components/CircularLoaderWithText';

function RunOverviewPage() {
  const { runId } = useParams();

  const runsQuery = usePortalRunsAPI(
    {
      queryStringParameters: { rowsPerPage: 250 }, // TODO: make it dynamic or load more
    },
    { enabled: !runId }
  );

  if (!runId) {
    if (runsQuery.isLoading) return <CircularLoaderWithText />;
    const resultData = runsQuery.data.results;
    if (!resultData.length) return <div>No run data found!</div>;

    const recentRunId = resultData[0];
    return <Navigate to={`${recentRunId}`} />;
  }

  return (
    <div className=''>
      <Panel className='mb-3 mr-3 inline-block vertical-align-top w-12' header='Overview'>
        <RunOverviewTable runId={runId} />
      </Panel>
    </div>
  );
}

export default RunOverviewPage;
