import React from 'react';
import SubjectCard from '../../containers/home/SubjectCard';
import MetadataHomeCard from '../../containers/home/MetadataCard';
import LimsHomeCard from '../../containers/home/LimsCard';
import SequenceHomeCard from '../../containers/home/SequenceCard';
import RunHomeCard from '../../containers/home/RunsCard';

function HomePage() {
  return (
    <>
      <div className='mt-3 w-full h-full flex flex-column align-items-center'>
        <div className='w-9 h-8rem p-2'>
          <SubjectCard />
        </div>
        <div className='w-9 h-8rem p-2'>
          <MetadataHomeCard />
        </div>
        <div className='w-9 h-8rem p-2'>
          <RunHomeCard />
        </div>
        {/* <div className='w-9 h-8rem p-2'>
          <LimsHomeCard />
        </div> */}
        <div className='w-9 h-8rem p-2'>
          <SequenceHomeCard />
        </div>
      </div>
      {/* Idea is to put charts from portal data here. */}
      {/* Might need to have an api to do so */}
    </>
  );
}

export default HomePage;
