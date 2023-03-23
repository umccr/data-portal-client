import React from 'react';
import { useParams } from 'react-router-dom';
import { TabView, TabPanel } from 'primereact/tabview';
import GDSDataTable from '../../../containers/gds/GDSDataTable';
import S3DataTable from '../../../containers/s3/S3DataTable';
import { PresetDataFactory } from '../../../components/search/PresetDataFactory';

function RunDataPage() {
  const { runId } = useParams();

  if (!runId) return <div></div>;

  const primaryData: Record<string, string | number>[] = PresetDataFactory.buildPrimaryData();

  return (
    <div className='mb-3 w-auto' style={{ minWidth: '80%' }}>
      <TabView renderActiveOnly className='border-round-md overflow-hidden'>
        <TabPanel header='GDS'>
          <GDSDataTable defaultQueryParam={{ run: runId }} chipData={primaryData} />
        </TabPanel>
        <TabPanel header='S3'>
          <S3DataTable defaultQueryParam={{ run: runId }} chipData={primaryData} />
        </TabPanel>
      </TabView>
    </div>
  );
}

export default RunDataPage;
