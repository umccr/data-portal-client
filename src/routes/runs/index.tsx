import React from 'react';
import { Routes as RouterRoutes, Route, Outlet, Navigate } from 'react-router-dom';
import RunSideBar from '../../containers/runs/RunSideBar';

// Layout Component
import Breadcrumbs from '../../layouts/Breadcrumbs';
import SideBar from '../../layouts/SideBar';
import RunDataPage from '../../pages/runs/RunDataPage';
import RunMetadataPage from '../../pages/runs/RunMetadataPage';
import RunOverviewPage from '../../pages/runs/RunOverviewPage';

function RunRoutes() {
  return (
    <RouterRoutes>
      <Route path='/'>
        <Route index element={<RunOverviewPage />} />
        <Route path=':runId' element={<RunPageLayout />}>
          <Route index element={<Navigate to='overview' />} />
          <Route path='overview' element={<RunOverviewPage />} />
          <Route path='run-data' element={<RunDataPage />} />
          <Route path='metadata' element={<RunMetadataPage />} />
        </Route>
      </Route>
    </RouterRoutes>
  );
}

export default RunRoutes;

function RunPageLayout() {
  return (
    <SideBar
      sideBarElement={<RunSideBar />}
      mainPageElement={
        <>
          <Breadcrumbs />
          <Outlet />
        </>
      }
    />
  );
}
