import React from 'react';
import { Routes as RouterRoutes, Route, Outlet, Navigate } from 'react-router-dom';

// Layout Component
import Breadcrumbs from '../../layouts/Breadcrumbs';
import SideBar from '../../layouts/SideBar';

// Page Component
import SubjectSideBar from '../../containers/subjects/SubjectSideBar';
import SubjectTablePage from '../../pages/subjects/SubjectTablePage';
import SubjectOverviewPage from '../../pages/subjects/SubjectOverviewPage';
import SubjectDataPage from '../../pages/subjects/SubjectDataPage';
import SubjectIGVPage from '../../pages/subjects/SubjectIGVPage';
import SubjectFileViewerPage from '../../pages/subjects/SubjectFileViewerPage';
import SubjectLaunchPad from '../../pages/subjects/SubjectLaunchPad';

function SubjectRoutes() {
  return (
    <RouterRoutes>
      <Route path='/'>
        <Route index element={<SubjectTablePage />} />
        <Route path=':subjectId' element={<SubjectPageLayout />}>
          <Route index element={<Navigate to='overview' />} />
          <Route path='overview' element={<SubjectOverviewPage />} />
          <Route path='subject-data' element={<SubjectDataPage />} />
          <Route path='igv' element={<SubjectIGVPage />} />
          <Route path='file-viewer' element={<SubjectFileViewerPage />} />
          <Route path='launch-pad/*' element={<SubjectLaunchPad />} />
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
        <>
          <Breadcrumbs />
          <Outlet />
        </>
      }
    />
  );
}
