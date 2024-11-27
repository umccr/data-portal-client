import React from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import { useParams } from 'react-router-dom';
import './index.css';
import GDSDataTable from '../../../containers/gds/GDSDataTable';
import S3DataTable from '../../../containers/s3/S3DataTable';
import { PresetDataFactory } from '../../../components/search/PresetDataFactory';
import { Message } from 'primereact/message';

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
        <TabPanel header='S3'>
          <S3DataTable defaultQueryParam={{ subject: subjectId }} chipData={chipDataS3} />
        </TabPanel>
        <TabPanel header='GDS'>
          <div className='bg-yellow-100 p-3'>
            <Message
              className='w-full mb-3 bg-yellow-100'
              severity='warn'
              text='DATA UNDER MIGRATION'
              pt={{ text: { className: 'font-bold' } }}
            />
            <GDSDataTable defaultQueryParam={{ subject: subjectId }} chipData={chipDataGDS} />
          </div>
        </TabPanel>
      </TabView>
    </div>
  );
}

export default SubjectDataPage;
