import React from 'react';

import MetadataTable from '../../containers/metadata/MetadataTable';

function MetadataPage() {
  // Will display the whole page with metadata table
  return (
    <div className='px-5 py-3'>
      <MetadataTable />
    </div>
  );
}

export default MetadataPage;
