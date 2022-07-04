import React from 'react';
import { Panel } from 'primereact/panel';
import { useParams } from 'react-router-dom';

// Subject custom component
import SubjectOverviewTable from '../../../containers/subjects/SubjectOverviewTable';
import SampleInformationTable from '../../../containers/subjects/SampleInformationTable';

function SubjectOverviewPage() {
  const { subjectId } = useParams();

  if (!subjectId) {
    return <div>No SubjectId found</div>;
  }

  return (
    <div>
      <div className=''>
        <Panel
          className='mt-3 mr-3 inline-block vertical-align-top'
          header='Overview'
          style={{ minWidth: '750px' }}>
          <SubjectOverviewTable subjectId={subjectId} />
        </Panel>
        <Panel
          className='mt-3 mr-3 inline-block vertical-align-top'
          header='Sample Information'
          style={{ minWidth: '750px' }}
          toggleable>
          <SampleInformationTable subjectId={subjectId} />
        </Panel>
        <Panel
          className='mt-3 mr-3 inline-block vertical-align-top'
          header='Analysis Result'
          style={{ minWidth: '750px' }}
          toggleable>
          <div>Analysis Result</div>
        </Panel>
      </div>
    </div>
  );
}

export default SubjectOverviewPage;
