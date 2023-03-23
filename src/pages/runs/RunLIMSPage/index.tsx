import { Card } from 'primereact/card';
import React from 'react';
import { useParams } from 'react-router-dom';
import LIMSTable from '../../../containers/lims/LIMSTable';

function RunLIMSPage() {
  const { runId } = useParams();

  if (!runId) return <div></div>;

  return (
    <Card className='mb-3 w-auto' style={{ minWidth: '80%' }}>
      <div className='font-bold text-2xl pb-3'>LIMS Table</div>
      <LIMSTable defaultQueryParam={{ run: [runId] }} />
    </Card>
  );
}

export default RunLIMSPage;
