import React, { useCallback, useState } from 'react';
import SideBar from '../../layouts/SideBar';
import LIMSTable from '../../containers/lims/LIMSTable';
import LimsSideBar from '../../containers/lims/LimsSideBar';

function HomePage() {
  const initQueryParam: Record<string, string[] | number[]> = {
    workflow: ['clinical', 'research', 'control'],
  };

  const [defaultQueryParam, setDefaultQueryParam] = useState(initQueryParam);

  const handleFilterApplied = useCallback(
    (filteredQueryParam: Record<string, string[] | number[]>) => {
      setDefaultQueryParam({ ...filteredQueryParam });
    },
    [defaultQueryParam]
  );

  return (
    <SideBar
      mainPageElement={<LIMSTable defaultQueryParam={defaultQueryParam} />}
      sideBarElement={
        <LimsSideBar defaultQueryParam={defaultQueryParam} handleApply={handleFilterApplied} />
      }
    />

    // <SideBar
    //   mainPageElement={
    //     <Card title={'Hello'}>
    //       <p>Lorem Ipsum</p>
    //     </Card>
    //   }
    //   sideBarElement={
    //     <Card title={'Side'}>
    //       <p>Umm</p>
    //     </Card>
    //   }
    // />

    // <div>
    //   <div className='grid'>
    //     <div className='col-2'>
    //       <>P</>
    //     </div>
    //     <div className='col-10 px-5 py-3'>
    //       <Card className='p-0'>
    //         <LIMSTable />
    //       </Card>
    //     </div>
    //   </div>
    // </div>
  );
}

export default HomePage;
