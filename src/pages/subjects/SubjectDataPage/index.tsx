import React from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import { useParams } from 'react-router-dom';
import './index.css';
import GDSDataTable from '../../../containers/gds/GDSDataTable';
import S3DataTable from '../../../containers/s3/S3DataTable';
import { PresetDataFactory } from '../../../components/search/PresetDataFactory';

function SubjectDataPage() {
  const { subjectId } = useParams();

  if (!subjectId) {
    return <div>No Subject Id Provided</div>;
  }

  const chipDataS3: Record<string, string | number>[] = PresetDataFactory.buildAnalysisDataS3();
  const chipDataGDS: Record<string, string | number>[] = PresetDataFactory.buildAnalysisDataGDS();

  return (
    <div className='mb-3 w-auto' style={{ minWidth: '80%' }}>
      <TabView renderActiveOnly className='border-round-md overflow-hidden'>
        <TabPanel header='GDS'>
          <GDSDataTable defaultQueryParam={{ subject: subjectId }} chipData={chipDataGDS} />
        </TabPanel>
        <TabPanel header='S3'>
          <S3DataTable defaultQueryParam={{ subject: subjectId }} chipData={chipDataS3} />
        </TabPanel>
      </TabView>
    </div>
  );
}

export default SubjectDataPage;
