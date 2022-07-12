import React from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import { useParams } from 'react-router-dom';
import './index.css';
import S3SubjectDataTable from '../../../containers/subjects/S3SubjectDataTable';
import GDSSubjectDataTable from '../../../containers/subjects/GDSSubjectDataTable';

function SubjectDataPage() {
  const { subjectId } = useParams();

  if (!subjectId) {
    return <div>No SubjectId</div>;
  }

  return (
    <div className='mb-3 w-auto' style={{ minWidth: '80%' }}>
      <TabView renderActiveOnly className='border-round-md overflow-hidden'>
        <TabPanel header='S3'>
          <S3SubjectDataTable subjectId={subjectId} />
        </TabPanel>
        <TabPanel header='GDS'>
          <GDSSubjectDataTable subjectId={subjectId} />
        </TabPanel>
      </TabView>
    </div>
  );
}

export default SubjectDataPage;
