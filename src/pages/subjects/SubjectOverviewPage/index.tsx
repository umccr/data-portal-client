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
          className='min-w-max max-w-max xl:w-5 m-3 inline-block vertical-align-top'
          header='Overview'>
          <SubjectOverviewTable subjectId={subjectId} />
        </Panel>
        <Panel
          className='max-w-full m-3 inline-block vertical-align-top'
          header='Sample Information'>
          <SampleInformationTable subjectId={subjectId} />
        </Panel>
        <Panel className='max-w-full m-3 inline-block vertical-align-top' header='Analysis Result'>
          <div>Analysis Result</div>
        </Panel>
      </div>
    </div>
  );
}

export default SubjectOverviewPage;
