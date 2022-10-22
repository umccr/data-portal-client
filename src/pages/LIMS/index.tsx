import React from 'react';
import { Card } from 'primereact/card';

import LIMSTable from '../../containers/lims/LIMSTable';
function LIMSPage() {
  return (
    <div className='px-5 py-3'>
      <Card className='p-0'>
        <div className='font-bold text-2xl pb-3'>LIMS Table</div>
        <LIMSTable />
      </Card>
    </div>
  );
}

export default LIMSPage;
