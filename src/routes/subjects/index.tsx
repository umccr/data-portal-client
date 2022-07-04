import React from 'react';

import { Routes as RouterRoutes, Route, Outlet, Navigate } from 'react-router-dom';
import Breadcrumbs from '../../layouts/Breadcrumbs';
import SubjectPage from '../../pages/subjects/SubjectPage';
import SubjectSideBar from '../../containers/subjects/SubjectSideBar';
import SideBar from '../../layouts/SideBar';
function SubjectRoutes() {
  return (
    <RouterRoutes>
      <Route path='/'>
        <Route index element={<SubjectPage />} />
        <Route path=':subjectId' element={<SubjectPageLayout />}>
          <Route index element={<Navigate to='summary' />} />
          <Route path='summary' element={<div>Summary</div>} />
          <Route path='subject-data' element={<div>Subject Data</div>} />
          <Route path='igv' element={<div>igv</div>} />
          <Route path='file-viewer' element={<div>File Viewer</div>} />
          <Route path='launch-pad' element={<div>launch</div>} />
        </Route>
      </Route>
    </RouterRoutes>
  );
}

export default SubjectRoutes;

function SubjectPageLayout() {
  return (
    <SideBar
      sideBarElement={<SubjectSideBar />}
      mainPageElement={
        <div className='px-5 py-3'>
          <Breadcrumbs />
          <Outlet />
        </div>
      }
    />
  );
}
