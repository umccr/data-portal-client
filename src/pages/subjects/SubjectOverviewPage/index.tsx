import React from 'react';
import { Panel } from 'primereact/panel';
import { useParams } from 'react-router-dom';

// Subject custom component
import SubjectOverviewTable from '../../../containers/subjects/SubjectOverviewTable';

function SubjectOverviewPage() {
  const { subjectId } = useParams();

  if (!subjectId) {
    return <div>No SubjectId found</div>;
  }

  return (
    <div>
      <div className='mt-3'>
        <Panel header='Overview'>
          <SubjectOverviewTable subjectId={subjectId} />
        </Panel>
      </div>
    </div>
  );
}

export default SubjectOverviewPage;
