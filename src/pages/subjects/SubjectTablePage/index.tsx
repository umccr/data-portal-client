import React from 'react';
import SubjectListTable from '../../../containers/subjects/SubjectListTable';

function SubjectPage() {
  return (
    <div className='card border-round py-5 px-7' style={{ height: 'calc(100vh - 145px)' }}>
      <SubjectListTable />
    </div>
  );
}

export default SubjectPage;
