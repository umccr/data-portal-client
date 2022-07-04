import React from 'react';
import SubjectListTable from '../../../containers/subjects/SubjectListTable';

function SubjectPage() {
  return (
    <div className='card border-round py-5 px-7' style={{ height: 'calc(100vh - 145px)' }}>
      <div className='mb-3'>
        <div className='font-bold text-2xl'>Subject Table</div>
      </div>
      <SubjectListTable />
    </div>
  );
}

export default SubjectPage;
