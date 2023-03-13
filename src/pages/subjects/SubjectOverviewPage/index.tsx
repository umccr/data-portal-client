import React from 'react';
import { Panel } from 'primereact/panel';
import { useParams } from 'react-router-dom';

// Subject custom component
import SubjectOverviewTable from '../../../containers/subjects/SubjectOverviewTable';
import SampleInformationTable from '../../../containers/subjects/SampleInformationTable';
import AnalysisResultsTable from '../../../containers/subjects/AnalysisResultTable';
import SubjectFeatureTable from '../../../containers/subjects/SubjectFeatureTable';

function SubjectOverviewPage() {
  const { subjectId } = useParams();

  if (!subjectId) {
    return <div>No SubjectId found</div>;
  }

  return (
    <div className={'grid'}>
      <div className={'col-12 lg:col-4'}>
        <Panel className='mb-3 mr-3 inline-block vertical-align-top w-12' header='Overview'>
          <SubjectOverviewTable subjectId={subjectId} />
        </Panel>
        <Panel header={'Feature'} toggleable={true} style={{ marginTop: '1em' }}>
          <SubjectFeatureTable subjectId={subjectId} />
        </Panel>
      </div>
      <div className={'col-12 lg:col-8'}>
        <Panel
          className='mb-3 mr-3 inline-block vertical-align-top w-12'
          header='Sample Information'
          toggleable>
          <SampleInformationTable subjectId={subjectId} />
        </Panel>
        <Panel
          className='mb-3 mr-3 inline-block vertical-align-top w-12'
          header='Analysis Results'
          toggleable>
          <AnalysisResultsTable subjectId={subjectId} />
        </Panel>
      </div>
    </div>
  );
}

export default SubjectOverviewPage;
