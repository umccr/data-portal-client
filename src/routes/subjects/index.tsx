import React from 'react';
import { Routes as RouterRoutes, Route, Outlet, Navigate } from 'react-router-dom';

// Layout Component
import Breadcrumbs from '../../layouts/Breadcrumbs';
import SideBar from '../../layouts/SideBar';

// Page Component
import SubjectSideBar from '../../containers/subjects/SubjectSideBar';
import SubjectTablePage from '../../pages/subjects/SubjectTablePage';
import SubjectOverviewPage from '../../pages/subjects/SubjectOverviewPage';

function SubjectRoutes() {
  return (
    <RouterRoutes>
      <Route path='/'>
        <Route index element={<SubjectTablePage />} />
        <Route path=':subjectId' element={<SubjectPageLayout />}>
          <Route index element={<Navigate to='overview' />} />
          <Route path='overview' element={<SubjectOverviewPage />} />
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
