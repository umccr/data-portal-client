import React from 'react';
import SubjectCard from '../../containers/home/SubjectCard';
import MetadataHomeCard from '../../containers/home/MetadataCard';
import LimsHomeCard from '../../containers/home/LimsCard';
import SequenceHomeCard from '../../containers/home/SequenceCard';

function HomePage() {
  return (
    <>
      <div className='grid px-5 py-3'>
        <div className='col-12 lg:col-6 xl:col-3'>
          <SubjectCard />
        </div>
        <div className='col-12 lg:col-6 xl:col-3'>
          <MetadataHomeCard />
        </div>
        <div className='col-12 lg:col-6 xl:col-3'>
          <LimsHomeCard />
        </div>
        <div className='col-12 lg:col-6 xl:col-3'>
          <SequenceHomeCard />
        </div>
      </div>
      {/* Idea is to put charts from portal data here. */}
      {/* Might need to have an api to do so */}
    </>
  );
}

export default HomePage;
