import React from 'react';
import { useParams } from 'react-router-dom';
import LIMSTable from '../../../containers/lims/LIMSTable';

function RunMetadataPage() {
  const { runId } = useParams();

  if (!runId) return <div></div>;

  return (
    <div className='mb-3 w-auto' style={{ minWidth: '80%' }}>
      <LIMSTable defaultQueryParam={{ run: runId }} />
    </div>
  );
}

export default RunMetadataPage;
