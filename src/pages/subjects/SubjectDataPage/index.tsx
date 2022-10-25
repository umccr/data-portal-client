import React from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import { useParams } from 'react-router-dom';
import './index.css';
import GDSDataTable from '../../../containers/gds/GDSDataTable';
import S3DataTable from '../../../containers/s3/S3DataTable';

function SubjectDataPage() {
  const { subjectId } = useParams();

  if (!subjectId) {
    return <div>No SubjectId</div>;
  }

  return (
    <div className='mb-3 w-auto' style={{ minWidth: '80%' }}>
      <TabView renderActiveOnly className='border-round-md overflow-hidden'>
        <TabPanel header='GDS'>
          <GDSDataTable defaultQueryParam={{ subject: subjectId }} />
        </TabPanel>
        <TabPanel header='S3'>
          <S3DataTable defaultQueryParam={{ subject: subjectId }} />
        </TabPanel>
      </TabView>
    </div>
  );
}

export default SubjectDataPage;
